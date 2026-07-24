use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

// ─── Estado global de procesos activos ────────────────────────────────────────
pub struct ActiveDownloads(pub Arc<Mutex<HashMap<String, tauri_plugin_shell::process::CommandChild>>>);

// ─── Estructuras de datos ──────────────────────────────────────────────────────
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct VideoMetadata {
    pub id: String,
    pub title: String,
    pub uploader: Option<String>,
    pub duration: Option<f64>,
    pub thumbnail: Option<String>,
    pub webpage_url: String,
    pub formats: Vec<VideoFormat>,
    pub is_playlist: bool,
    pub playlist_count: Option<u64>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct VideoFormat {
    pub format_id: String,
    pub format_note: Option<String>,
    pub ext: String,
    pub resolution: Option<String>,
    pub fps: Option<f64>,
    pub vcodec: Option<String>,
    pub acodec: Option<String>,
    pub filesize: Option<u64>,
    pub tbr: Option<f64>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DownloadProgress {
    pub download_id: String,
    pub status: String,       // "downloading" | "merging" | "finished" | "error"
    pub percent: f64,
    pub speed: Option<String>,
    pub eta: Option<String>,
    pub filename: Option<String>,
    pub message: Option<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct DownloadRequest {
    pub download_id: String,
    pub url: String,
    pub format_id: Option<String>,
    pub output_dir: String,
    pub audio_only: bool,
    pub embed_subs: bool,
    pub time_from: Option<String>, // HH:MM:SS
    pub time_to: Option<String>,   // HH:MM:SS
    pub extra_args: Option<Vec<String>>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct AppConfig {
    pub output_dir: String,
    pub default_format: String,
    pub audio_only: bool,
    pub embed_subs: bool,
    pub concurrent_downloads: u8,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        let downloads = dirs::download_dir()
            .unwrap_or_else(|| std::path::PathBuf::from("."))
            .to_string_lossy()
            .to_string();
        AppConfig {
            output_dir: downloads,
            default_format: "bestvideo+bestaudio".to_string(),
            audio_only: false,
            embed_subs: false,
            concurrent_downloads: 3,
            theme: "dark".to_string(),
        }
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
fn get_config_path(app: &AppHandle) -> std::path::PathBuf {
    app.path()
        .app_data_dir()
        .unwrap()
        .join("config.json")
}

fn ytdlp_bin(app: &AppHandle) -> tauri_plugin_shell::process::Command {
    app.shell().sidecar("yt-dlp").unwrap()
}

fn ffmpeg_bin(app: &AppHandle) -> tauri_plugin_shell::process::Command {
    app.shell().sidecar("ffmpeg").unwrap()
}

// ─── Módulo de Comandos Tauri ──────────────────────────────────────────────────
pub mod commands {
    use super::*;

    /// 2.2 — Obtener metadatos de un video o playlist
    #[tauri::command]
    pub async fn fetch_video_metadata(
        app: AppHandle,
        url: String,
    ) -> Result<VideoMetadata, String> {
        let output = ytdlp_bin(&app)
            .args([
                "--dump-json",
                "--skip-download",
                "--no-playlist",
                "--no-warnings",
                &url,
            ])
            .output()
            .await
            .map_err(|e| format!("Error al ejecutar yt-dlp: {e}"))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            return Err(format!("yt-dlp error: {stderr}"));
        }

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let first_line = stdout.lines().next().ok_or("Respuesta vacía de yt-dlp")?;
        let json: serde_json::Value =
            serde_json::from_str(first_line).map_err(|e| format!("Error al parsear JSON: {e}"))?;

        let formats = json["formats"]
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|f| {
                Some(VideoFormat {
                    format_id: f["format_id"].as_str()?.to_string(),
                    format_note: f["format_note"].as_str().map(|s| s.to_string()),
                    ext: f["ext"].as_str().unwrap_or("?").to_string(),
                    resolution: f["resolution"].as_str().map(|s| s.to_string()),
                    fps: f["fps"].as_f64(),
                    vcodec: f["vcodec"].as_str().map(|s| s.to_string()),
                    acodec: f["acodec"].as_str().map(|s| s.to_string()),
                    filesize: f["filesize"].as_u64(),
                    tbr: f["tbr"].as_f64(),
                })
            })
            .collect();

        let is_playlist = json["_type"].as_str() == Some("playlist");

        Ok(VideoMetadata {
            id: json["id"].as_str().unwrap_or("").to_string(),
            title: json["title"].as_str().unwrap_or("Sin título").to_string(),
            uploader: json["uploader"].as_str().map(|s| s.to_string()),
            duration: json["duration"].as_f64(),
            thumbnail: json["thumbnail"].as_str().map(|s| s.to_string()),
            webpage_url: json["webpage_url"].as_str().unwrap_or(&url).to_string(),
            formats,
            is_playlist,
            playlist_count: json["playlist_count"].as_u64(),
        })
    }

    /// 2.2b — Obtener solo los formatos disponibles para una URL
    #[tauri::command]
    pub async fn fetch_formats(
        app: AppHandle,
        url: String,
    ) -> Result<Vec<VideoFormat>, String> {
        let meta = fetch_video_metadata(app, url).await?;
        Ok(meta.formats)
    }

    /// 2.3 — Iniciar una descarga emitiendo progreso en tiempo real
    #[tauri::command]
    pub async fn start_download(
        app: AppHandle,
        state: State<'_, ActiveDownloads>,
        request: DownloadRequest,
    ) -> Result<(), String> {
        let format = request.format_id.as_deref().unwrap_or("bestvideo+bestaudio/best");
        let output_tmpl = format!("{}/%(title)s.%(ext)s", request.output_dir);

        let mut args: Vec<String> = vec![
            "--newline".to_string(),
            "--progress".to_string(),
            "--no-warnings".to_string(),
            "-f".to_string(), format.to_string(),
            "--merge-output-format".to_string(), "mp4".to_string(),
            "-o".to_string(), output_tmpl,
        ];

        if let Ok(ffmpeg_path) = app.shell().sidecar("ffmpeg")
            .map(|_| app.path().resource_dir().unwrap().join("ffmpeg-x86_64-pc-windows-msvc.exe"))
        {
            args.push("--ffmpeg-location".to_string());
            args.push(ffmpeg_path.to_string_lossy().to_string());
        }

        if request.audio_only {
            args.extend(["--extract-audio".to_string(), "--audio-format".to_string(), "mp3".to_string()]);
        }
        if request.embed_subs {
            args.extend(["--embed-subs".to_string(), "--sub-langs".to_string(), "all".to_string()]);
        }
        if let (Some(from), Some(to)) = (&request.time_from, &request.time_to) {
            args.extend([
                "--download-sections".to_string(),
                format!("*{}-{}", from, to),
            ]);
        }
        if let Some(extra) = &request.extra_args {
            args.extend(extra.clone());
        }

        args.push(request.url.clone());

        let (mut rx, child) = ytdlp_bin(&app)
            .args(args)
            .spawn()
            .map_err(|e| format!("Error al lanzar yt-dlp: {e}"))?;

        let dl_id = request.download_id.clone();
        {
            let mut map = state.0.lock().unwrap();
            map.insert(dl_id.clone(), child);
        }

        let app_clone = app.clone();
        let dl_id_clone = dl_id.clone();
        let state_arc = state.0.clone();

        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                match event {
                    CommandEvent::Stdout(line) => {
                        let text = String::from_utf8_lossy(&line).to_string();
                        let progress = parse_progress_line(&dl_id_clone, &text);
                        let _ = app_clone.emit("download-progress", &progress);
                    }
                    CommandEvent::Stderr(line) => {
                        let text = String::from_utf8_lossy(&line).to_string();
                        if !text.trim().is_empty() {
                            let progress = DownloadProgress {
                                download_id: dl_id_clone.clone(),
                                status: "error".to_string(),
                                percent: 0.0,
                                speed: None,
                                eta: None,
                                filename: None,
                                message: Some(text),
                            };
                            let _ = app_clone.emit("download-progress", &progress);
                        }
                    }
                    CommandEvent::Terminated(status) => {
                        let success = status.code.map(|c| c == 0).unwrap_or(false);
                        let progress = DownloadProgress {
                            download_id: dl_id_clone.clone(),
                            status: if success { "finished" } else { "error" }.to_string(),
                            percent: if success { 100.0 } else { 0.0 },
                            speed: None,
                            eta: None,
                            filename: None,
                            message: if !success { Some("El proceso terminó con error".to_string()) } else { None },
                        };
                        let _ = app_clone.emit("download-progress", &progress);
                        let mut map = state_arc.lock().unwrap();
                        map.remove(&dl_id_clone);
                        break;
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }

    /// 2.5 — Cancelar una descarga activa
    #[tauri::command]
    pub async fn cancel_download(
        download_id: String,
        state: State<'_, ActiveDownloads>,
    ) -> Result<(), String> {
        let mut map = state.0.lock().unwrap();
        if let Some(child) = map.remove(&download_id) {
            child.kill().map_err(|e| format!("No se pudo cancelar: {e}"))?;
        }
        Ok(())
    }

    /// 2.4 — Leer configuración guardada
    #[tauri::command]
    pub async fn get_config(app: AppHandle) -> Result<AppConfig, String> {
        let path = get_config_path(&app);
        if !path.exists() {
            return Ok(AppConfig::default());
        }
        let content = std::fs::read_to_string(&path)
            .map_err(|e| format!("Error leyendo configuración: {e}"))?;
        serde_json::from_str(&content).map_err(|e| format!("Error parseando configuración: {e}"))
    }

    /// 2.4 — Guardar configuración
    #[tauri::command]
    pub async fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
        let path = get_config_path(&app);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Error creando directorio: {e}"))?;
        }
        let content = serde_json::to_string_pretty(&config)
            .map_err(|e| format!("Error serializando configuración: {e}"))?;
        std::fs::write(&path, content)
            .map_err(|e| format!("Error guardando configuración: {e}"))
    }

    /// 2.6 — Verificar que FFmpeg está disponible
    #[tauri::command]
    pub async fn check_ffmpeg(app: AppHandle) -> Result<String, String> {
        let output = ffmpeg_bin(&app)
            .args(["-version"])
            .output()
            .await
            .map_err(|e| format!("FFmpeg no encontrado: {e}"))?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let version = stdout.lines().next().unwrap_or("Versión desconocida").to_string();
        Ok(version)
    }
}

// ─── Parser de líneas de progreso de yt-dlp ────────────────────────────────────
fn parse_progress_line(download_id: &str, line: &str) -> DownloadProgress {
    let mut percent = 0.0f64;
    let mut speed: Option<String> = None;
    let mut eta: Option<String> = None;
    let mut status = "downloading".to_string();

    if line.contains("[download]") {
        if let Some(pct_str) = extract_between(line, "[download]", "%") {
            percent = pct_str.trim().parse().unwrap_or(0.0);
        }
        if let Some(spd) = extract_between(line, "at ", "/s") {
            speed = Some(format!("{}/s", spd.trim()));
        }
        if let Some(e) = extract_between(line, "ETA ", "\n") {
            eta = Some(e.trim().to_string());
        } else if line.contains("ETA ") {
            let parts: Vec<&str> = line.splitn(2, "ETA ").collect();
            if parts.len() > 1 {
                eta = Some(parts[1].trim().to_string());
            }
        }
        if line.contains("100%") {
            percent = 100.0;
        }
    } else if line.contains("[Merger]") || line.contains("Merging") {
        status = "merging".to_string();
        percent = 99.0;
    } else if line.contains("has already been downloaded") {
        status = "finished".to_string();
        percent = 100.0;
    }

    DownloadProgress {
        download_id: download_id.to_string(),
        status,
        percent,
        speed,
        eta,
        filename: extract_between(line, "Destination: ", "\n")
            .map(|s| s.trim().to_string()),
        message: Some(line.to_string()),
    }
}

fn extract_between<'a>(text: &'a str, start: &str, end: &str) -> Option<String> {
    let start_idx = text.find(start)? + start.len();
    let rest = &text[start_idx..];
    let end_idx = rest.find(end).unwrap_or(rest.len());
    Some(rest[..end_idx].to_string())
}

// ─── Entry point ───────────────────────────────────────────────────────────────
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(ActiveDownloads(Arc::new(Mutex::new(HashMap::new()))))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::fetch_video_metadata,
            commands::fetch_formats,
            commands::start_download,
            commands::cancel_download,
            commands::get_config,
            commands::save_config,
            commands::check_ffmpeg,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
