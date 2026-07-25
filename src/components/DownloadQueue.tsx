import React from "react";
import { DownloadItem } from "@/components/DownloadItem";
import { useDownloadStore } from "@/store/download-store";
import { ListFilter, Download, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DownloadQueue: React.FC = () => {
  const queue = useDownloadStore((s) => s.queue);
  const clearQueue = useDownloadStore((s) => s.clearQueue);

  return (
    <details
      open
      className="group [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer items-center justify-between font-semibold text-xs select-none text-[var(--foreground)]">
        <span className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-[var(--muted-foreground)]" />
          Cola de Descargas ({queue.length})
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {queue.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              className="h-7 px-2 text-xs font-semibold text-[var(--destructive)] hover:bg-[var(--muted)] gap-1 rounded-xl"
              title="Limpiar toda la cola"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar cola
            </Button>
          )}

          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>

      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] mb-3 border border-[var(--border)]">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-[var(--foreground)]">No hay descargas en la cola</h3>
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)] max-w-xs">
              Ingresa un enlace multimedia arriba para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {queue.map((item) => (
              <DownloadItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </details>
  );
};
