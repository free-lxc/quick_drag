// 第一种是创建一个工具js，不如说mitt.js，哪个组件要用到就引入该文件就好了。
import mitt from "mitt"
const emitter = mitt()
export default emitter
