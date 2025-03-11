import { createEffect, createRenderEffect } from 'solid-js';

// we need this hook to prevent a warning when using solid-flow in SSR
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? createRenderEffect : createEffect;
