/**
 * React 验收台打包（不随包发布）
 *
 * 为什么是 esbuild 而不是 vite：本仓**离线优先** —— vite 的 React 插件
 * （@vitejs/plugin-react）在根 node_modules 里没有、也装不上（无外网），
 * 而 esbuild 是 vite 的传递依赖、一定存在，且 JSX 转换是它原生能力。
 * Vue 验收台用 vite 是因为 SFC 必须编译；React 只需要 JSX，用 esbuild 更少依赖。
 *
 * 用法：
 *   node playground/build.mjs           # 产出 dist/bundle.js + dist/bundle.css
 *   node playground/smoke.mjs           # 起静态服务 → 跑断言（会先构建）
 */
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));   // 含中文路径，必须用 fileURLToPath
const outdir = path.join(here, "dist");
fs.mkdirSync(outdir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(here, "main.tsx")],
  bundle: true,
  outfile: path.join(outdir, "bundle.js"),
  format: "iife",
  target: ["chrome100"],
  jsx: "automatic",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  define: { "process.env.NODE_ENV": '"development"' },
  logLevel: "warning",
});

/* 样式：组件库皮肤（theme.css ⇄ 应用侧镜像 gm.css）+ 验收台自身的最小壳 */
fs.copyFileSync(path.join(here, "..", "src", "theme.css"), path.join(outdir, "bundle.css"));
fs.appendFileSync(path.join(outdir, "bundle.css"), `
body{margin:0;font-family:"Inter","PingFang SC","MiSans","Noto Sans SC",sans-serif;
  color:var(--lg-text-primary,#343A46);background:var(--lg-page-bg,#F6E2DB);padding:24px}
h2{font-size:16px;margin:4px 0 10px}
section{margin-bottom:22px;padding:16px;border-radius:22px;
  background:var(--lg-glass-card,linear-gradient(160deg,rgba(255,255,255,.62),rgba(255,255,255,.3)));
  border:1px solid var(--lg-border-white-70,rgba(255,255,255,.78))}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0}
`);
console.log("playground built →", path.relative(process.cwd(), path.join(outdir, "bundle.js")));
