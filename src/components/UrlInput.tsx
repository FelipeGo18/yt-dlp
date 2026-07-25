import React from "react";
import { Link2, Clipboard, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDownloadStore } from "@/store/download-store";

export const UrlInput: React.FC = () => {
  const url = useDownloadStore((s) => s.url);
  const setUrl = useDownloadStore((s) => s.setUrl);
  const isFetchingMetadata = useDownloadStore((s) => s.isFetchingMetadata);
  const metadataError = useDownloadStore((s) => s.metadataError);
  const fetchMetadata = useDownloadStore((s) => s.fetchMetadata);
  const clearMetadata = useDownloadStore((s) => s.clearMetadata);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        fetchMetadata(text.trim());
      }
    } catch (err) {
      console.error("Error al pegar:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && url.trim()) {
      fetchMetadata();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
        <span>URL del video o lista</span>
        {url && (
          <button
            onClick={clearMetadata}
            className="text-[11px] transition-opacity flex items-center gap-1 cursor-pointer hover:opacity-70"
          >
            <X className="h-3 w-3" /> Limpiar
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 text-[var(--muted-foreground)]">
          <Link2 className="h-4 w-4" />
        </div>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full h-10 pl-10 pr-24 text-xs font-medium"
          style={{
            background: "var(--input)",
            border: "1px solid var(--border)",
            borderRadius: "1.5rem",
            color: "var(--foreground)",
            outline: "none",
            boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.5)",
            transition: "box-shadow 0.12s ease",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 0 3px var(--ring), 3px 3px 0px 0px rgba(0,0,0,1)`;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "2px 2px 0px 0px rgba(0,0,0,0.5)";
          }}
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {!url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              className="h-7 px-2.5 text-xs gap-1"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Pegar
            </Button>
          )}

          <Button
            type="button"
            variant="flat"
            size="sm"
            onClick={() => fetchMetadata()}
            disabled={!url.trim() || isFetchingMetadata}
            className="h-7 px-3 text-xs gap-1 rounded-full shadow-none border-none"
          >
            {isFetchingMetadata ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline ml-0.5">Analizar</span>
          </Button>
        </div>
      </div>

      {metadataError && (
        <div
          className="rounded-2xl p-3 text-xs"
          style={{
            background: "oklch(0.67 0.21 25 / 0.08)",
            border: "1px solid oklch(0.67 0.21 25 / 0.5)",
            color: "oklch(0.45 0.21 25)",
            boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.5)",
          }}
        >
          <p className="font-bold">No se pudo obtener información del video:</p>
          <p className="mt-0.5 opacity-90">{metadataError}</p>
        </div>
      )}
    </div>
  );
};
