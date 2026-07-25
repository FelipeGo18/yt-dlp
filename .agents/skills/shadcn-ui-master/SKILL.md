---
name: shadcn-ui-master
description: Best practices for implementing and extending shadcn/ui components with React 19, Radix UI primitives, and Class Variance Authority (CVA).
---

# shadcn/ui Component Guidelines

## Core Principles
1. **Radix Primitive Wrapping**: Keep interactive components accessible by extending Radix UI primitives.
2. **CVA Variant Isolation**: Define visual states (variants, sizes) using `cva()` in component files. Never hardcode inline dynamic styles.
3. **CSS Variable Design Tokens**: Use `--color-*` / `var(--color-*)` tokens defined in the design system instead of hardcoded hex or arbitrary HSL values.
4. **Composition Over Props**: Use child slot patterns (`asChild`) to allow flexible wrapping (e.g. Buttons acting as links or dialog triggers).

## Structure
- Store base primitives in `@/components/ui/`
- Store composite domain components in `@/components/`
- Utility functions belong in `@/lib/utils.ts` (`cn(...)` helper combining `clsx` and `tailwind-merge`)
