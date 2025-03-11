import {
  adoptUserNodes,
  type ColorModeClass,
  type ConnectionLookup,
  ConnectionMode,
  type ConnectionState,
  type CoordinateExtent,
  createMarkerIds,
  devWarn,
  type EdgeLookup,
  getInternalNodesBounds,
  getViewportForBounds,
  infiniteExtent,
  initialConnection,
  type NodeLookup,
  type PanZoomInstance,
  type ParentLookup,
  pointToRendererPoint,
  SelectionMode,
  type SelectionRect,
  type Transform,
  updateConnectionLookup,
  type Viewport,
} from '@xyflow/system';

import { DefaultNode } from '../components/nodes/DefaultNode';
import { InputNode } from '../components/nodes/InputNode';
import { OutputNode } from '../components/nodes/OutputNode';
import { GroupNode } from '../components/nodes/GroupNode';

import {
  BezierEdgeInternal,
  SmoothStepEdgeInternal,
  StepEdgeInternal,
  StraightEdgeInternal,
} from '../components/edges';

import type { Edge, EdgeLayouted, EdgeTypes, InternalNode, Node, NodeTypes } from '../types';

import type { StoreSignals } from './types';
import { createEffect, createMemo, createSignal, mergeProps, onCleanup } from 'solid-js';
import { type EdgeLayoutAllOptions, getLayoutedEdges, getVisibleNodes } from './visibleElements';

export const initialNodeTypes = {
  input: InputNode,
  output: OutputNode,
  default: DefaultNode,
  group: GroupNode,
};

export const initialEdgeTypes = {
  straight: StraightEdgeInternal,
  smoothstep: SmoothStepEdgeInternal,
  default: BezierEdgeInternal,
  step: StepEdgeInternal,
};

// Create a custom MediaQuery implementation for SolidJS
const createMediaQuery = (query: string, initialState = false) => {
  const [matches, setMatches] = createSignal(initialState);

  createEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Add listener
    mediaQuery.addEventListener('change', handler);

    // Cleanup
    onCleanup(() => {
      mediaQuery.removeEventListener('change', handler);
    });
  });

  return {
    get current() {
      return matches();
    },
  };
};

