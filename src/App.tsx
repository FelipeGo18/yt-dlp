import React from "react";
import { Download, Sparkles, Settings } from "lucide-react";

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">yt-dlp Desktop</h1>
            <p className="text-xs text-muted-foreground">Descargador multimedia ultrarrápido</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Banner de inicio */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Scaffolding inicial completado con <span className="text-foreground font-medium">Tauri v2 + React 19 + Tailwind v4 + shadcn/ui</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
