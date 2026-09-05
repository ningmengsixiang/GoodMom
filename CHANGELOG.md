## [V2.4] · A–H 审查整改（八维审计 Round 1–8）
- 可访问性：GmRiskPicker 键盘/读屏可达（radiogroup + 方向键 + focus-visible）；gmIcon title 语义化；07.9 ARIA/读屏通则；scripts/a11y.py 静态走查并入 CI
- 治理与工具：audit.py 增 color-banned 旧色回归与 bp 断点收敛检查；scripts/coverage.py 覆盖度量（规范 94 / 代码 12 / 图标 77）入库并接 CI；spec 刷新管线落库（gen-spec + refresh-spec 保阅读器）
- 语义与品牌：六语义色以 alias 深色为唯一源（14.4.5 / 02.1.5 / theme --lg-sem-*）；对比度 WCAG 真口径 + 高对比主行动 --mmh-grad-action-hc / .gm-btn-hc；Logo v2 定案；禁 emoji 示例修正；触控基线统一
- 组件：GmEmpty / GmSpin / GmSkeleton 新增；RiskPicker 五色主题变量化；按钮玻璃态四态；圆角对齐 02.4
- 页面与文档：断点收敛 767/1024/1366 体系；10.2 平板档；计数 56→77；README 封装子集口径；决策记录 docs/审查决策记录.md

## [V2.3] · 网站整合与收尾
- 主站 site 整合：用户旅程 / 网站目录 / 统一多列页脚；导航 GitHub 开源入口
- 示例中心扩至 7 套页面（+PC 妇幼工作站 +孕妇档案详情页）
- Logo（logo.png / brand SVGs）全局接入；主站图标点缀与空间感优化
- 文档与统计全仓同步（README/16/站点/手册）；清理 .DS_Store 与历史空格问题

# Changelog · 妈咪好 GoodMom 设计系统

## [V2.2] · 包装与文档交付
- 首页专业版：分组菜单（概览/样式/组件/状态/可视化图标）、交付总览速览条、三步使用指南
- 新增打印版《设计系统总览手册》（preview/manual.html，浏览器另存 PDF）
- README：交付统计、体系架构、角色→文档矩阵、工程目录
- 仓库化：.gitignore / LICENSE(MIT) / CHANGELOG 初始化

## [V2.1] · 全系统优化
- 名称/版本/域示例清扫（04/05/08/09/10）
- 示例中心 5 页（列表/详情/表单向导/移动/iPad）＋首页入口卡
- 状态样式库 v2（模块页签/语义筛选/复制）、孕产妇五色分级
- 图标 77/10 类（成长阶段 L、儿童健康 H 五健+口腔+医护镜）
- 前端封装骨架 frontend-app/packages/gm-arco-ui

## [V2.0] · 品牌化
- 命名「妈咪好 GoodMom」；蜜桃粉主色 + 淡紫柔光
- 品牌 Token（02.9/12）、妇幼领域组件（13）、母婴图标（09 B）
- 双端预览换肤；iPad 中端分层（10.1.1）

## [V1.0] · 首版（液态玻璃引擎）
- DNA/Token/组件/数据可视化/Prompt 库/流程验收/预览页
