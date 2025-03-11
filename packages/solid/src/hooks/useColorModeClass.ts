import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import type { ColorMode, ColorModeClass } from '@xyflow/system';

function getMediaQuery() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return window.matchMedia('(prefers-color-scheme: dark)');
}

/**
 * Hook for receiving the current color mode class 'dark' or 'light'.
 *
 * @internal
 * @param colorMode - The color mode to use ('dark', 'light' or 'system')
 */
export function useColorModeClass(colorMode: ColorMode): Accessor<ColorModeClass> {
  const [colorModeClass, setColorModeClass] = createSignal<ColorModeClass | null>(
    colorMode === 'system' ? null : colorMode
  );

  createEffect(() => {
    if (colorMode !== 'system') {
      setColorModeClass(colorMode);
      return;
    }

    const mediaQuery = getMediaQuery();
    const updateColorModeClass = () => setColorModeClass(mediaQuery?.matches ? 'dark' : 'light');

    updateColorModeClass();
    mediaQuery?.addEventListener('change', updateColorModeClass);

    onCleanup(() => {
      mediaQuery?.removeEventListener('change', updateColorModeClass);
    });
  });

  // Use createMemo to create a reactive computation that will track dependencies
  const resultMemo = createMemo(() =>
    colorModeClass() !== null ? colorModeClass()! : getMediaQuery()?.matches ? 'dark' : 'light'
  );

  return resultMemo;
}
