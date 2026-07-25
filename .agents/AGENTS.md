efffhjgl ie dieese

# Proyecto yt-dlp Desktop — Reglas del Agente

## Skills Activas del Proyecto

Las siguientes skills están creadas y configuradas en `.agents/skills/`:

1. **`shadcn-ui-master`** ([`shadcn-ui-master/SKILL.md`](file:///c:/Users/gonza/Documents/proyectos/yt-dlp/.agents/skills/shadcn-ui-master/SKILL.md))
   - Responsabilidad: Construcción de componentes UI accesibles, variant wrappers con CVA y Shadcn UI.
2. **`react-best-practices`** ([`react-best-practices/SKILL.md`](file:///c:/Users/gonza/Documents/proyectos/yt-dlp/.agents/skills/react-best-practices/SKILL.md))
   - Responsabilidad: Arquitectura React 19, Zustand store, hooks personalizados y manejo seguro de eventos IPC de Tauri sin fugas de memoria.
3. **`premium-ui-ux`** ([`premium-ui-ux/SKILL.md`](file:///c:/Users/gonza/Documents/proyectos/yt-dlp/.agents/skills/premium-ui-ux/SKILL.md))
   - Responsabilidad: Diseño visual no genérico, paleta de colores curada (tema oscuro profundo), micro-animaciones, estados de carga y feedback de usuario.

## Reglas de Compatibilidad (Sin Traslapes)

- Las decisiones visuales y de diseño siguen estrictamente la skill `premium-ui-ux`.
- La composición de componentes UI sigue `shadcn-ui-master`.
- La lógica de negocio, estado y comunicación con Rust sigue `react-best-practices`.
