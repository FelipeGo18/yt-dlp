import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Toaster, toast } from "sonner";
import { Download } from "lucide-react";
import { Header } from "@/components/Header";
import { UrlInput } from "@/components/UrlInput";
import { VideoPreview } from "@/components/VideoPreview";
import { AdvancedOptions } from "@/components/AdvancedOptions";
import { DownloadQueue } from "@/components/DownloadQueue";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { Button } from "@/components/ui/button";
import { useDownloadStore } from "@/store/download-store";
import type { DownloadProgress } from "@/types";

export function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("party-rock-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const url = useDownloadStore((s) => s.url);
  const metadata = useDownloadStore((s) => s.metadata);
  const isFetchingMetadata = useDownloadStore((s) => s.isFetchingMetadata);
  const addDownload = useDownloadStore((s) => s.addDownload);
  const updateProgress = useDownloadStore((s) => s.updateProgress);
  const loadConfig = useDownloadStore((s) => s.loadConfig);

  // Apply / remove .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("party-rock-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    loadConfig();

    const unlistenPromise = listen<DownloadProgress>("download-progress", (event) => {
      updateProgress(event.payload);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, [loadConfig, updateProgress]);

  const handleStartDownload = async () => {
    if (!url.trim() && !metadata) {
      toast.error("Ingresa una URL válida para descargar");
      return;
    }
    try {
      await addDownload();
      toast.success("Descarga agregada a la cola");
    } catch (err: any) {
      toast.error("Error al iniciar la descarga");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      <Toaster position="top-right" richColors />

      {/* Header Principal */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      {/* Contenido Principal */}
      <main className="mx-auto max-w-4xl px-4 py-6 space-y-5">
        {/* Sección de Input de URL */}
        <section className="card-party p-5 space-y-4">
          <UrlInput />
          <VideoPreview />
          <AdvancedOptions />

          {/* Botón Principal de Descarga */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleStartDownload}
              disabled={isFetchingMetadata || (!url.trim() && !metadata)}
              className="w-full h-11 text-sm flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Añadir a la Cola y Descargar</span>
            </Button>
          </div>
        </section>

        {/* Sección de Cola de Descargas */}
        <section className="card-party p-5">
          <DownloadQueue />
        </section>
      </main>

      {/* Panel de Ajustes Lateral */}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
