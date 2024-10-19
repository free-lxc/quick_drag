<template>
  <div class="mark-line">
    <div
      v-for="line in lines"
      v-show="lineStatus[line] || false"
      :key="line"
      :ref="(el: refItem) => setRefMap(el, line)"
      class="line"
      :class="line.includes('x') ? 'xline' : 'yline'"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, inject } from "vue"
import { useAppStore } from "@/store/index"
import { storeToRefs } from "pinia"
import { getComponentRotatedStyle } from "@/utils/style"
import type { ComponentPublicInstance } from "vue"
import emitTer from "@/utils/mitt"

const appStore = useAppStore()
const lines = ref(["xt", "xc", "xb", "yl", "yc", "yr"])
const diff = ref(3)
const lineStatus = ref({
  xt: false,
  xc: false,
  xb: false,
  yl: false,
  yc: false,
  yr: false,
})
const { curComponent, componentData } = storeToRefs(appStore)
const { setShapeSingleStyle } = appStore
// 批量获取ref
type refItem = Element | ComponentPublicInstance | null
const refMap = ref<Record<string, refItem>>({})
const setRefMap = (el, item) => {
  if (el) {
    refMap.value[item] = el
  }
}

const hideLine = () => {
  Object.keys(lineStatus.value).forEach((line) => {
    lineStatus.value[line] = false
  })
}
const showLine = (isDownward, isRightward) => {
  const curComponentStyle = getComponentRotatedStyle(curComponent.value.style)
  const curComponentHalfwidth = curComponentStyle.width / 2
  const curComponentHalfHeight = curComponentStyle.height / 2
  hideLine()
  componentData.value.forEach((component) => {
    if (component === curComponent.value) return
    const componentStyle = getComponentRotatedStyle(component.style)
    const { top, left, bottom, right } = componentStyle
    const componentHalfwidth = componentStyle.width / 2
    const componentHalfHeight = componentStyle.height / 2
    const conditions = {
      top: [
        {
          isNearly: isNearly(curComponentStyle.top, top),
          lineNode: refMap.value.xt, // xt
          line: "xt",
          dragShift: top,
          lineShift: top,
        },
        {
          isNearly: isNearly(curComponentStyle.bottom, top),
          lineNode: refMap.value.xt, // xt
          line: "xt",
          dragShift: top - curComponentStyle.height,
          lineShift: top,
        },
        {
          // 组件与拖拽节点的中间是否对齐
          isNearly: isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
          lineNode: refMap.value.xc, // xc
          line: "xc",
          dragShift: top + componentHalfHeight - curComponentHalfHeight,
          lineShift: top + componentHalfHeight,
        },
        {
          isNearly: isNearly(curComponentStyle.top, bottom),
          lineNode: refMap.value.xb, // xb
          line: "xb",
          dragShift: bottom,
          lineShift: bottom,
        },
        {
          isNearly: isNearly(curComponentStyle.bottom, bottom),
          lineNode: refMap.value.xb, // xb
          line: "xb",
          dragShift: bottom - curComponentStyle.height,
          lineShift: bottom,
        },
      ],
      left: [
        {
          isNearly: isNearly(curComponentStyle.left, left),
          lineNode: refMap.value.yl, // yl
          line: "yl",
          dragShift: left,
          lineShift: left,
        },
        {
          isNearly: isNearly(curComponentStyle.right, left),
          lineNode: refMap.value.yl, // yl
          line: "yl",
          dragShift: left - curComponentStyle.width,
          lineShift: left,
        },
        {
          // 组件与拖拽节点的中间是否对齐
          isNearly: isNearly(curComponentStyle.left + curComponentHalfwidth, left + componentHalfwidth),
          lineNode: refMap.value.yc, // yc
          line: "yc",
          dragShift: left + componentHalfwidth - curComponentHalfwidth,
          lineShift: left + componentHalfwidth,
        },
        {
          isNearly: isNearly(curComponentStyle.left, right),
          lineNode: refMap.value.yr, // yr
          line: "yr",
          dragShift: right,
          lineShift: right,
        },
        {
          isNearly: isNearly(curComponentStyle.right, right),
          lineNode: refMap.value.yr, // yr
          line: "yr",
          dragShift: right - curComponentStyle.width,
          lineShift: right,
        },
      ],
    }
    const needToShow = []
    const { rotate } = curComponent.value.style
    Object.keys(conditions).forEach((key) => {
      // 遍历符合的条件并处理
      conditions[key].forEach((condition) => {
        if (!condition.isNearly) return
        // 修改当前组件位移
        setShapeSingleStyle({ key, value: rotate != 0 ? translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift })
        condition.lineNode.style[key] = `${condition.lineShift}px`

        needToShow.push(condition.line)
      })
    })

    // 同一方向上同时显示三条线可能不太美观，因此才有了这个解决方案
    // 同一方向上的线只显示一条，例如多条横条只显示一条横线
    if (needToShow.length) {
      chooseTheTureLine(needToShow, isDownward, isRightward)
    }
  })
}
const isNearly = (dragValue, targetValue) => {
  return Math.abs(dragValue - targetValue) <= diff.value
}

//
const translatecurComponentShift = (key, condition, curComponentStyle) => {
  const { width, height } = curComponent.value.style
  if (key == "top") {
    return Math.round(condition.dragShift - (height - curComponentStyle.height) / 2)
  }

  return Math.round(condition.dragShift - (width - curComponentStyle.width) / 2)
}
// 控制显隐规则
const chooseTheTureLine = (needToShow, isDownward, isRightward) => {
  // 如果鼠标向右移动 则按从右到左的顺序显示竖线 否则按相反顺序显示
  // 如果鼠标向下移动 则按从下到上的顺序显示横线 否则按相反顺序显示
  if (isRightward) {
    if (needToShow.includes("yr")) {
      lineStatus.value.yr = true
    } else if (needToShow.includes("yc")) {
      lineStatus.value.yc = true
    } else if (needToShow.includes("yl")) {
      lineStatus.value.yl = true
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (needToShow.includes("yl")) {
      lineStatus.value.yl = true
    } else if (needToShow.includes("yc")) {
      lineStatus.value.yc = true
    } else if (needToShow.includes("yr")) {
      lineStatus.value.yr = true
    }
  }

  if (isDownward) {
    if (needToShow.includes("xb")) {
      lineStatus.value.xb = true
    } else if (needToShow.includes("xc")) {
      lineStatus.value.xc = true
    } else if (needToShow.includes("xt")) {
      lineStatus.value.xt = true
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (needToShow.includes("xt")) {
      lineStatus.value.xt = true
    } else if (needToShow.includes("xc")) {
      lineStatus.value.xc = true
    } else if (needToShow.includes("xb")) {
      lineStatus.value.xb = true
    }
  }
}
onMounted(() => {
  emitTer.on("move", ([isDownward, isRightward]) => {
    showLine(isDownward, isRightward)
  })
  emitTer.on("unMove", () => {
    hideLine()
  })
})
</script>

<style lang="scss" scoped>
.mark-line {
  height: 100%;
}

.line {
  background: #59c7f9;
  position: absolute;
  z-index: 1000;
}

.xline {
  width: 100%;
  height: 1px;
}

.yline {
  width: 1px;
  height: 100%;
}
</style>
