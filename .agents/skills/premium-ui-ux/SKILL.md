---
name: premium-ui-ux
description: Principles for designing modern, high-end, anti-generic web and desktop user interfaces with rich aesthetics and micro-interactions.
---

# Premium UI/UX & Non-Generic Design System

## Visual Polish & Aesthetic Guidelines
1. **Curated Dark Palette**: Avoid raw pure black (`#000000`) or default Tailwind grays. Use rich slate/zinc dark tones (`#09090b` background, `#111113` surface, `#18181b` elevation) with vibrant accent glows (Indigo `#6366f1` / Violet `#8b5cf6`).
2. **Layering & Depth**: Use subtle border highlights (`border-white/10`), soft backdrop blur (`backdrop-blur-md`), and layered card elevations instead of heavy drop shadows.
3. **Typography Scaling**: Rely on modern geometric sans fonts (Inter). Enforce clear hierarchy with distinct font weights (`font-semibold`, `tracking-tight`).

## UX & Micro-Interactions
1. **Interactive Feedback**: Every action button must have distinct hover, focus, and active states (`active:scale-[0.98]`, subtle transition durations `transition-all duration-200`).
2. **Skeleton & Empty States**: Never leave raw blank screens during async metadata fetching. Display sleek animated Skeletons.
3. **Non-Intrusive Toasts**: Use `Sonner` toasts for completion or error alerts instead of disruptive modal dialogs.
4. **Desktop Layout Integrity**: Disable text selection on UI controls (`user-select: none`), maintain crisp border radii (`rounded-xl`), and ensure full responsive scaling for window resizing.
