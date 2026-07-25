
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

## 4. Guía visual — Tema Party Rock

**Referencia oficial:** [tweakcn.com/themes/cmlqxbfu8000004joajt9gs64](https://tweakcn.com/themes/cmlqxbfu8000004joajt9gs64)
**Autor:** bcbelldesign · Tags: colorful, elegant, minimal, playful, retro

### 4.1 Estilo general

- **Estética:** neubrutalist / retro-playful. Bordes negros sólidos (`--border: oklch(0 0 0)` en light), sombras sin blur con desplazamiento fijo (`4px 4px 0px 0px black`), esquinas muy redondeadas (`--radius: 2rem`).
- **Tipografía:** `Inter` — jerarquía clara con `font-bold` para títulos y `text-[var(--muted-foreground)]` para metadata secundaria.
- **Toggle luz/oscuro:** botón Sol/Luna en el Header. Persiste en `localStorage`. El cambio aplica/quita la clase `.dark` en `<html>`.

### 4.2 Variables CSS (Party Rock oficial)

#### Modo claro (`:root`)

| Variable | Valor |
|---|---|
| `--background` | `oklch(0.9559 0.0146 102.4588)` — beige/crema cálido |
| `--foreground` | `oklch(0 0 0)` — negro puro |
| `--card` | `oklch(0.9559 0.0146 102.4588)` — igual al fondo |
| `--primary` | `oklch(0.6268 0.2325 303.9004)` — violeta vibrante |
| `--primary-foreground` | `oklch(1 0 0)` — blanco |
| `--secondary` | `oklch(0.7217 0.1767 305.5038)` — lavanda |
| `--secondary-foreground` | `oklch(0 0 0)` — negro |
| `--muted` | `oklch(0.9255 0.0160 102.8419)` — beige más oscuro |
| `--muted-foreground` | `oklch(0.5103 0 0)` — gris medio |
| `--accent` | `oklch(0.6268 0.2325 303.9004)` — igual al primary |
| `--destructive` | `oklch(0.6730 0.2146 25.0397)` — rojo cálido |
| `--border` | `oklch(0 0 0)` — negro puro |
| `--input` | `oklch(1 0 0)` — blanco puro |
| `--ring` | `oklch(0.6268 0.2325 303.9004)` — violeta |
| `--radius` | `2rem` |

#### Modo oscuro (`.dark`)

| Variable | Valor |
|---|---|
| `--background` | `oklch(0.1822 0 0)` — negro profundo |
| `--foreground` | `oklch(0.9559 0.0146 102.4588)` — beige/crema |
| `--card` | `oklch(0.2393 0 0)` — gris muy oscuro |
| `--primary` | `oklch(0.6268 0.2325 303.9004)` — violeta (igual) |
| `--secondary` | `oklch(0.2850 0 0)` — gris oscuro |
| `--muted` | `oklch(0.2850 0 0)` — gris oscuro |
| `--muted-foreground` | `oklch(0.7058 0 0)` — gris claro |
| `--destructive` | `oklch(0.3767 0.1546 29.2339)` — rojo oscuro |
| `--border` | `oklch(0.3211 0 0)` — gris oscuro |
| `--input` | `oklch(0.2393 0 0)` — gris oscuro |

### 4.3 Sombras (firma neubrutalist)

```css
--shadow-sm:  4px 4px 0px 0px hsl(0 0% 0% / 1.00);
--shadow-md:  4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 2px 4px -1px hsl(0 0% 0% / 1.00);
--shadow-lg:  4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 4px 6px -1px hsl(0 0% 0% / 1.00);
```

**Comportamiento de botones:**
- **Hover:** `translate(-2px, -2px)` + sombra crece a `6px 6px`
- **Active/click:** `translate(2px, 2px)` + sombra se encoge a `2px 2px`

### 4.4 Reglas de uso de color

- **No usar** colores hardcodeados fuera de las variables del tema (sin `#34d399`, sin `oklch(0.55 0.18 145)`, etc.).
- **Todo estado** (descargando, completado, error, procesando) usa `var(--primary)`, `var(--destructive)`, `var(--secondary)` o `color-mix()` sobre esas variables.
- **No mostrar** información irrelevante en la UI (estado de FFmpeg, info del motor, nombre del tema). La interfaz es funcional, no técnica.

### 4.5 Componentes clave

- **Botón primario:** violet fill + border negro + sombra sólida 4px. Anima en hover/click.
- **Cards/secciones:** mismo `--card` color + border negro + sombra `shadow-md`.
- **Input URL:** fondo blanco (`--input`) + border negro + radio grande. Focus: ring violeta + sombra.
- **Barra de progreso:** `var(--primary)` en curso, `var(--destructive)` en error.
- **Badges de estado:** `color-mix(in oklch, var(--primary) 15%, transparent)` como fondo, borde del mismo color al 40%.
- **Drawer de ajustes:** border izquierdo negro + sombra lateral sólida `−6px 0 0px 0px var(--border)`. Solo muestra carpeta de descarga.

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
