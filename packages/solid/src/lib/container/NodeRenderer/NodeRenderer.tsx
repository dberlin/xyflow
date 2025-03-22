import { Component, createMemo, For, onCleanup } from 'solid-js';
import { NodeWrapper } from '../../components/NodeWrapper';
import type { InternalNode, NodeEvents } from '../../types';
import type { SolidFlowStore } from '../../store/types';
import './NodeRenderer.css';

type NodeRendererProps = {
  store: SolidFlowStore;
  nodeClickDistance?: number;
} & NodeEvents;

export const NodeRenderer: Component<NodeRendererProps> = (props) => {
  const resizeObserver: ResizeObserver | null =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries: ResizeObserverEntry[]) => {
          const updates = new Map();

          for (const entry of entries) {
            const id = entry.target.getAttribute('data-id') as string;

            updates.set(id, {
              id,
              nodeElement: entry.target as HTMLDivElement,
              force: true,
            });
          }

          props.store.updateNodeInternals(updates);
        });

  onCleanup(() => {
    resizeObserver?.disconnect();
  });
  const visibleNodeVals = createMemo(()=>Array.from(props.store.visible.nodes.values()));
  return (
    <div class="solid-flow__nodes">
      <For each={visibleNodeVals()}>
        {(node: InternalNode) => (
          <NodeWrapper
            store={props.store}
            node={node}
            resizeObserver={resizeObserver}
            nodeClickDistance={props.nodeClickDistance}
            onnodeclick={props.onnodeclick}
            onnodepointerenter={props.onnodepointerenter}
            onnodepointermove={props.onnodepointermove}
            onnodepointerleave={props.onnodepointerleave}
            onnodedrag={props.onnodedrag}
            onnodedragstart={props.onnodedragstart}
            onnodedragstop={props.onnodedragstop}
            onnodecontextmenu={props.onnodecontextmenu}
          />
        )}
      </For>
    </div>
  );
};

/* CSS should be moved to a separate CSS file or CSS module */
/* 
.solid-flow__nodes {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
}
*/
