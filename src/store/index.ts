import { defineStore } from "pinia"
import { provide } from "vue"
import animation from "./animation.ts"
// import compose from "./compose.ts"
export const useAppStore = defineStore("appStore", {
  state: () => ({
    areaData: {
      // 选中区域包含的组件以及区域位移信息
      style: {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
      components: [],
    },
    editor: null as HTMLElement | null,
    lastScale: 100, // 记录快照上次的缩放比例，用于判断是否需要更新快照
    editMode: "edit", // 编辑器模式 edit preview
    canvasStyleData: {
      // 页面全局数据
      width: 1200,
      height: 740,
      scale: 100,
      color: "#000",
      opacity: 1,
      background: "#fff",
      fontSize: 14,
    },
    isInEdiotr: false, // 是否在编辑器中，用于判断复制、粘贴组件时是否生效，如果在编辑器外，则无视这些操作
    componentData: [] as any[], // 画布组件数据
    curComponent: null,
    curComponentIndex: null,
    // 点击画布时是否点中组件，主要用于取消选中组件用。
    // 如果没点中组件，并且在画布空白处弹起鼠标，则取消当前组件的选中状态
    isClickComponent: false,
    rightList: true,
    isDarkMode: false,
  }),
  actions: {
    setAreaData(data: any) {
      this.areaData = data
    },
    getEditor() {
      this.editor = document.getElementById("editor")
    },
    aceSetCanvasData(value: any) {
      this.canvasStyleData = value
    },
    setLastScale(value: any) {
      this.lastScale = value
    },
    // 通过json设置组件
    aceSetcurComponent(value: any) {
      for (let i = 0; i < this.componentData.length; i++) {
        if (this.componentData[i].id === value.id) {
          this.componentData.splice(i, 1)
        }
      }
      this.componentData.push(value)
      this.curComponent = value
    },

    setClickComponentStatus(status: any) {
      this.isClickComponent = status
    },

    isShowRightList() {
      this.rightList = !this.rightList
    },

    toggleDarkMode(status: any) {
      this.isDarkMode = status
      this.canvasStyleData.background = status ? "#817f7f" : "#fff"
      localStorage.setItem("isDarkMode", JSON.stringify(this.isDarkMode))
    },

    setEditMode(mode: any) {
      this.editMode = mode
    },

    setInEditorStatus(status: any) {
      this.isInEdiotr = status
    },

    setCanvasStyle(style: any) {
      this.canvasStyleData = style
    },

    setCurComponent({ component, index }) {
      this.curComponent = component
      this.curComponentIndex = index
    },

    setShapeStyle({ top, left, width, height, rotate, padding }) {
      if (top !== undefined) this.curComponent!.style.top = Math.round(top)
      if (left !== undefined) this.curComponent!.style.left = Math.round(left)
      if (width) this.curComponent!.style.width = Math.round(width)
      if (padding) this.curComponent!.style.padding = Math.round(padding)
      if (height) this.curComponent!.style.height = Math.round(height)
      if (rotate) this.curComponent!.style.rotate = Math.round(rotate)
    },

    setShapeSingleStyle({ key, value }) {
      this.curComponent.style[key] = value
    },

    setComponentData(componentData = []) {
      provide("componentData", componentData)
    },

    addComponent({ component, index }) {
      if (index !== undefined) {
        this.componentData.splice(index, 0, component)
      } else {
        this.componentData.push(component)
      }
    },

    deleteComponent(index) {
      if (index === undefined) {
        index = this.curComponentIndex
      }

      if (index == this.curComponentIndex) {
        this.curComponentIndex = null
        this.curComponent = null
      }

      if (/\d/.test(index)) {
        this.componentData.splice(index, 1)
      }
    },
  },
})
