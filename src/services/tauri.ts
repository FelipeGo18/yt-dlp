import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { VideoMetadata, DownloadRequest, AppConfig } from "@/types";

export const tauriService = {
  async fetchVideoMetadata(url: string): Promise<VideoMetadata> {
    return await invoke<VideoMetadata>("fetch_video_metadata", { url });
  },

  async startDownload(request: DownloadRequest): Promise<void> {
    return await invoke("start_download", { request });
  },

  async cancelDownload(downloadId: string): Promise<void> {
    return await invoke("cancel_download", { downloadId });
  },

  async getConfig(): Promise<AppConfig> {
    return await invoke<AppConfig>("get_config");
  },

  async saveConfig(config: AppConfig): Promise<void> {
    return await invoke("save_config", { config });
  },

  async checkFfmpeg(): Promise<string> {
    return await invoke<string>("check_ffmpeg");
  },

  async selectDirectory(defaultPath?: string): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath,
      title: "Seleccionar carpeta de descarga",
    });
    if (typeof selected === "string") return selected;
    return null;
  },
};
