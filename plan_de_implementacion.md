# Plan de Implementación — yt-dlp Desktop (Tauri + React + Tailwind v4)

Interfaz gráfica moderna para **yt-dlp** con **Tauri v2**, **React**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** y **Zustand**.

---

## 🎯 Decisiones de Arquitectura Confirmadas

- **FFmpeg**: Empaquetado en el instalador como binario/recurso sidecar (cero fricción para el usuario final).
- **Estilos**: Tailwind CSS v4.
- **Estado Global**: Zustand.
- **Estructura**: Proyecto Tauri + React en la raíz del repositorio (`./`), usando el código Python existente como motor sidecar.

---

## 📋 Lista de Tareas y Checkbox de Seguimiento

### 🏗️ Etapa 0 — Preparación del Entorno

- [X] **0.1** Resolver o mitigar interferencias de Laragon en el PATH.
- [X] **0.2** Verificar/obtener binario de FFmpeg para Windows (`ffmpeg.exe`). ✅ FFmpeg 8.1.2 instalado vía winget.
- [X] **0.3** Probar compilación del motor Python `yt_dlp` a binario standalone (`yt-dlp.exe`) usando PyInstaller. ✅ Generado en `src-tauri/binaries/yt-dlp-x86_64-pc-windows-msvc.exe`

---

### 🚀 Etapa 1 — Scaffolding del Proyecto Tauri v2 + React

- [X] **1.1** Inicializar proyecto React + TypeScript con Vite en la raíz (`npm create vite@latest ./`).
- [X] **1.2** Inicializar Tauri v2 (`cargo tauri init`) y configurar `tauri.conf.json`.
- [X] **1.3** Instalar y configurar **Tailwind CSS v4** con `@tailwindcss/vite`.
- [X] **1.4** Inicializar y configurar **shadcn/ui** (preset Zinc, dark mode).
- [X] **1.5** Instalar componentes base de shadcn/ui (`Input`, `Button`, `Card`, `Select`, `Checkbox`, `Accordion`, `Progress`, `Sheet`, `Skeleton`, `Sonner`).
- [X] **1.6** Instalar cliente Tauri JS (`@tauri-apps/api`, `@tauri-apps/plugin-shell`, etc.) y **Zustand**.
- [X] **1.7** Verificar ejecución básica de desarrollo (`cargo tauri dev`). ✅ App compiló y corrió en 11m27s.

---

### ⚙️ Etapa 2 — Backend Rust: Sidecar y Comandos Tauri

- [X] **2.1** Configurar `yt-dlp.exe` y `ffmpeg.exe` en `tauri.conf.json` como sidecars/externalBin. ✅ `binaries/` poblado y permisos en `capabilities/default.json`.
- [X] **2.2** Crear comando Tauri `fetch_video_metadata(url)` (`yt-dlp --skip-download --dump-json`). ✅ Código en `lib.rs`.
- [X] **2.3** Crear comando Tauri `start_download(...)` leyendo `stdout` y emitiendo progreso en tiempo real (`download-progress`). ✅ Código en `lib.rs`.
- [X] **2.4** Crear comandos de persistencia de configuración local JSON (`get_config`, `save_config`). ✅ Código en `lib.rs`.
- [X] **2.5** Crear comando de cancelación de procesos de descarga (`cancel_download`). ✅ Código en `lib.rs`.
- [X] **2.6** Crear comando de verificación/estado de FFmpeg (`check_ffmpeg`). ✅ Código en `lib.rs`.
- [X] **2.7** Verificar compilación limpia de Rust y ejecución de comandos (`cargo tauri dev`).

---

### 🎨 Etapa 3 — Frontend: Pantalla Principal

- [ ] **3.1** Configurar layout base y tema oscuro por defecto con Inter font.
- [ ] **3.2** Crear componente `UrlInput` con auto-detección y listener de pegado.
- [ ] **3.3** Crear componente `VideoPreview` (thumbnail, título, canal, duración, selector de formato/calidad real).
- [ ] **3.4** Crear componente `AdvancedOptions` (Accordion con flags de yt-dlp, selector de carpetas, cookies, etc.).
- [ ] **3.5** Crear componente `TimeRangeInput` (recorte por fragmento Desde/Hasta `HH:MM:SS`).
- [ ] **3.6** Crear botón principal `Descargar` con estado de inicio/carga y validaciones.

---

### 📊 Etapa 4 — Frontend: Cola de Descargas (Zustand Store)

- [ ] **4.1** Crear store global en Zustand (`download-store.ts`) para gestión de la cola y progreso.
- [ ] **4.2** Crear componente `DownloadQueue` (panel inferior scrolleable).
- [ ] **4.3** Crear componente `DownloadItem` (barra de progreso dinámica, velocidad, ETA, reintentar, cancelar, abrir carpeta).
- [ ] **4.4** Implementar persistencia del historial de descargas en disco.

---

### ⚙️ Etapa 5 — Panel de Ajustes (Drawer)

- [ ] **5.1** Crear componente `SettingsDrawer` con `Sheet` de shadcn.
- [ ] **5.2** Configurar selector de carpeta de descarga por defecto (`@tauri-apps/plugin-dialog`).
- [ ] **5.3** Conectar selector de temas (Claro/Oscuro/Sistema).
- [ ] **5.4** Añadir vista de versión y verificación de actualizaciones.

---

### 🪄 Etapa 6 — Integración, Experiencia de Usuario y Pulido

- [ ] **6.1** Manejo de URLs tipo Playlist (detección y opción de selección/descarga múltiple).
- [ ] **6.2** Sistema de notificaciones no intrusivas (`Sonner`/Toast) para errores y avisos.
- [ ] **6.3** Layout responsive (columna única / 2 columnas).
- [ ] **6.4** Pulido de micro-interacciones, animaciones y estados vacíos/de carga (Skeletons).

---

### 📦 Etapa 7 — Empaquetado y Distribución

- [ ] **7.1** Compilar motor Python `yt_dlp` a `yt-dlp.exe` ejecutable nativo.
- [ ] **7.2** Colocar binarios sidecar (`yt-dlp.exe` y `ffmpeg.exe`) en `src-tauri/binaries/`.
- [ ] **7.3** Generar el build ejecutable final e instalador MSI/exe (`cargo tauri build`).
- [ ] **7.4** Prueba final de instalación en limpio y verificación de descargas.
