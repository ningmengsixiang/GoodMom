import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

/**
 * @goodmom/vue 构建配置（库模式）
 * - 外部化 vue（peerDependency），不打进产物
 * - cssCodeSplit: false → 全部 SFC 样式与 tokens 合并为单一 dist/style.css，
 *   消费方只需 `import "@goodmom/vue/style.css"`（对齐 06 章交付口径：一次引入、无样式缺失）
 * - 单文件 ESM + CJS，避免消费方 tree-shaking 配置负担
 *
 * 注意：本文件内只用 Vite 自身的类型（不引 node:url 等），
 * 因为根 workspace 也存在一份 vite，混用两份 vite 类型会报 PluginOption 不兼容。
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2020",
    cssCodeSplit: false,
    sourcemap: true,
    lib: {
      entry: "src/index.ts",
      name: "GoodMomVue",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        exports: "named",
        assetFileNames: (assetInfo) =>
          assetInfo.names?.some?.((n) => n.endsWith(".css")) || assetInfo.name?.endsWith(".css")
            ? "style.css"
            : "assets/[name][extname]",
      },
    },
  },
});