export const getInitialStore = (signals: StoreSignals) => {
  // Create store using Solid's primitives
  const [nodes, setNodes] = createSignal(signals.nodes || []);
  const [edges, setEdges] = createSignal(signals.edges || []);

  // Create signals for various store values
  const [domNode, setDomNode] = createSignal<HTMLDivElement | null>(null);
  const [width, setWidth] = createSignal<number>(signals.width ?? 0);
  const [height, setHeight] = createSignal<number>(signals.height ?? 0);

  const [fitViewOnInitDone, setFitViewOnInitDone] = createSignal(false);
  const [panZoom, setPanZoom] = createSignal<PanZoomInstance | null>(null);

  const [dragging, setDragging] = createSignal(false);
  const [selectionRect, setSelectionRect] = createSignal<SelectionRect | null>(null);

  const [selectionKeyPressed, setSelectionKeyPressed] = createSignal(false);
  const [multiselectionKeyPressed, setMultiselectionKeyPressed] = createSignal(false);
  const [deleteKeyPressed, setDeleteKeyPressed] = createSignal(false);
  const [panActivationKeyPressed, setPanActivationKeyPressed] = createSignal(false);
  const [zoomActivationKeyPressed, setZoomActivationKeyPressed] = createSignal(false);
  const [selectionRectMode, setSelectionRectMode] = createSignal<string | null>(null);

  // Convert these properties to signals instead of memos to support setters
  const [nodeTypes, setNodeTypes] = createSignal<NodeTypes>({ ...initialNodeTypes, ...signals.props.nodeTypes });
  const [edgeTypes, setEdgeTypes] = createSignal<EdgeTypes>({ ...initialEdgeTypes, ...signals.props.edgeTypes });
  const [minZoom, setMinZoom] = createSignal<number>(signals.props.minZoom ?? 0.5);
  const [maxZoom, setMaxZoom] = createSignal<number>(signals.props.maxZoom ?? 2);
  const [translateExtent, setTranslateExtent] = createSignal<CoordinateExtent>(
    signals.props.translateExtent ?? infiniteExtent
  );
  const [nodesDraggable, setNodesDraggable] = createSignal<boolean>(signals.props.nodesDraggable ?? true);
  const [nodesConnectable, setNodesConnectable] = createSignal<boolean>(signals.props.nodesConnectable ?? true);
  const [elementsSelectable, setElementsSelectable] = createSignal<boolean>(signals.props.elementsSelectable ?? true);

  const initialViewport = signals.props.initialViewport ?? { x: 0, y: 0, zoom: 1 };
  const [_viewport, setViewport] = createSignal<Viewport>(initialViewport);

  const [_connection, setConnection] = createSignal<ConnectionState>(initialConnection);

  const [nodesInitialized, setNodesInitialized] = createSignal(false);
  const [edgesInitialized, setEdgesInitialized] = createSignal(false);
  const [viewportInitialized, setViewportInitialized] = createSignal(false);

  // Create nodeLookup and other maps
  const nodeLookup: NodeLookup = new Map();
  const parentLookup: ParentLookup = new Map();
  const connectionLookup: ConnectionLookup = new Map();
  const edgeLookup: EdgeLookup = new Map();
  const _prevVisibleEdges = new Map<string, EdgeLayouted>();

  // Create a media query for dark mode
  const _prefersDark = createMediaQuery('(prefers-color-scheme: dark)', signals.props.colorModeSSR === 'dark');

  const defaultProps = {
    id: '1',
    nodeOrigin: [0, 0],
    nodeExtent: infiniteExtent,
    defaultEdgeOptions: {},
    nodeDragThreshold: 1,
    autoPanOnNodeDrag: true,
    autoPanOnConnect: true,
    fitView: false,
    fitViewOptions: undefined,
    snapGrid: null,
    selectionMode: SelectionMode.Partial,
    connectionMode: ConnectionMode.Strict,
    connectionRadius: 20,
    isValidConnection: () => true,
    nodesDraggable: true,
    nodesConnectable: true,
    elementsSelectable: true,
    selectNodesOnDrag: true,
    defaultMarkerColor: '#b1b1b7',
    onlyRenderVisibleElements: false,
    onerror: devWarn,
    ondelete: undefined,
    onedgecreate: undefined,
    onconnect: undefined,
    onconnectstart: undefined,
    onconnectend: undefined,
    onbeforedelete: undefined,
  };

  const mergedProps = mergeProps(defaultProps, signals.props);

  const flowId = createMemo(() => mergedProps.id);
  const nodeOrigin = createMemo(() => mergedProps.nodeOrigin);
  const nodeExtent = createMemo(() => mergedProps.nodeExtent);
  const defaultEdgeOptions = createMemo(() => mergedProps.defaultEdgeOptions);
  const nodeDragThreshold = createMemo(() => mergedProps.nodeDragThreshold);
  const autoPanOnNodeDrag = createMemo(() => mergedProps.autoPanOnNodeDrag);
  const autoPanOnConnect = createMemo(() => mergedProps.autoPanOnConnect);
  const fitViewOnInit = createMemo(() => mergedProps.fitView);
  const fitViewOptions = createMemo(() => mergedProps.fitViewOptions);
  const snapGrid = createMemo(() => mergedProps.snapGrid);
  const selectionMode = createMemo(() => mergedProps.selectionMode);

  // Create memos for derived values
  const _nodesWithAdoption = createMemo(() => {
    adoptUserNodes(nodes(), nodeLookup, parentLookup, {
      nodeExtent: nodeExtent(),
      nodeOrigin: nodeOrigin(),
      elevateNodesOnSelect: signals.props.elevateNodesOnSelect ?? true,
      checkEquality: true,
    });
    return nodes();
  });

  const _edgesWithConnection = createMemo(() => {
    updateConnectionLookup(connectionLookup, edgeLookup, edges());
    return edges();
  });

  const viewport = () => signals.viewport ?? _viewport();

  const connection = createMemo(() => {
    const conn = _connection();
    if (conn.inProgress) {
      return {
        ...conn,
        to: pointToRendererPoint(conn.to, [viewport().x, viewport().y, viewport().zoom]),
      };
    } else {
      return conn;
    }
  });

  const defaultMarkerColor = createMemo(() => mergedProps.defaultMarkerColor);

  const markers = createMemo(() => {
    return createMarkerIds(edges(), {
      defaultColor: defaultMarkerColor(),
      id: flowId(),
      defaultMarkerStart: defaultEdgeOptions().markerStart,
      defaultMarkerEnd: defaultEdgeOptions().markerEnd,
    });
  });

  const _initialNodesLength = signals.nodes?.length ?? 0;
  const _initialEdgesLength = signals.edges?.length ?? 0;

  const initialized = createMemo(() => {
    let init: boolean;
    // if it hasn't been initialised check if it's now
    if (_initialNodesLength === 0) {
      init = viewportInitialized();
    } else if (_initialEdgesLength === 0) {
      init = viewportInitialized() && nodesInitialized();
    } else {
      init = viewportInitialized() && nodesInitialized() && edgesInitialized();
    }
    return init;
  });

  const colorMode = createMemo<ColorModeClass>(() =>
    signals.props.colorMode === 'system'
      ? _prefersDark.current
        ? 'dark'
        : 'light'
      : (signals.props.colorMode ?? 'light')
  );

  const visible = createMemo(() => {
    // Access the dependent memos to trigger reactivity
    const tempNodes = _nodesWithAdoption();
    const tempEdges = _edgesWithConnection();
    const tempViewport = viewport();
    let visibleNodes: Map<string, InternalNode>;
    let visibleEdges: Map<string, EdgeLayouted>;

    const options = {
      edges: _edgesWithConnection(),
      previousEdges: _prevVisibleEdges,
      nodeLookup,
      connectionMode: mergedProps.connectionMode,
      onerror: mergedProps.onerror,
    };

    if (mergedProps.onlyRenderVisibleElements) {
      // We only use viewport, width, height if onlyRenderVisibleElements is true
      const viewportValue = viewport();
      const widthValue = width();
      const heightValue = height();
      const transform: Transform = [viewportValue.x, viewportValue.y, viewportValue.zoom];

      visibleNodes = getVisibleNodes(nodeLookup, transform, widthValue, heightValue);
      visibleEdges = getLayoutedEdges({
        ...options,
        onlyRenderVisible: true,
        visibleNodes,
        transform,
        width: widthValue,
        height: heightValue,
      });
    } else {
      visibleNodes = nodeLookup;
      visibleEdges = getLayoutedEdges(options as EdgeLayoutAllOptions);
    }

    return {
      nodes: visibleNodes,
      edges: visibleEdges,
    };
  });

  // Wrap the signal access in createEffect to properly track dependencies
  // TODO: This used to be in the constructor, but now it's not, this should approximate it.
  if (signals.props.fitView && !signals.props.initialViewport && signals.width && signals.height) {
    const bounds = getInternalNodesBounds(nodeLookup, {
      filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight)),
    });
    setViewport(getViewportForBounds(bounds, signals.width, signals.height, 0.5, 2, 0.1));
  }

  if (process.env.NODE_ENV === 'development') {
    warnIfDeeplyReactive(signals.nodes, 'nodes');
    warnIfDeeplyReactive(signals.edges, 'edges');
  }

  // Return the store object with methods to update the state
  return {
    // Getter/setters
    get nodes() {
      return _nodesWithAdoption();
    },
    set nodes(newNodes: Node[]) {
      signals.nodes = newNodes;
      setNodes(newNodes);
    },

    get edges() {
      return _edgesWithConnection();
    },
    set edges(newEdges: Edge[]) {
      signals.edges = newEdges;
      setEdges(newEdges);
    },

    get viewport() {
      return viewport();
    },
    set viewport(newViewport: Viewport) {
      if (signals.viewport) {
        signals.viewport = newViewport;
      }
      setViewport(newViewport);
    },

    // Maps
    nodeLookup,
    parentLookup,
    connectionLookup,
    edgeLookup,
    _prevVisibleEdges,

    // Getters for memos
    get visible() {
      return visible();
    },
    get flowId() {
      return flowId();
    },
    get minZoom() {
      return minZoom();
    },
    set minZoom(value: number) {
      setMinZoom(value);
    },
    get maxZoom() {
      return maxZoom();
    },
    set maxZoom(value: number) {
      setMaxZoom(value);
    },
    get nodeOrigin() {
      return nodeOrigin();
    },
    get nodeExtent() {
      return nodeExtent();
    },
    get translateExtent() {
      return translateExtent();
    },
    set translateExtent(value: CoordinateExtent) {
      setTranslateExtent(value);
    },
    get defaultEdgeOptions() {
      return defaultEdgeOptions();
    },
    get nodeDragThreshold() {
      return nodeDragThreshold();
    },
    get autoPanOnNodeDrag() {
      return autoPanOnNodeDrag();
    },
    get autoPanOnConnect() {
      return autoPanOnConnect();
    },
    get fitViewOnInit() {
      return fitViewOnInit();
    },
    get fitViewOptions() {
      return fitViewOptions();
    },
    get snapGrid() {
      return snapGrid();
    },
    get selectionMode() {
      return selectionMode();
    },
    get nodeTypes() {
      return nodeTypes();
    },
    set nodeTypes(value: NodeTypes) {
      setNodeTypes(value);
    },
    get edgeTypes() {
      return edgeTypes();
    },
    set edgeTypes(value: EdgeTypes) {
      setEdgeTypes(value);
    },
    get connection() {
      return connection();
    },
    get connectionMode() {
      return mergedProps.connectionMode;
    },
    get connectionRadius() {
      return mergedProps.connectionRadius;
    },
    get isValidConnection() {
      return mergedProps.isValidConnection;
    },
    get nodesDraggable() {
      return nodesDraggable();
    },
    set nodesDraggable(value: boolean) {
      setNodesDraggable(value);
    },
    get nodesConnectable() {
      return nodesConnectable();
    },
    set nodesConnectable(value: boolean) {
      setNodesConnectable(value);
    },
    get elementsSelectable() {
      return elementsSelectable();
    },
    set elementsSelectable(value: boolean) {
      setElementsSelectable(value);
    },
    get selectNodesOnDrag() {
      return mergedProps.selectNodesOnDrag;
    },
    get defaultMarkerColor() {
      return defaultMarkerColor();
    },
    get markers() {
      return markers();
    },
    get onlyRenderVisibleElements() {
      return mergedProps.onlyRenderVisibleElements;
    },
    get onerror() {
      return mergedProps.onerror;
    },
    get ondelete() {
      return mergedProps.ondelete;
    },
    get onedgecreate() {
      return mergedProps.onedgecreate;
    },
    get onconnect() {
      return mergedProps.onconnect;
    },
    get onconnectstart() {
      return mergedProps.onconnectstart;
    },
    get onconnectend() {
      return mergedProps.onconnectend;
    },
    get onbeforedelete() {
      return mergedProps.onbeforedelete;
    },
    get initialized() {
      return initialized();
    },
    get colorMode() {
      return colorMode();
    },

    // Signal getters and setters
    get domNode() {
      return domNode();
    },
    set domNode(newDomNode: HTMLDivElement | null) {
      setDomNode(newDomNode);
    },

    get width() {
      return width();
    },
    set width(newWidth: number) {
      setWidth(newWidth);
    },

    get height() {
      return height();
    },
    set height(newHeight: number) {
      setHeight(newHeight);
    },

    get fitViewOnInitDone() {
      return fitViewOnInitDone();
    },
    set fitViewOnInitDone(value: boolean) {
      setFitViewOnInitDone(value);
    },

    get panZoom() {
      return panZoom();
    },
    set panZoom(value: PanZoomInstance | null) {
      setPanZoom(value);
    },

    get dragging() {
      return dragging();
    },
    set dragging(value: boolean) {
      setDragging(value);
    },

    get selectionRect() {
      return selectionRect();
    },
    set selectionRect(value: SelectionRect | null) {
      setSelectionRect(value);
    },

    get selectionKeyPressed() {
      return selectionKeyPressed();
    },
    set selectionKeyPressed(value: boolean) {
      setSelectionKeyPressed(value);
    },

    get multiselectionKeyPressed() {
      return multiselectionKeyPressed();
    },
    set multiselectionKeyPressed(value: boolean) {
      setMultiselectionKeyPressed(value);
    },

    get deleteKeyPressed() {
      return deleteKeyPressed();
    },
    set deleteKeyPressed(value: boolean) {
      setDeleteKeyPressed(value);
    },

    get panActivationKeyPressed() {
      return panActivationKeyPressed();
    },
    set panActivationKeyPressed(value: boolean) {
      setPanActivationKeyPressed(value);
    },

    get zoomActivationKeyPressed() {
      return zoomActivationKeyPressed();
    },
    set zoomActivationKeyPressed(value: boolean) {
      setZoomActivationKeyPressed(value);
    },

    get selectionRectMode() {
      return selectionRectMode();
    },
    set selectionRectMode(value: string | null) {
      setSelectionRectMode(value);
    },

    get nodesInitialized() {
      return nodesInitialized();
    },
    set nodesInitialized(value: boolean) {
      setNodesInitialized(value);
    },

    get edgesInitialized() {
      return edgesInitialized();
    },
    set edgesInitialized(value: boolean) {
      setEdgesInitialized(value);
    },

    get viewportInitialized() {
      return viewportInitialized();
    },
    set viewportInitialized(value: boolean) {
      setViewportInitialized(value);
    },

    // Internal values that need to be exposed
    get _viewport() {
      return _viewport();
    },
    get _connection() {
      return _connection();
    },
    set _connection(value: ConnectionState) {
      setConnection(value);
    },

    _initialNodesLength,
    _initialEdgesLength,
    _prefersDark,

    // Methods
    resetStoreValues() {
      // Reset all store values here when needed
    },
  };
};

// Only way to check if an object is a proxy
// is to see if it fails to perform a structured clone
function warnIfDeeplyReactive(array: unknown[] | undefined, name: string) {
  try {
    if (array && array.length > 0) {
      structuredClone(array[0]);
    }
  } catch {
    console.warn(`Use plain objects for ${name} to prevent performance issues.`);
  }
}
