<script setup>
import { VueFlow, isNode, useVueFlow, getConnectedEdges } from "@braks/vue-flow";
import { nextTick, ref } from 'vue'
import { getElements } from './utils.js'

const { nodes, edges } = getElements(15, 15)
const elements = ref([...nodes, ...edges])

const { onPaneReady, dimensions, instance, onNodeClick, getEdges } = useVueFlow()

onPaneReady((i) => {
  i.fitView({
    padding: 0.2,
  })
  console.log(i.getElements())
})

const toggleClass = () => elements.value.forEach((el) => (el.class = el.class === 'light' ? 'dark' : 'light'))

const updatePos = () => {
  elements.value.forEach((el) => {
    if (isNode(el)) {
      el.position = {
        x: Math.random() * 10 * dimensions.value.width,
        y: Math.random() * 10 * dimensions.value.height,
      }
    }
  })
  nextTick(() => {
    instance.value.fitView({ duration: 1000, padding: 0.5 })
  })
}

onNodeClick(({ connectedEdges }) => {
  connectedEdges.forEach((edge) => {
    edge.style = { stroke: '#10b981', strokeWidth: 3 }
  })
})
</script>

<template>
  <VueFlow v-model="elements" :min-zoom="0.1">
    <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
      <button style="margin-right: 5px" @click="updatePos">update positions</button>
      <button style="margin-right: 5px" @click="toggleClass">toggle class</button>
    </div>
  </VueFlow>
</template>
