# yt-dlp Desktop (Tauri + React + Tailwind)

Interfaz gráfica moderna, minimalista y de alto rendimiento para **yt-dlp**, construida con **Tauri v2**, **React**, **Tailwind CSS** y **shadcn/ui**.

## 🚀 Filosofía del Proyecto

- **Cero fricción:** Abrir la app ➔ Pegar URL ➔ Descargar. Sin registros, sin anuncios, sin telemetría.
- **Transparencia & Privacidad:** 100% ejecutable localmente sin servidores externos ni sincronización en la nube.
- **Poder con Simplicidad:** Diseño *progressive disclosure* — simple para uso rápido, potente para configuraciones avanzadas (formato, codecs, subtítulos, fragmentación por tiempo `--download-sections`, cookies).
- **Feedback en tiempo real:** Barras de progreso, velocidad de descarga y ETA reales emitidos directamente desde el sidecar local.

---

## 🛠️ Arquitectura

- **Frontend:** React + TypeScript + Tailwind CSS + shadcn/ui.
- **Backend / Desktop Frame:** Tauri v2 (Rust).
- **Core Engine:** Motor Python `yt_dlp` empaquetado como sidecar nativo.

---

## 📋 Especificación Técnica (UI/UX)

Para consultar todos los requerimientos de interfaz, comportamientos de componentes shadcn/ui, flags soportadas y estados de descarga, consultá el archivo de especificación detallado:

👉 **[spec.md](spec.md)**
