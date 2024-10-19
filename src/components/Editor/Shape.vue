<template>
  <div class="shape" :class="{ active }" :style="{ 'z-index': index }" @mousedown="handleMouseDownOnShape">
    <div
      v-for="item in active ? pointList : []"
      :key="item"
      class="shape-point"
      :class="[item]"
      :style="getPointStyle(item)"
      @mousedown="handleMouseDownOnPoint(item, $event)"
    ></div>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, provide } from "vue"
import { useAppStore } from "@/store/index"
import calculateComponentPositonAndSize from "@/utils/calculateComponentPositonAndSize"
import emitTer from "@/utils/mitt"
import { mod360 } from "@/utils/translate"
import { storeToRefs } from "pinia"

const appStore = useAppStore()
const { setCurComponent, setInEditorStatus, setClickComponentStatus, setShapeStyle } = appStore
const { editor } = storeToRefs(appStore)
const props = defineProps({
  active: {
    type: Boolean,
    default: false,
  },
  element: {
    required: true,
    type: Object,
    default: () => {},
  },
  defaultStyle: {
    required: true,
    type: Object,
    default: () => {},
  },
  index: {
    required: true,
    type: [Number, String],
    default: 0,
  },
})
const pointList = ref(["lt", "t", "rt", "r", "rb", "b", "lb", "l"])
const pointList2 = ref(["lt", "rt", "rb", "lb"])
const cursors = {}
const isActive = computed(() => {
  return props.active && !props.element.isLock
})
const getPointList = computed(() => {
  return props.element.component === "line-shape" ? pointList2 : pointList
})
const handleMouseDownOnShape = (e: any) => {
  setInEditorStatus(true)
  setClickComponentStatus(true)
  e.stopPropagation()
  setCurComponent({ component: props.element, index: props.index })
  const pos = { ...props.defaultStyle }
  const startY = e.clientY
  const startX = e.clientX
  const startTop = Number(pos.top)
  const startLeft = Number(pos.left)
  const move = (moveEvent) => {
    const curX = moveEvent.clientX
    const curY = moveEvent.clientY
    pos.top = curY - startY + startTop
    pos.left = curX - startX + startLeft
    setShapeStyle(pos)
    nextTick(() => {
      emitTer.emit("move", [curY - startY > 0, curX - startX > 0])
    })
  }
  const up = () => {
    emitTer.emit("unMove", "")
    document.removeEventListener("mousemove", move)
    document.removeEventListener("mouseup", up)
  }
  document.addEventListener("mousemove", move)
  document.addEventListener("mouseup", up)
}
const getPointStyle = (point) => {
  if (!point) return
  const { width, height } = props.defaultStyle
  const hasT = /t/.test(point)
  const hasB = /b/.test(point)
  const hasL = /l/.test(point)
  const hasR = /r/.test(point)
  let newLeft = 0
  let newTop = 0

  // 四个角的点
  if (point.length === 2) {
    newLeft = hasL ? 0 : width
    newTop = hasT ? 0 : height
  } else {
    // 上下两点的点，宽度居中
    if (hasT || hasB) {
      newLeft = width / 2
      newTop = hasT ? 0 : height
    }

    // 左右两边的点，高度居中
    if (hasL || hasR) {
      newLeft = hasL ? 0 : width
      newTop = Math.floor(height / 2)
    }
  }

  const style = {
    marginLeft: "-4px",
    marginTop: "-4px",
    left: `${newLeft}px`,
    top: `${newTop}px`,
    cursor: cursors[point],
  }

  return style
}
const handleMouseDownOnPoint = (point, e) => {
  setInEditorStatus(true)
  setClickComponentStatus(true)
  e.stopPropagation()
  e.preventDefault()
  const style = { ...props.defaultStyle }

  // 组件宽高比
  const proportion = style.width / style.height

  // 组件中心点
  const center = {
    x: style.left + style.width / 2,
    y: style.top + style.height / 2,
  }
  // 获取画布位移信息
  const editorRectInfo = editor.value.getBoundingClientRect()
  // 获取 point 与实际拖动基准点的差值 @justJokee
  // fix https://github.com/woai3c/visual-drag-demo/issues/26#issue-937686285
  const pointRect = e.target.getBoundingClientRect()
  // 当前点击圆点相对于画布的中心坐标
  const curPoint = {
    x: Math.round(pointRect.left - editorRectInfo.left + e.target.offsetWidth / 2),
    y: Math.round(pointRect.top - editorRectInfo.top + e.target.offsetHeight / 2),
  }

  // 获取对称点的坐标
  const symmetricPoint = {
    x: center.x - (curPoint.x - center.x),
    y: center.y - (curPoint.y - center.y),
  }
  // 是否需要保存快照
  let needSave = false
  let isFirst = true

  const needLockProportion = isNeedLockProportion()
  const move = (moveEvent) => {
    // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
    // 因此第一次点击时不触发 move 事件
    if (isFirst) {
      isFirst = false
      return
    }

    needSave = true
    const curPositon = {
      x: moveEvent.clientX - Math.round(editorRectInfo.left),
      y: moveEvent.clientY - Math.round(editorRectInfo.top),
    }
    calculateComponentPositonAndSize(point, style, curPositon, proportion, needLockProportion, {
      center,
      curPoint,
      symmetricPoint,
    })
    setShapeStyle(style)
    // this.$store.commit("setShapeStyle", style)
  }

  const up = () => {
    document.removeEventListener("mousemove", move)
    document.removeEventListener("mouseup", up)
    // needSave && this.$store.commit("recordSnapshot")
  }

  document.addEventListener("mousemove", move)
  document.addEventListener("mouseup", up)
}
const isNeedLockProportion = () => {
  if (props.element.component != "Group") return false
  const ratates = [0, 90, 180, 360]
  for (const component of props.element.propValue) {
    if (!ratates.includes(mod360(parseInt(component.style.rotate)))) {
      return true
    }
  }

  return false
}
</script>

<style lang="scss" scoped>
.shape {
  position: absolute;
  &:hover {
    cursor: move;
  }
}

.active {
  outline: 1px solid #70c0ff;
  user-select: none;
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
  cursor: e-resize;
}
.t,
.b {
  cursor: n-resize;
}
.lt,
.rb {
  cursor: nw-resize;
}
.rt,
.lb {
  cursor: ne-resize;
}

.icon-xiangyouxuanzhuan {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  cursor: grab;
  color: #59c7f9;
  font-size: 20px;
  font-weight: 600;

  &:active {
    cursor: grabbing;
  }
}

.icon-suo {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
