import React from "react";
import { Download, CheckCircle2, XCircle, Ban, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DownloadItem as DownloadItemType } from "@/types";
import { useDownloadStore } from "@/store/download-store";

interface DownloadItemProps {
  item: DownloadItemType;
}

export const DownloadItem: React.FC<DownloadItemProps> = ({ item }) => {
  const removeDownloadItem = useDownloadStore((s) => s.removeDownloadItem);

  const getStatusBadge = () => {
    switch (item.status) {
      case "downloading":
        return (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--primary) 15%, transparent)",
              color: "var(--primary)",
              border: "1px solid color-mix(in oklch, var(--primary) 40%, transparent)",
            }}
          >
            <Download className="h-3 w-3 animate-bounce" /> Descargando
          </span>
        );
      case "merging":
        return (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--secondary) 30%, transparent)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <RefreshCw className="h-3 w-3 animate-spin" /> Procesando
          </span>
        );
      case "finished":
        return (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--primary) 10%, transparent)",
              color: "var(--primary)",
              border: "1px solid color-mix(in oklch, var(--primary) 30%, transparent)",
            }}
          >
            <CheckCircle2 className="h-3 w-3" /> Completado
          </span>
        );
      case "error":
        return (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--destructive) 15%, transparent)",
              color: "var(--destructive)",
              border: "1px solid color-mix(in oklch, var(--destructive) 40%, transparent)",
            }}
          >
            <XCircle className="h-3 w-3" /> Error
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
            <Ban className="h-3 w-3" /> Cancelado
          </span>
        );
      default:
        return <span className="text-[11px] text-[var(--muted-foreground)]">En cola</span>;
    }
  };

  const progressColor = () => {
    if (item.status === "finished") return "var(--primary)";
    if (item.status === "error") return "var(--destructive)";
    if (item.status === "merging") return "var(--secondary)";
    return "var(--primary)";
  };

  return (
    <div
      className="rounded-2xl p-3.5"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "3px 3px 0px 0px var(--border)",
        transition: "background-color 0.2s ease",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div
          className="h-12 w-16 shrink-0 overflow-hidden rounded-xl"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted-foreground)]">
              <Download className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate text-xs font-bold text-[var(--foreground)]">{item.title}</h4>
            {getStatusBadge()}
          </div>

          {/* Barra de progreso */}
          <div className="mt-2 space-y-1">
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, item.progress))}%`,
                  background: progressColor(),
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-mono">
              <span className="font-semibold">{Math.round(item.progress)}%</span>
              {item.status === "downloading" && (
                <div className="flex items-center gap-3">
                  {item.speed && <span>{item.speed}</span>}
                  {item.eta && <span>ETA {item.eta}</span>}
                </div>
              )}
            </div>
          </div>

          {item.errorMessage && (
            <p className="mt-1.5 truncate text-[10px] text-[var(--destructive)]">
              {item.errorMessage}
            </p>
          )}
        </div>

        {/* Botón X para eliminar el elemento de la cola */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeDownloadItem(item.id)}
          className="h-7 w-7 rounded-xl shrink-0"
          title="Eliminar de la cola"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
