---
name: react-best-practices
description: Architecture, state management (Zustand), Tauri event handling, and performance patterns for React 19 desktop applications.
---

# React 19 + Tauri Best Practices

## State Management (Zustand)
1. **Single Source of Truth**: Keep global application state (queue, active downloads, settings) in typed Zustand stores (`@/store/download-store.ts`).
2. **Selective Subscriptions**: Use selector functions when consuming store state to prevent unnecessary component re-renders (`useDownloadStore((s) => s.items)`).
3. **Immer/Immutable Updates**: Never mutate state directly in store actions; return new state objects or shallow copies.

## Tauri IPC & Listener Lifecycle
1. **Clean Event Listeners**: Always store and call unlisten functions in `useEffect` cleanup to prevent listener memory leaks.
```typescript
useEffect(() => {
  const unlisten = listen('download-progress', (event) => {
    // update store
  });
  return () => {
    unlisten.then((fn) => fn());
  };
}, []);
```
2. **Typed Invokes**: Wrap Tauri `invoke` calls in typed helper services (`@/services/tauri.ts`).

## Code Organization
- Component files under 200 lines. Split complex UI into smaller sub-components.
- Keep UI components pure; delegate async desktop IPC logic to stores/services.
