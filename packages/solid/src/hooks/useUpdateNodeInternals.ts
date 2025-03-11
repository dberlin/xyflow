import type { InternalNodeUpdate, UpdateNodeInternals } from '@xyflow/system';

import { useStoreApi } from './useStore';

/**
 * When you programmatically add or remove handles to a node or update a node's
 * handle position, you need to let Solid Flow know about it using this hook. This
 * will update the internal dimensions of the node and properly reposition handles
 * on the canvas if necessary.
 *
 * @public
 * @returns function for updating node internals
 *
 * @example
 * ```jsx
 * import { createSignal } from 'solid-js';
 * import { Handle, useUpdateNodeInternals } from '@xyflow/solid';
 *
 * export default function RandomHandleNode(props) {
 *   const updateNodeInternals = useUpdateNodeInternals();
 *   const [handleCount, setHandleCount] = createSignal(0);
 *
 *   const randomizeHandleCount = () => {
 *     setHandleCount(Math.floor(Math.random() * 10));
 *     updateNodeInternals(props.id);
 *   };
 *
 *   return (
 *     <>
 *       {Array.from({ length: handleCount() }).map((_, index) => (
 *         <Handle
 *           key={index}
 *           type="target"
 *           position="left"
 *           id={`handle-${index}`}
 *         />
 *       ))}
 *
 *       <div>
 *         <button onClick={randomizeHandleCount}>Randomize handle count</button>
 *         <p>There are {handleCount()} handles on this node.</p>
 *       </div>
 *     </>
 *   );
 * }
 * ```
 * @remarks This hook can only be used in a component that is a child of a
 * {@link SolidFlowProvider} or a {@link SolidFlow} component.
 */
export function useUpdateNodeInternals(): UpdateNodeInternals {
  const store = useStoreApi();

  return (id: string | string[]) => {
    const { domNode } = store.getState();
    const { updateNodeInternals } = store.getActions();
    const updateIds = Array.isArray(id) ? id : [id];
    const updates = new Map<string, InternalNodeUpdate>();

    updateIds.forEach((updateId) => {
      const nodeElement = domNode?.querySelector(`.solid-flow__node[data-id="${updateId}"]`) as HTMLDivElement;

      if (nodeElement) {
        updates.set(updateId, { id: updateId, nodeElement, force: true });
      }
    });

    updateNodeInternals(updates, { triggerFitView: false });
  };
}
