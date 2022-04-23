<script lang="ts" setup>
import { MouseTouchEvent } from '@braks/revue-draggable'
import NodeWrapper from '../../components/Nodes/NodeWrapper.vue'
import { GraphNode, NodeComponent, SnapGrid, UpdateNodeDimensionsParams, UpdateNodePositionsParams } from '../../types'
import { useVueFlow } from '../../composables'
import { Slots } from '../../context'
import { getHandleBounds, getXYZPos } from '../../utils'

const slots = inject(Slots)

const {
  hooks,
  viewport,
  nodesDraggable,
  elementsSelectable,
  nodesConnectable,
  noPanClassName,
  snapToGrid,
  snapGrid,
  selectNodesOnDrag,
  setState,
  getNode,
  getNodes,
  getNodeTypes,
  addSelectedNodes,
  updateNodePosition,
  updateNodeDimensions,
} = $(useVueFlow())

const draggable = (d?: boolean) => (typeof d === 'undefined' ? nodesDraggable : d)
const selectable = (s?: boolean) => (typeof s === 'undefined' ? elementsSelectable : s)
const connectable = (c?: boolean) => (typeof c === 'undefined' ? nodesConnectable : c)
const hasSnapGrid = (sg?: SnapGrid) => (sg ?? snapToGrid ? snapGrid : undefined)

const getType = $computed(() => {
  return (node: GraphNode) => {
    const name = node.type || 'default'
    let nodeType = node.template ?? getNodeTypes[name]
    const instance = getCurrentInstance()

    if (typeof nodeType === 'string') {
      if (instance) {
        const components = Object.keys(instance.appContext.components)
        if (components && components.includes(name)) {
          nodeType = resolveComponent(name, false) as NodeComponent
        }
      }
    }
    if (typeof nodeType !== 'string') return nodeType

    const slot = slots?.[`node-${name}`]
    if (!slot?.({})) {
      console.warn(`[vueflow]: Node type "${node.type}" not found and no node-slot detected. Using fallback type "default".`)
      return false
    }

    return slot
  }
})

const onMouseEnter = (node: GraphNode, event: MouseEvent) => {
  if (!node.dragging) {
    hooks.nodeMouseEnter.trigger({ event, node })
  }
}

const onMouseMove = (node: GraphNode, event: MouseEvent) => {
  if (!node.dragging) {
    hooks.nodeMouseMove.trigger({ event, node })
  }
}

const onMouseLeave = (node: GraphNode, event: MouseEvent) => {
  if (!node.dragging) {
    hooks.nodeMouseLeave.trigger({ event, node })
  }
}

const onContextMenu = (node: GraphNode, event: MouseEvent) => {
  hooks.nodeContextMenu.trigger({
    event,
    node,
  })
}

const onDoubleClick = (node: GraphNode, event: MouseEvent) => hooks.nodeDoubleClick.trigger({ event, node })

const onClick = (node: GraphNode, event: MouseEvent) => {
  if (!draggable(node.draggable)) {
    if (selectable(node.selectable)) {
      setState({
        nodesSelectionActive: false,
      })

      if (!node.selected) addSelectedNodes([node])
    }

    hooks.nodeClick.trigger({ event, node })
  }
}

const onUpdatePosition = (params: UpdateNodePositionsParams) => {
  updateNodePosition(params)
}

const onUpdateXYZPosition = (node: GraphNode, el: HTMLDivElement) => {
  const xyzPos = {
    ...node.position,
    z: node.dragging || node.selected ? 1000 : 0,
  }

  const parent = node.parentNode ? getNode(node.parentNode) : undefined
  if (parent) {
    node.computedPosition = getXYZPos(parent.computedPosition, xyzPos)
  } else {
    node.computedPosition = xyzPos
  }

  node.handleBounds = getHandleBounds(el, viewport.zoom)
}

const onUpdateDimensions = (params: UpdateNodeDimensionsParams[]) => {
  updateNodeDimensions(params)
}

const onDragStart = (event: MouseTouchEvent, node: GraphNode) => {
  const isSelectable = selectable(node.selectable)

  if (selectNodesOnDrag && isSelectable) {
    setState({
      nodesSelectionActive: false,
    })

    if (!node.selected) addSelectedNodes([node])
  } else if (!selectNodesOnDrag && !node.selected && isSelectable) {
    setState({
      nodesSelectionActive: false,
    })

    addSelectedNodes([])
  }
}

const onDrag = (event: MouseTouchEvent, node: GraphNode, x: number, y: number) => {
  updateNodePosition({ id: node.id, diff: { x, y }, dragging: true })
  hooks.nodeDrag.trigger({ event, node })
}

const onDragStop = (event: MouseTouchEvent, node: GraphNode, x: number, y: number) => {
  if (!node.dragging) {
    if (selectable(node.selectable) && !selectNodesOnDrag && !node.selected) {
      addSelectedNodes([node])
    }
    hooks.nodeClick.trigger({ event, node })
    return
  }
  updateNodePosition({ id: node.id, diff: { x, y }, dragging: false })
  hooks.nodeDragStop.trigger({ event, node })
}
</script>
<script lang="ts">
export default {
  name: 'Nodes',
}
</script>
<template>
  <div class="vue-flow__nodes vue-flow__container">
    <NodeWrapper
      v-for="node of getNodes"
      :id="node.id"
      :key="node.id"
      :class="noPanClassName"
      :type="getType(node)"
      :name="getType(node) ? node.type ?? 'default' : 'default'"
      :node="node"
      :parent-node="node.parentNode ? getNode(node.parentNode) : undefined"
      :draggable="draggable(node.draggable)"
      :selectable="selectable(node.selectable)"
      :connectable="connectable(node.connectable)"
      :snap-grid="hasSnapGrid(node.snapGrid)"
      @mouseenter="(e: MouseEvent) => onMouseEnter(node, e)"
      @mousemove="(e: MouseEvent) => onMouseMove(node, e)"
      @mouseleave="(e: MouseEvent) => onMouseLeave(node, e)"
      @contextmenu="(e: MouseEvent) => onContextMenu(node, e)"
      @dblclick="(e: MouseEvent) => onDoubleClick(node, e)"
      @click="(e: MouseEvent) => onClick(node, e)"
      @update-position="onUpdatePosition"
      @update-dimensions="onUpdateDimensions"
      @update-xyz="(el: HTMLDivElement) => onUpdateXYZPosition(node, el)"
      @dragstart="(e: MouseEvent) => onDragStart(e, node)"
      @drag="(e: MouseEvent, x: number, y: number) => onDrag(e, node, x, y)"
      @dragstop="(e: MouseEvent, x: number, y: number) => onDragStop(e, node, x, y)"
    />
  </div>
</template>
