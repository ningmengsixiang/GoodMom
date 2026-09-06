# Part 23 · Accessibility 规范（标准正文）

> 状态：✅ 现行 · 版本 V1.0 · 维护指针：`docs/审查决策记录.md`
> 适用范围：WCAG 2.2 AA 落地细则与自动化。
> 用词：应/宜/可；编号 `23-xx`。

## 1 目的与适用范围
## 2 条款
- AC-23-01 应：对比度——正文/控件 ≥4.5:1；大字（≥24px 常规/≥18.66px 粗体）≥3:1；token 已收敛；页面实测以 a11y-dom 报告为准（渐变/长尾见 D7b）。
- AC-23-02 应：键盘——交互元素原生可聚焦或显式 tabindex；`:focus-visible` 显式环（2px）；radio/分段 ←/→/Home/End + aria-checked/selected。
- AC-23-03 应：焦点管理——Modal/Drawer 打开聚焦首元素、关闭归还触发点；非模态不劫持焦点。
- AC-23-04 应：ARIA/读屏（07.9）——装饰图标 aria-hidden；传义图标 role=img+label；radiogroup/status/dialog 语义；表格用真实语义。
- AC-23-05 应：触控 ≥44/关键 48；200% 缩放不破版；安全区 env()。
- AC-23-06 应：`prefers-reduced-motion` 降级（07.5）。
- AC-23-07 应：自动化——`a11y.py`（静态，入 CI）；`a11y-dom.py`（渲染级报告）；axe 运行时级列长期项。
- 验收：[ ] 静态+渲染报告无新增实色失败；[ ] 键盘全流程可达；[ ] reduced-motion 生效。
