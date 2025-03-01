import type { CSSProperties, Component, DefineComponent, SVGAttributes, VNode } from 'vue'
import type { BackgroundVariant, Dimensions, ElementData, XYPosition } from './flow'
import type { GraphNode, NodeProps } from './node'
import type { EdgeProps } from './edge'
import type { FitViewParams } from './zoom'

/** Global component names are components registered to the vue instance and are "autoloaded" by their string name */
type GlobalComponentName = string

/** Node Components can either be a component definition or a string name */
export type NodeComponent<Data = ElementData> =
  | Component<NodeProps<Data>>
  | DefineComponent<NodeProps<Data>, any, any, any, any>
  | GlobalComponentName

/** Edge Components can either be a component definition or a string name */
export type EdgeComponent<Data = ElementData> =
  | Component<EdgeProps<Data>>
  | DefineComponent<EdgeProps<Data>, any, any, any, any, any>
  | GlobalComponentName

export type DefaultEdgeTypes = { [key in 'default' | 'straight' | 'smoothstep' | 'step' | 'simplebezier']: EdgeComponent }
export type DefaultNodeTypes = { [key in 'input' | 'output' | 'default']: NodeComponent }

export interface BackgroundProps {
  /** The background pattern variant, {@link BackgroundVariant} */
  variant?: BackgroundVariant
  /** Background pattern gap */
  gap?: number
  /** Background pattern size */
  size?: number
  /** Background pattern color */
  patternColor?: string
  /** Background color */
  bgColor?: string
  /** Background height */
  height?: number
  /** Background width */
  width?: number
  /** Background x-coordinate (offset x) */
  x?: number
  /** Background y-coordinate (offset y) */
  y?: number
}

export interface ControlProps {
  /** Show the zoom icon */
  showZoom?: boolean
  /** Show the fit-view icon */
  showFitView?: boolean
  /** Show the interactive icon */
  showInteractive?: boolean
  /** Params to use on fitView */
  fitViewParams?: FitViewParams
}

/** expects a node and returns a color value */
export type MiniMapNodeFunc<Data = ElementData> = (node: GraphNode<Data>) => string
// hack for vue-type imports
type MiniMapNodeFunc2<Data = ElementData> = (node: GraphNode<Data>) => string
type MiniMapNodeFunc3<Data = ElementData> = (node: GraphNode<Data>) => string

export type ShapeRendering = CSSProperties['shapeRendering']

export interface MiniMapProps<Data = ElementData> {
  /** Node color, can be either a string or a string func that receives the current node */
  nodeColor?: string | MiniMapNodeFunc<Data>
  /** Node stroke color, can be either a string or a string func that receives the current node */
  nodeStrokeColor?: string | MiniMapNodeFunc2<Data>
  /** Additional node class name, can be either a string or a string func that receives the current node */
  nodeClassName?: string | MiniMapNodeFunc3<Data>
  /** Node border radius */
  nodeBorderRadius?: number
  /** Node stroke width */
  nodeStrokeWidth?: number
  /** Background color of minimap */
  maskColor?: string

  width?: number
  height?: number
}

/** these props are passed to mini map node slots */
export interface MiniMapNodeProps {
  id: string
  parentNode?: string
  selected?: boolean
  dragging?: boolean
  position: XYPosition
  dimensions: Dimensions
  borderRadius?: number
  color?: string
  shapeRendering?: ShapeRendering
  strokeColor?: string
  strokeWidth?: number
}

/** these props are passed to edge texts */
export interface EdgeTextProps extends SVGAttributes {
  x: number
  y: number
  label?: string | VNode | Object
  labelStyle?: CSSProperties
  labelShowBg?: boolean
  labelBgStyle?: CSSProperties
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
}
