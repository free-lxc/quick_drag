/// <reference types="vite/client" />
// 解决ts 和 vue 文件的相互导入找不到模块
declare module "*.vue" {
  import { defineComponent } from "vue"
  const Component: ReturnType<typeof defineComponent>
  export default Component
}
