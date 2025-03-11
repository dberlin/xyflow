// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JSX, splitProps } from 'solid-js';
import type { SolidFlowRestProps } from '../../store/types';
import './Wrapper.css';

type WrapperProps = {
  width?: number;
  height?: number;
  colorMode?: string;
  children?: JSX.Element;
  domNode: HTMLDivElement;
  setDomNode: (domNode: HTMLDivElement) => void;
  clientWidth: number;
  setClientWidth: (clientWidth: number) => void;
  clientHeight: number;
  setClientHeight: (clientHeight: number) => void;
} & SolidFlowRestProps &
  JSX.HTMLAttributes<HTMLDivElement>;

const Wrapper = (props: WrapperProps) => {
  /* onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        props.setClientWidth(entry.contentRect.width);
        props.setClientHeight(entry.contentRect.height);
      }
    });

    const currentNode = props.domNode;
    if (currentNode) {
      resizeObserver.observe(currentNode);
    }

    return () => {
      if (currentNode) {
        resizeObserver.unobserve(currentNode);
      }
    };
  });*/
  const flowPropNames: (keyof SolidFlowRestProps)[] = [
    'id',
    'nodeTypes',
    'edgeTypes',
    'colorMode',
    'isValidConnection',
    'onerror',
    'ondelete',
    'onbeforedelete',
    'onedgecreate',
    'onconnect',
    'onconnectstart',
    'onconnectend',
    'oninit',
    'fitView',
    'fitViewOptions',
    'nodeOrigin',
    'nodeDragThreshold',
    'minZoom',
    'maxZoom',
    'initialViewport',
    'connectionRadius',
    'connectionMode',
    'selectionMode',
    'selectNodesOnDrag',
    'snapGrid',
    'defaultMarkerColor',
    'nodesDraggable',
    'nodesConnectable',
    'elementsSelectable',
    'translateExtent',
    'nodeExtent',
    'onlyRenderVisibleElements',
    'autoPanOnConnect',
    'autoPanOnNodeDrag',
    'colorModeSSR',
    'style',
    'defaultEdgeOptions',
    'elevateNodesOnSelect',
  ];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localProps, flowProps, divProps]: [WrapperProps, SolidFlowRestProps, JSX.HTMLAttributes<HTMLDivElement>] =
    splitProps(
      props,
      [
        'domNode',
        'setDomNode',
        'clientWidth',
        'setClientWidth',
        'clientHeight',
        'setClientHeight',
        'class',
        'width',
        'height',
        'children',
      ],
      flowPropNames
    );
  type OnlyDivAttributes<T> = {
    [K in keyof T]: K extends keyof JSX.HTMLAttributes<HTMLDivElement> ? T[K] : never;
  };

  const getClassName = () => {
    const baseClasses = ['solid-flow', 'solid-flow-container'];
    if (props.class) baseClasses.push(props.class);
    if (props.colorMode) baseClasses.push(props.colorMode);
    return baseClasses.join(' ');
  };

  return (
    <div
      {...(divProps satisfies OnlyDivAttributes<typeof divProps>)}
      ref={localProps.setDomNode}
      style={{
        width: props.width ? `${props.width}px` : undefined,
        height: props.height ? `${props.height}px` : undefined,
      }}
      class={getClassName()}
      data-testid="solid-flow__wrapper"
      role="application"
    >
      {props.children}
    </div>
  );
};

export default Wrapper;
