// We distinguish between internal and exported edges
// The internal edges are used directly like custom edges and always get an id, source and target props
// If you import an edge from the library, the id is optional and source and target are not used at all

// @todo: how can we prevent this duplication in ...Edge/ ...EdgeInternal?
// both are quite similar, it's just about 1-2 props that are different
export { BezierEdge } from './BezierEdge';
export { BezierEdgeInternal } from './BezierEdgeInternal';

export { SmoothStepEdge } from './SmoothStepEdge';
export { SmoothStepEdgeInternal } from './SmoothStepEdgeInternal';

export { StraightEdge } from './StraightEdge';
export { StraightEdgeInternal } from './StraightEdgeInternal';

export { StepEdge } from './StepEdge';
export { StepEdgeInternal } from './StepEdgeInternal';

export { BaseEdge } from './BaseEdge';
