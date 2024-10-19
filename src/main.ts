import { createApp } from 'vue'
// import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import ElementPlus from 'element-plus'
import { createPinia } from "pinia"

import 'element-plus/dist/index.css'
import "@/assets/iconfont/iconfont.css"
import "@/styles/animate.scss"
import "@/styles/reset.css"
import "@/styles/global.scss"
import "@/styles/dark.scss"

const pinia = createPinia()
const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount("#app")
