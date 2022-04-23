import { useDraggableCore } from '@braks/revue-draggable'
import { MaybeElementRef, MaybeRef } from '@vueuse/core'
import useVueFlow from './useVueFlow'
import { SnapGrid } from '~/types'

type UseDragParams = {
  dragHandle?: MaybeRef<string>
  snapGrid?: MaybeRef<SnapGrid>
  draggable: MaybeRef<boolean>
}

const useDrag = (
  el: MaybeElementRef,
  params: UseDragParams,
): Pick<ReturnType<typeof useDraggableCore>, 'onDrag' | 'onDragStop' | 'onDragStart'> => {
  const { dragHandle, snapGrid, draggable } = reactive(params)

  const { viewport, noDragClassName } = $(useVueFlow())

  const { scale, disabled, handle, cancel, grid, onDrag, onDragStart, onDragStop } = useDraggableCore(el, {
    handle: dragHandle,
    disabled: !draggable,
    grid: snapGrid,
    cancel: `.${noDragClassName}`,
    enableUserSelectHack: false,
    scale: viewport.zoom,
  })

  debouncedWatch(
    () => viewport.zoom,
    () => {
      nextTick(() => (scale.value = viewport.zoom))
    },
    { debounce: 5, flush: 'post' },
  )

  watch(
    () => draggable,
    () => {
      disabled.value = !draggable
    },
  )

  watch(
    () => dragHandle,
    () => {
      if (dragHandle) handle.value = dragHandle
    },
  )

  watch($$(noDragClassName), () => {
    if (noDragClassName) cancel.value = noDragClassName as any
  })

  watch(
    () => snapGrid,
    () => {
      if (grid) grid.value = snapGrid
    },
  )

  return {
    onDragStart,
    onDrag,
    onDragStop,
  }
}

export default useDrag
