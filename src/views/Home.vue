<template>
  <div :class="!isDarkMode ? 'home' : 'home dark'">
    <!-- 顶部 -->
    <Toolbar />
    <!-- 中心内容 -->
    <main>
      <section :class="leftList ? 'left active' : 'left inactive'">
        <ComponentList />
        <!-- <RealTimeComponentList /> -->
      </section>
      <!-- 中间画布 -->
      <section class="center">
        <div class="content" @drop="handleDrop" @dragover="handleDragOver" @mousedown="handleMouseDown" @mouseup="deselectCurComponent">
          <Editor />
        </div>
      </section>
      <!-- 右侧属性列表 -->
      <section :class="rightList ? 'right active' : 'right inactive'"></section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import { storeToRefs } from "pinia"
import Toolbar from "@/components/Toolbar.vue"
import ComponentList from "@/components/ComponentList.vue"
import Editor from "@/components/Editor/index.vue"
import { deepCopy } from "@/utils/utils.ts"
import { useAppStore } from "@/store/index.ts"
import componentList from "@/custom-component/component-list.ts"
import generateID from "@/utils/generateID.ts"

const appStore = useAppStore()
const { isDarkMode, rightList, editor, isClickComponent } = storeToRefs(appStore)
const { addComponent, setClickComponentStatus, setInEditorStatus, setCurComponent } = appStore
const leftList = ref(true)
const handleDrop = (e: any) => {
  e.preventDefault()
  e.stopPropagation()
  const index = e.dataTransfer.getData("index")
  const rectInfo = editor.value!.getBoundingClientRect()
  if (index !== "undefined" && index) {
    const component = deepCopy(componentList[index])
    component.style.top = e.clientY - rectInfo.y
    component.style.left = e.clientX - rectInfo.x
    component.id = generateID()

    // 根据画面比例修改组件样式比例
    // changeComponentSizeWithScale(component)

    addComponent({ component, index: undefined })
    // this.$store.commit('recordSnapshot')
  } else {
    return
  }
}
const handleDragOver = (e: any) => {
  e.preventDefault()
}
const handleMouseDown = (e: any) => {
  e.stopPropagation()
  setClickComponentStatus(false)
  setInEditorStatus(true)
}
const deselectCurComponent = () => {
  if (!isClickComponent.value) {
    setCurComponent({ component: null, index: null })
    setClickComponentStatus(true)
  }
}
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  background: var(--main-bg-color);

  main {
    height: calc(100% - 64px);
    position: relative;
    background: var(--secondary-bg-color);

    .show-list {
      position: absolute;
      z-index: 9;
      top: 40%;
      transition: all 0.3s;
    }

    .left-btn,
    .right-btn {
      background: var(--main-bg-color);
      color: var(--button-text-color);
      border: 1px;
    }

    .left-btn {
      margin-left: 200px;
      border-radius: 0 50% 50% 0;
      padding: 9px 4px 9px 2px;
    }

    .right-btn {
      right: 0;
      margin-right: 288px;
      border-radius: 50% 0 0 50%;
      padding: 9px 2px 9px 4px;
    }

    .left,
    .right {
      position: absolute;
      height: 100%;
      top: 0;
      transition: all 0.3s;
      background: var(--main-bg-color);
      color: var(--text-color);
    }

    .left {
      width: 200px;
      left: 0;

      .real-time-component-list .list:hover {
        color: var(--text-color);
      }

      .real-time-component-list .actived.list {
        color: var(--actived-text-color);
        background-color: var(--actived-bg-color);
      }

      .real-time-component-list .list {
        color: var(--text-color);
      }

      & > div {
        overflow: auto;

        &:first-child {
          border-bottom: 1px solid var(--border-color);
        }
      }
    }

    .center {
      margin: 0 288px 0 200px;
      background: var(--secondary-bg-color);
      height: 100%;
      overflow: auto;
      padding: 20px;
      transition: all 0.3s;
      overflow: hidden;
    }

    .placeholder {
      text-align: center;
      color: var(--placeholder-text-color);
    }

    .left.inactive {
      width: 10px;
      overflow: hidden;

      div {
        opacity: 0;
      }
    }

    .left.inactive ~ .center,
    .left.inactive ~ .btn.left-btn {
      margin-left: 10px;
    }

    .right {
      position: absolute;
      height: 100%;
      width: 288px;
      right: 0;
      top: 0;
      transition: all 0.3s;
      background-color: var(--main-bg-color);

      .el-select {
        width: 100%;
      }

      .el-form-item__label {
        color: var(--text-color);
      }

      .el-tabs__item.is-top {
        color: var(--text-color);

        &.is-active {
          color: var(--actived-text-color);
        }
      }

      .el-input__inner {
        background-color: var(--placeholder-bg-color);
        color: var(--text-color);
        border-color: var(--border-color);
      }

      textarea.el-textarea__inner {
        background-color: var(--placeholder-bg-color);
        color: var(--text-color);
      }

      .el-select-dropdown__item {
        color: var(--text-color);
      }

      .linkage-container .linkage-component {
        border-color: var(--border-color);

        .div-guanbi {
          color: var(--border-color);
          border-color: var(--border-color);
        }
      }
    }

    .right.inactive {
      width: 10px;
      overflow: hidden;

      div {
        opacity: 0;
      }
    }

    .right.inactive ~ .btn.right-btn {
      margin-right: 10px;
    }

    .center {
      margin-left: 200px;
      margin-right: 288px;
      background: var(--secondary-bg-color);
      height: 100%;
      overflow: auto;
      padding: 20px;
      transition: all 0.3s;

      .content {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
    }
  }

  .placeholder {
    text-align: center;
    color: var(--placeholder-text-color);
  }

  .global-attr {
    padding: 10px;
  }

  .el-collapse {
    border-color: var(--border-color);
  }

  .el-collapse-item__header,
  .el-collapse-item__wrap {
    border-color: var(--border-color);
    background-color: var(--main-bg-color);
    color: var(--text-color);
  }

  .el-collapse-item__header.is-active {
    border-bottom-color: transparent !important;
  }

  .el-tabs__item {
    color: var(--text-color);
  }

  .animation-list {
    .el-tabs.el-tabs--top {
      background-color: var(--main-bg-color);
    }

    .el-scrollbar__view {
      margin-top: 30px;
    }
  }

  .ace {
    background: var(--ace-bg-color);
    border-color: var(--main-bg-color);

    .ace_editor,
    .ace_gutter {
      background-color: var(--main-bg-color);
      color: var(--text-color);
    }
  }
}
</style>
