import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 开发时直接解析封装层 TS 源码（workspace 包）
      "@goodmom/gm-arco-ui": fileURLToPath(new URL("./packages/gm-arco-ui/src/index.ts", import.meta.url)),
      "@gm": fileURLToPath(new URL("./packages/gm-arco-ui/src", import.meta.url)),
      // 应用内绝对导入：跨层引用一律用 @/ 前缀，禁止 ../../../ 相对回退
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: { port: 3081 },
});
