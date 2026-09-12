import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * 本地验收台专用配置（不参与库构建、不随包发布）
 * 启动：npx vite --config playground/vite.config.ts
 * 端口固定 5273，避免与 DSH Web GUI（3080）、Storybook（6006）冲突。
 *
 * ⚠️ 两个踩过的坑，不要"顺手优化"掉：
 *  1) root 必须用 fileURLToPath，不能用 new URL(...).pathname —— 本仓库路径含中文，
 *     pathname 会百分号编码成 %E7%8E%BB…，Vite 据此 mkdir 直接 EPERM 失败。
 *  2) 必须把 vue 指向 esm-bundler 全量构建 —— 验收台根组件用字符串 template，
 *     默认 runtime-only 构建不含模板编译器，会静默渲染出空 #app（无任何报错，极难排查）。
 *     **库本身不需要**（SFC 模板在构建期已编译），仅验收台需要。
 */
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  cacheDir: fileURLToPath(new URL("./.vite", import.meta.url)),
  plugins: [vue()],
  resolve: {
    alias: { vue: "vue/dist/vue.esm-bundler.js" },
  },
  server: { port: 5273, strictPort: true },
});
