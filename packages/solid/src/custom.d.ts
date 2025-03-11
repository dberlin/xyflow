declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
type SvgrComponent = import('solid-js').Component<import('solid-js').JSX.SvgSVGAttributes<SVGElement>>;

declare module '*.svg' {
  const svgUrl: string;
  const svgComponent: SvgrComponent;
  export default svgUrl;
  export { svgComponent as SolidComponent };
}
