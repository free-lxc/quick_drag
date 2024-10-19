import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"
import AutoImport from 'unplugin-auto-import/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"]
    }),
  ],
  resolve: {
    // 设置文件./src路径为 @
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
