import React from "react";
import { Folder, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDownloadStore } from "@/store/download-store";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const config = useDownloadStore((s) => s.config);
  const selectFolder = useDownloadStore((s) => s.selectFolder);
  const outputDir = useDownloadStore((s) => s.outputDir);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300"
        style={{
          background: "var(--background)",
          borderLeft: "2px solid var(--border)",
          boxShadow: "-6px 0 0px 0px var(--border)",
          transition: "background-color 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-bold text-[var(--foreground)]">Ajustes</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Carpeta de descarga */}
        <div className="space-y-2 flex-1">
          <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-[var(--muted-foreground)]" />
            Carpeta de Descarga
          </label>
          <div
            className="px-3 py-2 text-xs font-mono text-[var(--foreground)] truncate"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "1rem",
              boxShadow: "2px 2px 0px 0px var(--border)",
            }}
          >
            {outputDir || config?.output_dir || "Sin seleccionar"}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={selectFolder}
            className="w-full h-9 text-sm"
          >
            <Folder className="h-4 w-4" />
            Cambiar carpeta
          </Button>
        </div>

        {/* Cerrar */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <Button onClick={onClose} className="w-full h-10 text-sm font-bold">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
