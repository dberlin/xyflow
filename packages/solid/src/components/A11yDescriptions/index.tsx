import type { JSX } from 'solid-js';
import { useStore } from '../../hooks/useStore';
import type { SolidFlowStore } from '../../types';

const style: JSX.CSSProperties = { display: 'none' };
const ariaLiveStyle: JSX.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  border: 0,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0px, 0px, 0px, 0px)',
  'clip-path': 'inset(100%)',
};

export const ARIA_NODE_DESC_KEY = 'solid-flow__node-desc';
export const ARIA_EDGE_DESC_KEY = 'solid-flow__edge-desc';
export const ARIA_LIVE_MESSAGE = 'solid-flow__aria-live';

const selector = (s: SolidFlowStore) => s.ariaLiveMessage;

function AriaLiveMessage(props: { rfId: string }) {
  const ariaLiveMessage = useStore(selector);

  return (
    <div id={`${ARIA_LIVE_MESSAGE}-${props.rfId}`} aria-live="assertive" aria-atomic="true" style={ariaLiveStyle}>
      {ariaLiveMessage}
    </div>
  );
}

export function A11yDescriptions(props: { rfId: string; disableKeyboardA11y: boolean }) {
  return (
    <>
      <div id={`${ARIA_NODE_DESC_KEY}-${props.rfId}`} style={style}>
        Press enter or space to select a node.
        {!props.disableKeyboardA11y && 'You can then use the arrow keys to move the node around.'}
        Press delete to remove it and escape to cancel.{' '}
      </div>
      <div id={`${ARIA_EDGE_DESC_KEY}-${props.rfId}`} style={style}>
        Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.
      </div>
      {!props.disableKeyboardA11y && <AriaLiveMessage rfId={props.rfId} />}
    </>
  );
}
