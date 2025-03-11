import { Component, createMemo } from 'solid-js';
import { getInternalNodesBounds, isNumeric } from '@xyflow/system';

import { Selection } from '../../components/Selection';
// The drag import is used in the JSX via the directive syntax
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import drag from '../../actions/drag';
import type { NodeSelectionProps } from './types';

export const NodeSelection: Component<NodeSelectionProps> = (props) => {
  const bounds = createMemo(() => {
    if (props.store.selectionRectMode === 'nodes') {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      props.store.nodes;
      return getInternalNodesBounds(props.store.nodeLookup, { filter: (node) => !!node.selected });
    }
    return null;
  });

  function oncontextmenu(event: MouseEvent) {
    const selectedNodes = props.store.nodes.filter((n) => n.selected);
    props.onselectioncontextmenu?.({ nodes: selectedNodes, event });
  }

  function onclick(event: MouseEvent) {
    const selectedNodes = props.store.nodes.filter((n) => n.selected);
    props.onselectionclick?.({ nodes: selectedNodes, event });
  }

  // Empty function for onkeyup to satisfy role="button"
  const handleKeyUp = () => {};

  return (
    <>
      {props.store.selectionRectMode === 'nodes' && bounds() && isNumeric(bounds().x) && isNumeric(bounds().y) && (
        <div
          class="selection-wrapper nopan"
          style={{
            width: `${bounds().width}px`,
            height: `${bounds().height}px`,
            transform: `translate(${bounds().x}px, ${bounds().y}px)`,
            position: 'absolute',
            top: '0',
            left: '0',
            'z-index': '7',
            'pointer-events': 'all',
          }}
          use:drag={{
            disabled: false,
            store: props.store,
            onDrag: (event, _, __, nodes) => {
              props.onnodedrag?.({ event, targetNode: null, nodes });
            },
            onDragStart: (event, _, __, nodes) => {
              props.onnodedragstart?.({ event, targetNode: null, nodes });
            },
            onDragStop: (event, _, __, nodes) => {
              props.onnodedragstop?.({ event, targetNode: null, nodes });
            },
          }}
          onContextMenu={oncontextmenu}
          onClick={onclick}
          role="button"
          tabIndex={-1}
          onKeyUp={handleKeyUp}
        >
          <Selection width="100%" height="100%" x={0} y={0} />
        </div>
      )}
    </>
  );
};
