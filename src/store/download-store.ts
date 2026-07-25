import { create } from "zustand";
import type { VideoMetadata, DownloadItem, AppConfig, DownloadProgress } from "@/types";
import { tauriService } from "@/services/tauri";

interface DownloadState {
  // Input y Metadatos actuales
  url: string;
  isFetchingMetadata: boolean;
  metadataError: string | null;
  metadata: VideoMetadata | null;
  
  // Opciones de descarga actual
  selectedFormatId: string;
  audioOnly: boolean;
  embedSubs: boolean;
  outputDir: string;
  timeFrom: string;
  timeTo: string;

  // Cola de descargas
  queue: DownloadItem[];

  // Configuración global
  config: AppConfig | null;

  // Acciones Formulario
  setUrl: (url: string) => void;
  setSelectedFormatId: (formatId: string) => void;
  setAudioOnly: (val: boolean) => void;
  setEmbedSubs: (val: boolean) => void;
  setOutputDir: (dir: string) => void;
  setTimeFrom: (val: string) => void;
  setTimeTo: (val: string) => void;
  
  fetchMetadata: (targetUrl?: string) => Promise<void>;
  clearMetadata: () => void;

  // Acciones Descarga
  addDownload: () => Promise<void>;
  cancelDownload: (id: string) => Promise<void>;
  updateProgress: (progress: DownloadProgress) => void;

  // Configuración
  loadConfig: () => Promise<void>;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  selectFolder: () => Promise<void>;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  url: "",
  isFetchingMetadata: false,
  metadataError: null,
  metadata: null,

  selectedFormatId: "best",
  audioOnly: false,
  embedSubs: false,
  outputDir: "",
  timeFrom: "",
  timeTo: "",

  queue: [],
  config: null,

  setUrl: (url) => set({ url }),
  setSelectedFormatId: (selectedFormatId) => set({ selectedFormatId }),
  setAudioOnly: (audioOnly) => set({ audioOnly }),
  setEmbedSubs: (embedSubs) => set({ embedSubs }),
  setOutputDir: (outputDir) => set({ outputDir }),
  setTimeFrom: (timeFrom) => set({ timeFrom }),
  setTimeTo: (timeTo) => set({ timeTo }),

  fetchMetadata: async (targetUrl) => {
    const queryUrl = targetUrl || get().url;
    if (!queryUrl || !queryUrl.trim()) return;

    set({ isFetchingMetadata: true, metadataError: null, metadata: null });
    try {
      const data = await tauriService.fetchVideoMetadata(queryUrl.trim());
      set({
        metadata: data,
        isFetchingMetadata: false,
        selectedFormatId: data.formats.length > 0 ? "best" : "best",
      });
    } catch (err: any) {
      set({
        metadataError: typeof err === "string" ? err : err.message || "Error al obtener información del video",
        isFetchingMetadata: false,
      });
    }
  },

  clearMetadata: () => set({ metadata: null, metadataError: null, url: "", timeFrom: "", timeTo: "" }),

  addDownload: async () => {
    const { url, metadata, selectedFormatId, audioOnly, embedSubs, outputDir, config, timeFrom, timeTo } = get();
    if (!url && !metadata) return;

    const targetUrl = metadata?.webpage_url || url;
    const title = metadata?.title || targetUrl;
    const thumbnail = metadata?.thumbnail;
    const finalDir = outputDir || config?.output_dir || "";
    const id = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newItem: DownloadItem = {
      id,
      url: targetUrl,
      title,
      thumbnail,
      format_id: selectedFormatId,
      output_dir: finalDir,
      audio_only: audioOnly,
      embed_subs: embedSubs,
      progress: 0,
      status: "queued",
      createdAt: Date.now(),
    };

    set((state) => ({ queue: [newItem, ...state.queue] }));

    try {
      await tauriService.startDownload({
        download_id: id,
        url: targetUrl,
        format_id: selectedFormatId === "best" ? undefined : selectedFormatId,
        output_dir: finalDir,
        audio_only: audioOnly,
        embed_subs: embedSubs,
        time_from: timeFrom.trim() || undefined,
        time_to: timeTo.trim() || undefined,
      });
    } catch (err: any) {
      set((state) => ({
        queue: state.queue.map((item) =>
          item.id === id
            ? { ...item, status: "error", errorMessage: typeof err === "string" ? err : err.message }
            : item
        ),
      }));
    }
  },

  cancelDownload: async (id) => {
    try {
      await tauriService.cancelDownload(id);
      set((state) => ({
        queue: state.queue.map((item) =>
          item.id === id ? { ...item, status: "cancelled", speed: undefined, eta: undefined } : item
        ),
      }));
    } catch (err) {
      console.error("Error al cancelar:", err);
    }
  },

  updateProgress: (progress) => {
    set((state) => ({
      queue: state.queue.map((item) => {
        if (item.id !== progress.download_id) return item;
        return {
          ...item,
          status: progress.status as any,
          progress: progress.percent,
          speed: progress.speed,
          eta: progress.eta,
          errorMessage: progress.status === "error" ? progress.message : item.errorMessage,
        };
      }),
    }));
  },

  loadConfig: async () => {
    try {
      const cfg = await tauriService.getConfig();
      set({ config: cfg, outputDir: cfg.output_dir });
    } catch (err) {
      console.error("Error cargando config:", err);
    }
  },

  updateConfig: async (newConfig) => {
    const current = get().config;
    if (!current) return;
    const updated = { ...current, ...newConfig };
    set({ config: updated });
    await tauriService.saveConfig(updated);
  },

  selectFolder: async () => {
    const currentDir = get().outputDir || get().config?.output_dir;
    const chosen = await tauriService.selectDirectory(currentDir);
    if (chosen) {
      set({ outputDir: chosen });
    }
  },
}));
