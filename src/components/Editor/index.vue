<template>
    <div class="editor" id="editor" :class="{ edit: isEdit }" :style="{
      ...getCanvasStyle(canvasStyleData),
    }" @mousedown="handleMouseDown" @contextmenu="handleContextMenu">
        <Grid :is-dark-mode="isDarkMode" />
        <Shape v-for="(item, index) in componentData" :key="item.id" :default-style="item.style" :element="item"
            :index="index" :class="{ lock: item.isLock }" :style="getShapeStyle(item.style)"
            :active="item.id === (curComponent || {}).id">
            <component :is="getComponent(item.component)" v-if="item.component.startsWith('SVG')"
                :id="'component' + item.id" :style="getSVGStyle(item.style)" class="component"
                :prop-value="item.propValue" :element="item" :request="item.request" />

            <component :is="getComponent(item.component)" v-else-if="item.component != 'VText'"
                :id="'component' + item.id" class="component" :style="getComponentStyle(item.style)"
                :prop-value="item.propValue" :element="item" :request="item.request" />

            <component :is="getComponent(item.component)" v-else :id="'component' + item.id" class="component"
                :style="getComponentStyle(item.style)" :prop-value="item.propValue" :element="item"
                :request="item.request" @input="handleInput" />
        </Shape>
        <!-- 右键菜单 -->
        <ContextMenu :rightMenu="rightMenu" :menuShow='menuShow'></ContextMenu>
        <!-- 斑马线 -->
        <MarkLine />
    </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, onMounted, ref } from "vue"
import { storeToRefs } from "pinia"
import Grid from "./Grid.vue"
import Shape from "./Shape.vue"
import { getStyle, getComponentRotatedStyle, getShapeStyle, getSVGStyle, getCanvasStyle } from "../../utils/style"
import componentList from "../../custom-component/index.ts"
import { changeStyleWithScale } from "../../utils/translate"
import { useAppStore } from "../../store/index"
import MarkLine from "@/components/Editor/MarkLine.vue"
import ContextMenu from "@/components/Editor/ContextMenu.vue"
const appStore = useAppStore()
const { componentData, isDarkMode, canvasStyleData, curComponent, editor } = storeToRefs(appStore)
const { setAreaData, getEditor } = appStore
const rightMenu = ref({
    menuTop: 0,
    menuLeft: 0
})
const menuShow = ref(false)
defineProps({
  isEdit: {
    type: Boolean,
    default: true,
  },
})
const editorX = ref(0)
const editorY = ref(0)
const start = ref({
  // 选中区域的起点
  x: 0,
  y: 0,
})
const width = ref(0)
const height = ref(0)
const isShowArea = ref(false)
const svgFilterAttrs = ["width", "height", "top", "left", "rotate"]
const getComponentStyle = (style: any) => {
  return getStyle(style, svgFilterAttrs)
}
const getComponent = (component: string) => {
  return componentList.find((item) => item.key === component).component
}
const handleInput = () => {
  console.log(111)
}
// 点击组件后
const handleMouseDown = (e: any) => {
    window.console.log(111111);
    menuShow.value = false
  if (!curComponent.value) e.preventDefault()
  hideArea()
  const rectInfo = editor.value!.getBoundingClientRect()
  editorX.value = rectInfo.x
  editorY.value = rectInfo.y
  const startX = e.clientX
  const startY = e.clientY
  start.value = {
    x: startX - editorX.value,
    y: startY - editorY.value,
  }
  isShowArea.value = true
  const move = (moveEvent: any) => {
    width.value = Math.abs(moveEvent.clientX - startX)
    height.value = Math.abs(moveEvent.clientY - startY)
    if (moveEvent.clientX < startX) {
      start.value.x = moveEvent.clientX - editorX.value
    }

    if (moveEvent.clientY < startY) {
      start.value.y = moveEvent.clientY - editorY.value
    }
  }

  const up = (e: any) => {
    document.removeEventListener("mousemove", move)
    document.removeEventListener("mouseup", up)
    document.removeEventListener("mouseleave", up)
    if (e.clientX == startX && e.clientY == startY) {
      hideArea()
      return
    }
  }
  document.addEventListener("mousemove", move)
  document.addEventListener("mouseup", up)
  document.addEventListener("mouseleave", up)
}
const handleContextMenu  =(e: any)=>{
    e.stopPropagation()
    e.preventDefault()
    // 计算菜单相对于编辑器的位移
    let target = e.target
    let top = e.offsetY
    let left = e.offsetX
    while (typeof target.className === 'string' && !target.className.includes('editor')) {
        menuShow.value = true
        rightMenu.value.menuLeft = left + target.offsetLeft
        rightMenu.value.menuTop= top + target.offsetTop
        target = target.parentNode
    }
}
const hideArea = () => {
  isShowArea.value = false
  width.value = 0
  height.value = 0
  setAreaData({
    style: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    },
    components: [],
  })
}
onMounted(() => {
  getEditor()
})
</script>

<style lang="scss" scoped>
.editor {
  position: relative;
  background: #fff;
  margin: auto;
  height: 100%;
  width: 100%;
  overflow: hidden;
  .lock {
    opacity: 0.5;

    &:hover {
      cursor: not-allowed;
    }
  }
}

.edit {
  .component {
    outline: none;
    width: 100%;
    height: 100%;
  }
}
</style>
