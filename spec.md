
# Especificación de UI/UX — yt-dlp Desktop (Tauri + Tailwind)

## 1. Contexto y objetivo

Envolver el binario de **yt-dlp** (CLI, sidecar en Tauri) con una interfaz gráfica moderna,
minimalista y sin fricción. Filosofía: **abrir la app → pegar URL → descargar**. Sin login,
sin cuentas, sin telemetría, sin pasos innecesarios.

Referencia de mercado (GUIs existentes) y qué tomar / evitar de cada una:

| Proyecto          | Qué está bueno                                   | Qué evitar                                      |
| ----------------- | -------------------------------------------------- | ------------------------------------------------ |
| Tartube           | Gestión de colecciones/canales, historial         | UI recargada, curva de aprendizaje alta          |
| YT-DLG (wxPython) | Simplicidad, expone casi todas las flags de yt-dlp | Estética anticuada (widgets nativos genéricos) |
| YTDLP-Interface   | Enfoque simple: URL + opciones básicas            | Poca personalización visual                     |

**Conclusión de diseño:** ni tan simple que falten opciones importantes (formato, calidad,
subs), ni tan complejo como Tartube. Punto medio: **simple por defecto, potente si escarbás**
(progressive disclosure).

---

## 2. Principios de UX

1. **Cero fricción de arranque:** sin pantalla de login/registro, sin onboarding forzado.
   Al abrir la app, el foco ya está en el input de URL.
2. **Un flujo feliz, muy corto:** pegar URL → (auto-detecta info) → elegir calidad → descargar.
   3 clics máximo para el caso común.
