import React from "react";
import { Download, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, isDark, onToggleTheme }) => {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-200"
    >
      {/* Logo + Título */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-[var(--primary-foreground)]"
          style={{
            background: "var(--primary)",
            border: "1px solid var(--border)",
            boxShadow: "2px 2px 0px 0px var(--border)",
          }}
        >
          <Download className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-[var(--foreground)]">
            yt-dlp Desktop
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">Gestor de descargas multimedia</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {/* Toggle luz/oscuro */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="h-9 w-9"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Configuración */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="Ajustes"
          className="h-9 w-9"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
