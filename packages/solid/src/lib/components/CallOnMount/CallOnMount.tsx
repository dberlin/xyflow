import type { Component } from 'solid-js';
import { onCleanup, onMount } from 'solid-js';

type CallOnMountProps = {
  onMount?: () => void;
  onDestroy?: () => void;
};

export const CallOnMount: Component<CallOnMountProps> = (props) => {
  onMount(() => {
    props.onMount?.();
    onCleanup(() => {
      props.onDestroy?.();
    });
  });

  return null;
};