3. **Opciones avanzadas ocultas por defecto**, detrás de un acordeón/drawer ("Opciones
   avanzadas"), para no intimidar al usuario casual pero sin sacrificarle poder al usuario
   avanzado.
4. **Feedback en tiempo real:** barra de progreso real (yt-dlp emite progreso por stdout),
   velocidad de descarga, ETA — no una barra falsa/indeterminada.
5. **Todo en la ventana principal:** evitar multiplicar ventanas modales; usar paneles/drawers
   dentro de la misma vista.
6. **Tolerante a errores:** si el sitio no es compatible, si falta FFmpeg, si no hay internet,
   mensajes claros y accionables (no stacktraces crudos de Python).
7. **Sin cuentas ni backend remoto.** Todo corre 100% local vía el sidecar. Config y
   preferencias se guardan en disco local (JSON), nunca en la nube.

---

## 3. Estructura de pantallas

### 3.1. Pantalla principal (única, sin login)

```
┌──────────────────────────────────────────────────────────┐
│  yt-dlp Desktop                              [⚙ Ajustes]  │
├──────────────────────────────────────────────────────────┤
│                                                            │
│   🔗  [ Pegá la URL del video o playlist...      ] [Ir]   │
│                                                            │
│   ┌──────────────────────────────────────────────────┐   │
│   │  🎬 [thumbnail]  Título del video                │   │
│   │      Canal · Duración 12:34                       │   │
│   │                                                    │   │
│   │  Formato: [▼ MP4]   Calidad: [▼ 1080p]            │   │
│   │  ☐ Solo audio (MP3)     ☐ Subtítulos              │   │
│   │                                                    │   │
│   │  ▸ Opciones avanzadas                              │   │
│   │     ☐ Descargar solo un fragmento                  │   │
│   │       Desde [ 00:00:00 ]   Hasta [ 00:00:00 ]       │   │
│   │                                                    │   │
│   │              [ ⬇ Descargar ]                       │   │
│   └──────────────────────────────────────────────────┘   │
│                                                            │
│   Descargas                                                │
│   ┌──────────────────────────────────────────────────┐   │
│   │ ▶ video1.mp4   ████████████░░░░  72%  4.2MB/s  ETA 8s │
│   │ ✔ video2.mp3   Completado                          │   │
│   │ ✖ video3.mp4   Error: sitio no soportado           │   │
│   └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Estados clave del input de URL:**

- Vacío → placeholder + botón deshabilitado.
- Pegado válido → auto-fetch de metadata (`yt-dlp --dump-json`, sin descargar) para mostrar
  thumbnail/título/duración y poblar el selector de formatos disponibles reales.
- URL de playlist detectada → aviso: "Se detectaron N videos" + opción de descargar todos /
  elegir cuáles.
- URL inválida o sitio no soportado → mensaje inline, sin bloquear el resto de la UI.

### 3.2. Panel de opciones avanzadas (colapsable, no modal)

Exponer (mapeando a flags reales de yt-dlp):

- Selector de formato/codec específico (`-f`)
- Carpeta de destino (con recordatorio de la última usada)
- Plantilla de nombre de archivo (`-o`)
- Descargar subtítulos + idioma (`--sub-lang`)
- Descargar miniatura embebida (`--embed-thumbnail`)
- Límite de velocidad (`--limit-rate`)
- **Rango de tiempo / recorte (`--download-sections "*HH:MM:SS-HH:MM:SS"`):** dos campos tipo
  timestamp, "Desde" y "Hasta", con opción de dejar alguno vacío (equivale a "desde el inicio"
  o "hasta el final"). Requiere que el toggle "Descargar solo un fragmento" esté activo; si
  está desactivado, se descarga el video completo (comportamiento por defecto). Importante:
  esta operación reclama a FFmpeg para cortar, así que depende de que esté disponible.
- Cookies desde navegador, para contenido que lo requiera (`--cookies-from-browser`)
- Reintentos automáticos (ya viene por defecto en yt-dlp, mostrar como info, no como toggle)

### 3.3. Cola de descargas (panel inferior, siempre visible)

- Lista de descargas en curso / completadas / con error, orden más reciente arriba.
- Cada ítem: nombre, barra de progreso real, velocidad, ETA, botón cancelar/reintentar.
- Click en completado → abrir carpeta contenedora (acción nativa vía Tauri, `shell.open`).
- Persistir historial simple entre sesiones (JSON local), con opción de limpiarlo.

### 3.4. Ajustes (drawer lateral, no pantalla separada)

- Carpeta de descarga por defecto.
- Tema claro/oscuro (o "seguir sistema").
- Verificar actualización de yt-dlp (botón manual, `yt-dlp -U`), mostrando versión actual.
- Ruta de FFmpeg (auto-detectar; permitir override manual si no lo encuentra).
- Idioma de la interfaz.

**Nada de:** pantalla de login, creación de cuenta, sync en la nube, telemetría/analytics.

---

## 4. Guía visual (shadcn/ui + Tailwind)

Usar **shadcn/ui** como base de componentes (no una librería instalada como dependencia
tradicional, sino componentes copiados al proyecto vía su CLI y estilados con Tailwind) para
tener consistencia visual, accesibilidad ya resuelta, y look moderno tipo "dev tool" sin tener
que diseñar cada control desde cero.

- **Estética:** moderna, oscura por defecto (dark mode first, con toggle a claro vía el theming
  nativo de shadcn), similar a herramientas dev actuales (Linear, Raycast, Vercel dashboard) —
  no un "reproductor" ni un clon de YouTube.
- **Tema de shadcn:** partir del preset `zinc` o `slate` como base neutra, con un color de
  acento único (`accentColor` en `components.json` / variable CSS `--primary`) para acciones
  primarias — ej. algo en la línea de índigo o esmeralda — usado en el botón Descargar, las
  barras de progreso activas, y los estados de foco.
- **Tipografía:** `Inter` (o la que traiga el template de shadcn por defecto), con jerarquía
  clara entre título de video, metadata secundaria (`text-muted-foreground`) y controles.
- **Componentes de shadcn a usar directamente:**
  - `Input` — para la URL, con ícono de link embebido (`lucide-react`).
  - `Card` — contenedor del detalle de video y de cada item en la cola de descargas.
  - `Select` — formato y calidad.
  - `Checkbox` — solo audio, subtítulos, "descargar solo un fragmento".
  - `Accordion` — para "Opciones avanzadas" (colapsable, coincide 1:1 con el patrón de
    progressive disclosure ya definido).
  - `Progress` — barra de progreso de cada descarga; actualizar su valor en tiempo real según
    los eventos emitidos por el sidecar. Color según estado vía `className` condicional
    (en curso = `--primary`, completado = verde éxito, error = rojo destructivo).
  - `Button` — variantes `default` (Descargar), `outline`/`ghost` (acciones secundarias como
    cancelar o abrir carpeta).
  - `Sheet` — panel lateral de Ajustes (drawer), en vez de una pantalla aparte.
  - `Toast` (`sonner` o el `use-toast` de shadcn) — confirmaciones y errores no intrusivos, en
    vez de `alert()` nativo.
  - `Skeleton` — estado de carga mientras se hace el fetch de metadata del video (thumbnail,
    título) antes de que responda `yt-dlp --dump-json`.
  - **Para el rango de tiempo (Desde/Hasta):** dos `Input` tipo texto con máscara `HH:MM:SS`
    (o un `Input` numérico simple + separador), habilitados solo cuando el `Checkbox`
    "Descargar solo un fragmento" está activo — deshabilitados (`disabled`) y con opacidad
    reducida el resto del tiempo, siguiendo el estilo estándar de shadcn para campos inactivos.
- **Micro-interacciones:** hover/focus states que ya trae shadcn out-of-the-box (basados en
  Radix UI por debajo), spinner discreto (`Loader2` de `lucide-react` con `animate-spin`)
  durante el fetch de metadata.
- **Responsive dentro de la ventana:** la ventana de escritorio puede redimensionarse; layout
  en columna única en anchos chicos, dos columnas (detalle + cola) en anchos grandes, usando
  utilidades de Tailwind (`grid`, `lg:grid-cols-2`) por encima de los componentes de shadcn.

---

## 5. Arquitectura técnica (resumen para implementación)

- **Frontend:** React + TypeScript + Tailwind + shadcn/ui, dentro del WebView de Tauri.
- **Backend/lógica:** binario de `yt-dlp` (ya compilado standalone) declarado como
  `externalBin` en `tauri.conf.json`, invocado como sidecar.
- **Comunicación:**
  - Metadata: `yt-dlp --dump-json <url>` (sin `--no-download`... en realidad usar
    `--skip-download --dump-json`) → parsear JSON → poblar UI.
  - Descarga: `yt-dlp <url> -f <formato> -o <destino>` lanzado con `spawn` (no `execute`), leyendo
    stdout línea por línea para parsear el progreso (yt-dlp imprime `[download]  72.3% ...`)
    y emitir eventos al frontend (`window.emit`) para actualizar la barra en tiempo real.
- **Dependencia externa:** verificar presencia de FFmpeg al iniciar la app; si falta, avisar
  con instrucciones claras (o, mejor, empaquetarlo también como sidecar/resource para que el
  usuario no tenga que instalar nada).
- **Sin backend propio, sin red más que la que yt-dlp necesita.** Todo el estado vive en el
  frontend (React state) + persistencia simple en disco (archivo de config JSON en el
  directorio de datos de la app), nunca `localStorage`.

---

## 6. Fuera de alcance (para v1)

- Cuentas de usuario / login.
- Sincronización entre dispositivos.
- Edición de video (recorte visual, etc.) — el recorte por tiempo vía flags de yt-dlp sí entra
  como opción avanzada, pero no un editor.
- Gestión de canales/suscripciones tipo Tartube (se puede evaluar para v2).
