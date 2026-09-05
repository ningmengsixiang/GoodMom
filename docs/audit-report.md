# 规范审计报告（自动）

- 命令：`python3 scripts/audit.py`
- 时间：2026-09-05 19:30
- 结论：✅ 通过

- **OK** `md-links`：全部内链有效
- **OK** `chapters`：00–18 编号连续（19 份）
- **OK** `icons`：77 图标唯一且命名合法，与 registry 同步
- **OK** `html-md`：HTML 页面无 .md 链接
- **OK** `stale`：无旧称/旧定位残留
- **WARN** `color-html`：site/index.html 非白名单色 6 个（低风险别名）
- **WARN** `color-html`：site/docs.html 非白名单色 11 个（低风险别名）
- **WARN** `color-html`：site/spec.html 非白名单色 29 个（低风险别名）
- **WARN** `color-html`：preview/index.html 非白名单色 30 个（低风险别名）
- **WARN** `color-html`：preview/mobile.html 非白名单色 11 个（低风险别名）
- **WARN** `color-html`：preview/examples.html 非白名单色 4 个（低风险别名）
- **WARN** `color-html`：preview/manual.html 非白名单色 7 个（低风险别名）
- **OK** `color-css`：代码/Tokem 层无硬编码色（严格层）
- **OK** `color-banned`：无历史近似色回归
- **OK** `bp`：断点收敛于 767/1024/1366 体系
- **OK** `spec`：spec.html 章节=20 阅读器在
