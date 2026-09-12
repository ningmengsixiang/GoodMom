# 规范审计报告（自动）

- 命令：`python3 scripts/audit.py`
- 时间：2026-09-12 12:36
- 结论：✅ 通过

- **OK** `md-links`：全部内链有效
- **OK** `chapters`：00–18 编号连续（19 份）
- **OK** `icons`：77 图标唯一且命名合法，与 registry 同步
- **OK** `html-md`：HTML 页面无 .md 链接（含片段与根目录）
- **OK** `stale`：无旧称/旧定位残留
- **WARN** `color-html`：site/index.html 非白名单色 8 个（低风险别名）
- **OK** `color-css`：代码/Tokem 层无硬编码色（严格层）
- **OK** `color-banned`：无历史近似色回归
- **OK** `bp`：断点收敛于 767/1024/1366 体系
- **OK** `spec`：合并产物 site-spec 模块 章节=59 阅读器在；旧入口为重定向
- **OK** `hex-case`：hex 色值全仓统一大写（14.1.1）
- **OK** `mirror`：应用侧 gm-arco-ui 与设计系统源逐字节一致（含 theme.css ↔ gm.css），且无缺失选择器
- **OK** `dark`：暗色段完整；10 项文字/语义色在最坏合成面 #36353C 上全部 ≥4.5:1
- **OK** `exports`：全部组件已在两包 index.ts 导出
- **OK** `logo-ref`：logo 引用 28 处全部指向正式 logo 的派生档（brand/logo-512.png / brand/logo-192.png），零断链、无退役 SVG
- **OK** `logo-guard`：正式 logo 真源 2032×2032（未压缩）+ 派生档 512 / 192；渲染圆角 10 处与白名单一致
