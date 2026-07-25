import React from "react";
import { Folder, Music, Captions, Scissors, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDownloadStore } from "@/store/download-store";

export const AdvancedOptions: React.FC = () => {
  const audioOnly = useDownloadStore((s) => s.audioOnly);
  const setAudioOnly = useDownloadStore((s) => s.setAudioOnly);
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
        className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Selector de Carpeta Destino */}
        <div className="space-y-1.5 md:col-span-2">
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

        {/* Switch Solo Audio */}
        <div className="flex items-center justify-between px-3.5 py-2.5" style={rowStyle}>
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Solo Audio (MP3)</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Extrae la pista de audio</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={audioOnly}
            onChange={(e) => setAudioOnly(e.target.checked)}
            className="h-4 w-4 rounded cursor-pointer accent-purple-500"
            style={{ border: "1px solid var(--border)" }}
          />
        </div>

        {/* Switch Subtítulos */}
        <div className="flex items-center justify-between px-3.5 py-2.5" style={rowStyle}>
          <div className="flex items-center gap-2">
            <Captions className="h-4 w-4 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-xs font-bold text-[var(--foreground)]">Incrustar Subtítulos</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">Añade subtítulos al video</p>
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
        <div className="space-y-1.5 md:col-span-2 p-3" style={rowStyle}>
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
