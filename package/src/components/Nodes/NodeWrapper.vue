<script lang="ts" setup>
import { CSSProperties } from 'vue'
import { useDrag } from '../../composables'
import { GraphNode, NodeComponent, SnapGrid } from '../../types'
import { NodeId } from '../../context'

interface NodeWrapperProps {
  id: string
  node: GraphNode
  parentNode?: GraphNode
  draggable: boolean
  selectable: boolean
  connectable: boolean
  snapGrid?: SnapGrid
  type: NodeComponent | Function | Object | false
  name: string
}

const { id, type, name, node, parentNode, draggable, selectable, connectable, snapGrid } = defineProps<NodeWrapperProps>()

const emit = defineEmits(['drag', 'dragstart', 'dragstop', 'update-bounds', 'update-position', 'update-xyz', 'update-dimensions'])

provide(NodeId, id)

const nodeElement = ref()

const { onDragStart, onDrag, onDragStop } = useDrag(nodeElement, {
  draggable,
  dragHandle: node.dragHandle,
  snapGrid,
})

onBeforeMount(() => {
  emit('update-position', { id, diff: { x: 0, y: 0 } })
})

onMounted(() => {
  const observer = useResizeObserver(nodeElement, () =>
    emit('update-dimensions', [{ id, nodeElement: nodeElement.value, forceUpdate: true }]),
  )

  watch(
    [() => node.type, () => node.sourcePosition, () => node.targetPosition],
    () => {
      emit('update-dimensions', [{ id, nodeElement: nodeElement.value }])
    },
    { flush: 'post' },
  )

  onBeforeUnmount(() => observer.stop())

  emit('update-dimensions', [{ id, nodeElement: nodeElement.value, forceUpdate: true }])
})

onMounted(() => {
  watch(
    [() => node.position, () => parentNode?.computedPosition, () => node.selected, () => parentNode?.selected],
    () => {
      emit('update-xyz', nodeElement.value)
    },
    { deep: true, flush: 'post' },
  )
})

onUnmounted(() => {
  nodeElement.value = undefined
})

onDragStart(({ event }) => {
  emit('dragstart', event)
})

onDrag(({ event, data: { deltaX, deltaY } }) => {
  emit('drag', event, deltaX, deltaY)
})

onDragStop(({ event, data: { deltaX, deltaY } }) => {
  emit('dragstop', event, deltaX, deltaY)
})

const getClass = computed(() => {
  const extraClass = node.class instanceof Function ? node.class(node) : node.class
  return [
    'vue-flow__node',
    `vue-flow__node-${name}`,
    {
      dragging: node.dragging,
      selected: node.selected,
      selectable,
    },
    extraClass,
  ]
})

const getStyle = computed(() => {
  const styles = (node.style instanceof Function ? node.style(node) : node.style) || {}
  const width = node.width instanceof Function ? node.width(node) : node.width
  const height = node.height instanceof Function ? node.height(node) : node.height
  if (width) styles.width = typeof width === 'string' ? width : `${width}px`
  if (height) styles.height = typeof height === 'string' ? height : `${height}px`

  return {
    zIndex: node.computedPosition.z,
    transform: `translate(${node.computedPosition.x}px,${node.computedPosition.y}px)`,
    pointerEvents: selectable || draggable ? 'all' : 'none',
    ...styles,
  } as CSSProperties
})
</script>
<script lang="ts">
export default {
  name: 'Node',
}
</script>
<template>
  <div ref="nodeElement" :class="getClass" :style="getStyle" :data-id="id">
    <component
      :is="type"
      :id="id"
      :type="node.type"
      :data="node.data"
      :selected="!!node.selected"
      :connectable="connectable"
      :position="node.position"
      :computed-position="node.computedPosition"
      :dimensions="node.dimensions"
      :is-valid-target-pos="node.isValidTargetPos"
      :is-valid-source-pos="node.isValidSourcePos"
      :parent-node="node.parentNode"
      :dragging="!!node.dragging"
      :z-index="node.computedPosition.z"
      :target-position="node.targetPosition"
      :source-position="node.sourcePosition"
      :label="node.label"
      :drag-handle="node.dragHandle"
      :node-element="nodeElement"
    />
  </div>
</template>
