import { type Component } from 'solid-js';

import { SmoothStepEdge } from './SmoothStepEdge';
import type { StepEdgeProps } from '../../types';

function createStepEdge(params: { isInternal: boolean }) {
  const StepEdgeComponent: Component<StepEdgeProps> = (props) => {
    return (
      <SmoothStepEdge
        {...props}
        id={params.isInternal ? undefined : props.id}
        pathOptions={{
          borderRadius: 0,
          offset: props.pathOptions?.offset,
        }}
      />
    );
  };

  return StepEdgeComponent;
}

const StepEdge = createStepEdge({ isInternal: false });
const StepEdgeInternal = createStepEdge({ isInternal: true });

export { StepEdge, StepEdgeInternal };
