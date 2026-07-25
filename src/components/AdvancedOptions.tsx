import React from "react";
import { Folder, Music, Video, Layers, Captions, Scissors, ChevronDown, Check, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDownloadStore } from "@/store/download-store";
import type { DownloadMode } from "@/types";

export const AdvancedOptions: React.FC = () => {
  const downloadMode = useDownloadStore((s) => s.downloadMode);
  const setDownloadMode = useDownloadStore((s) => s.setDownloadMode);
  const embedSubs = useDownloadStore((s) => s.embedSubs);
  const setEmbedSubs = useDownloadStore((s) => s.setEmbedSubs);
  const outputDir = useDownloadStore((s) => s.outputDir);
  const config = useDownloadStore((s) => s.config);
  const selectFolder = useDownloadStore((s) => s.selectFolder);
  const timeFrom = useDownloadStore((s) => s.timeFrom);
  const setTimeFrom = useDownloadStore((s) => s.setTimeFrom);
  const timeTo = useDownloadStore((s) => s.timeTo);
  const setTimeTo = useDownloadStore((s) => s.setTimeTo);

  const displayDir = outputDir || config?.output_dir || "Carpeta predeterminada";

  const rowStyle: React.CSSProperties = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.5)",
  };

  const modeOptions: Array<{
    id: DownloadMode;
    title: string;
    badge?: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "merged",
      title: "Video + Audio",
      badge: "Por defecto",
      subtitle: "Un solo archivo MP4 con video HD y sonido unidos",
      icon: <Film className="h-4 w-4 text-purple-400" />,
    },
    {
      id: "audio_only",
      title: "Solo Audio",
      subtitle: "Extrae únicamente la pista de sonido en MP3",
      icon: <Music className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: "video_only",
      title: "Solo Video (Sin Audio)",
      subtitle: "Descarga solo la pista de video sin sonido",
      icon: <Video className="h-4 w-4 text-blue-400" />,
    },
    {
      id: "separate",
      title: "Archivos Separados",
      subtitle: "Guarda el video y el audio en 2 archivos sueltos",
      icon: <Layers className="h-4 w-4 text-amber-400" />,
    },
  ];

  return (
    <details
      className="group [&_summary::-webkit-details-marker]:hidden"
      style={{
        background: "var(--muted)",
        border: "1px solid var(--border)",
        borderRadius: "1.25rem",
        padding: "0.875rem",
        boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.5)",
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs select-none text-[var(--foreground)]">
        <span className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          Opciones avanzadas y carpeta de destino
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div
        className="mt-4 flex flex-col gap-4 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Selector de Modo de Descarga */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Modo de Descarga</span>
            <span className="text-[10px] opacity-75 font-normal">Predeterminado: Video + Audio unidos</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {modeOptions.map((opt) => {
              const isSelected = downloadMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDownloadMode(opt.id)}
                  className={`text-left p-3 rounded-xl transition-all duration-150 relative flex items-start gap-3 border ${
                    isSelected
                      ? "bg-purple-500/10 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                      : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--border)]/80 hover:bg-[var(--muted)]"
                  }`}
                  style={{ borderRadius: "0.875rem" }}
                >
                  <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--foreground)]">
                        {opt.title}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 font-medium bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] leading-tight mt-0.5">
                      {opt.subtitle}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Carpeta Destino */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Folder className="h-3 w-3" />
            Carpeta de Guardado
          </label>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 truncate px-3 py-1.5 text-xs font-mono text-[var(--foreground)]"
              style={{ ...rowStyle }}
            >
              {displayDir}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={selectFolder} className="h-8 text-xs">
              Cambiar...
            </Button>
          </div>
        </div>

        {/* Switch Subtítulos */}
        <div className="flex items-center justify-between px-3.5 py-2.5" style={rowStyle}>
          <div className="flex items-center gap-2">
            <Captions className="h-4 w-4 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Incrustar Subtítulos</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Añade subtítulos al video si están disponibles</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={embedSubs}
            onChange={(e) => setEmbedSubs(e.target.checked)}
            className="h-4 w-4 rounded cursor-pointer accent-purple-500"
            style={{ border: "1px solid var(--border)" }}
          />
        </div>

        {/* Recorte de Fragmento */}
        <div className="space-y-1.5 p-3" style={rowStyle}>
          <label className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
            <Scissors className="h-3 w-3" />
            Recortar Fragmento Específico (HH:MM:SS)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)]">Desde:</span>
              <input
                type="text"
                placeholder="00:00:00"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                className="w-full h-8 px-3 text-xs font-mono text-[var(--foreground)]"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  boxShadow: "1px 1px 0px 0px rgba(0,0,0,0.5)",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)]">Hasta:</span>
              <input
                type="text"
                placeholder="00:05:00"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
                className="w-full h-8 px-3 text-xs font-mono text-[var(--foreground)]"
                style={{
                  background: "var(--input)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  boxShadow: "1px 1px 0px 0px rgba(0,0,0,0.5)",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};

