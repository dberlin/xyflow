import type { ColorModeClass } from '@xyflow/system';
import { useStore } from './useStore';

/**
 * Hook for receiving the current color mode class 'dark' or 'light'.
 *
 */
export function useColorMode(): { current: ColorModeClass } {
  const store = useStore();

  return {
    current: store.colorMode,
  };
}
