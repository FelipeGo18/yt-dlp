import React from "react";
import { DownloadItem } from "@/components/DownloadItem";
import { useDownloadStore } from "@/store/download-store";
import { ListFilter, Download } from "lucide-react";

export const DownloadQueue: React.FC = () => {
  const queue = useDownloadStore((s) => s.queue);

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 p-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--muted-foreground)] mb-3 border border-[var(--border)]">
          <Download className="h-5 w-5" />
        </div>
        <h3 className="text-xs font-medium text-[var(--foreground)]">No hay descargas en la cola</h3>
        <p className="mt-1 text-[11px] text-[var(--muted-foreground)] max-w-xs">
          Ingresa un enlace multimedia arriba para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
          <ListFilter className="h-3.5 w-3.5" />
          Cola de Descargas ({queue.length})
        </h3>
      </div>

      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {queue.map((item) => (
          <DownloadItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
