import React from "react";
import { Clock, User, Film, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDownloadStore } from "@/store/download-store";

function formatDuration(seconds?: number): string {
  if (!seconds) return "--:--";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFilesize(bytes?: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) {
    return `~${(mb / 1024).toFixed(1)} GB`;
  }
  return `~${mb.toFixed(0)} MB`;
}

export const VideoPreview: React.FC = () => {
  const metadata = useDownloadStore((s) => s.metadata);
  const selectedFormatId = useDownloadStore((s) => s.selectedFormatId);
  const setSelectedFormatId = useDownloadStore((s) => s.setSelectedFormatId);

  if (!metadata) return null;

  const videoFormats = metadata.formats.filter(
    (f) => f.vcodec && f.vcodec !== "none" && (f.resolution || f.format_note)
  );

  return (
    <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnail */}
        <div className="relative shrink-0 overflow-hidden rounded-xl bg-[var(--background)] aspect-video md:w-52 border border-[var(--border)]">
          {metadata.thumbnail ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <Film className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Detalles & Selección de Formato */}
        <div className="flex flex-1 flex-col justify-between space-y-3">
          <div>
            <h2 className="line-clamp-2 text-xs font-semibold text-[var(--foreground)] leading-relaxed">
              {metadata.title}
            </h2>

            <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
              {metadata.uploader && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {metadata.uploader}
                </span>
              )}
              {metadata.duration ? (
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3" />
                  {formatDuration(metadata.duration)}
                </span>
              ) : null}
            </div>
          </div>

          {/* Selector de Calidad / Formatos */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--muted-foreground)]">Formato y Calidad</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFormatId("best")}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedFormatId === "best"
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                    : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                }`}
              >
                {selectedFormatId === "best" && <Check className="h-3 w-3" />}
                Mejor Calidad
              </button>

              {videoFormats.slice(-5).map((f) => (
                <button
                  key={f.format_id}
                  type="button"
                  onClick={() => setSelectedFormatId(f.format_id)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedFormatId === f.format_id
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                      : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  {selectedFormatId === f.format_id && <Check className="h-3 w-3" />}
                  {f.resolution || f.format_note || f.ext.toUpperCase()}
                  <span className="text-[10px] opacity-70">{formatFilesize(f.filesize)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
