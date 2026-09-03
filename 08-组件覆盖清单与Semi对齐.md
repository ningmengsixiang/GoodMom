# 08 · 组件覆盖清单与 Semi Design 对齐

> 参考 [Semi Design 组件总览](https://semi.design/zh-CN/start/overview)（字节跳动 Semi 设计体系，React 桌面组件库，80+ 标准组件），逐项核对 LG / GoodMom 覆盖度：
> `已规范` = 本项目已有组件规范章节；`本期补齐` = 本文件给出 LG 适配要点；`暂缓/不适用` = 给出理由。
> 对齐目的：企业级 SaaS/大屏能力不缺失，同时保持 Liquid Glass 的视觉 DNA（**Semi 解决"有什么"，LG 解决"长什么样"**）。

---

## 8.1 覆盖矩阵（按 Semi 官方分组）

图例：✅ 已规范（章节号） · ➕ 本期补齐（见 8.2） · ⏸ 暂缓/不适用（见 8.3）

### 基础（Foundations）

| Semi 组件 | LG 状态 | 说明 / LG 对应 |
| --- | --- | --- |
| Design Tokens 设计变量 | ✅ [02](02-Token规范.md) | LG 用 `lg-` Token 体系，见 02.8 CSS 变量 |
| Layout 布局 | ✅ [01 · 1.4](01-设计总览与设计DNA.md) | 空间层级 L0–L4；Semi 是工程布局，LG 是视觉布局 |
| Grid 栅格 | ✅ 04.4 | 12 列 / 24px 栅栏 |
| Button 按钮 | ✅ [03 · 3.2](03-组件规范.md) | 4 变体 × 3 尺寸 × 状态 |
| FloatButton 悬浮按钮 | ➕ | 玻璃悬浮圆钮（见 8.2.1） |
| Typography 版式 | ✅ [02 · 2.2](02-Token规范.md) | 追加省略规则见 8.2.13 |
| Divider 分割线 | ➕ | 玻璃细分隔线 Token 化 |
| Icon 图标 | ✅ [09](09-图标库规范.md) | **LG 自绘图标库**（本次交付） |
| Space 间距 | ✅ [02 · 2.3](02-Token规范.md) | 4px 基准 |
| Resizable 伸缩框 | ⏸ | 大屏为固定画布交付，拖拽改尺寸属工程层 |

### 输入类（Data Entry）

| Semi 组件 | LG 状态 | 说明 / LG 对应 |
| --- | --- | --- |
| Input / TextArea | ✅ [03 · 3.5.1](03-组件规范.md) | 玻璃输入框配方；TextArea 沿用同材质 |
| InputNumber 数字输入框 | ➕ | 玻璃步进器（见 8.2.7） |
| Form 表单 | ➕ | LG 表单编排规则（见 8.2.8） |
| Checkbox | ✅ 3.5.2 | 玻璃勾选 |
| Radio | ✅ 3.5.2 | 同勾选机制 |
| Switch | ✅ 3.5.3 | 弹簧滑块 |
| Select / AutoComplete | ✅ 3.5.4 | 玻璃下拉；AutoComplete = 输入+下拉组合 |
| DatePicker / TimePicker | ➕ | 玻璃日历弹层（见 8.2.9） |
| Slider | ➕ | 玻璃滑杆（见 8.2.6） |
| Rating 评分 | ⏸ | 大屏/SaaS 低频；如需用玻璃星形徽章替代 |
| TagInput 标签输入 | ⏸ | 可用 Select multiple 玻璃 chip 替代 |
| Cascader / TreeSelect / Transfer | ⏸ | 低频复杂选择；先做 Tree 弹层版 |
| ColorPicker | ⏸ | 设计工具场景，非产品 UI |
| PinCode 验证码 | ⏸ | 登录类页面专用，暂不纳入大屏体系 |
| Upload | ➕ | 玻璃上传区（见 8.2.10） |

### 导航类（Navigation）

| Semi 组件 | LG 状态 | 说明 / LG 对应 |
| --- | --- | --- |
| Navigation 导航 | ✅ 3.4.1 | 玻璃侧栏（含收起态） |
| Breadcrumb 面包屑 | ✅ 3.4.3 | — |
| Tabs 页签 | ✅ 3.4.3 + [07 · 7.3.5](07-交互动效与微交互规范.md) | 紫渐变指示条 |
| Steps 步骤条 | ➕ | 液态步骤条（见 8.2.2） |
| Pagination 分页 | ➕ | 玻璃分页器（见 8.2.3） |
| Anchor 锚点 | ➕ | 页面右侧玻璃锚点（见 8.2.4） |
| BackTop 回到顶部 | ➕ | 悬浮玻璃圆钮（并入 8.2.1） |
| Tree 树形控件 | ⏸ | 资产/组织树低频；可用折叠列表先行 |

### 展示类（Data Display）

| Semi 组件 | LG 状态 | 说明 / LG 对应 |
| --- | --- | --- |
| Card | ✅ 3.3 | — |
| Avatar | ✅ 3.4.2 | 玻璃头像 |
| Badge / Tag | ✅ 3.6 | 徽章与标签 |
| Table | ✅ 3.7 | 玻璃表格 |
| Timeline 时间轴 | ✅ 04.3.9 | 事件流/时间线 |
| Tooltip / Popover / Dropdown | ✅ 3.9 + 3.5.4 | 玻璃浮层 |
| Modal / SideSheet | ✅ 3.9 | Modal 玻璃弹窗 / Drawer 侧滑 |
| Descriptions 描述列表 | ➕ | 玻璃描述列表（资产/合规详情，见 8.2.11） |
| Empty 空状态 | ➕ | 玻璃空状态（见 8.2.12） |
| List | ➕ | 玻璃列表（复用 3.7 表格行样式，见 8.2.14） |
| Collapse / Collapsible | ⏸ | 大屏少用；折叠用 Tabs 或 Drawer 承载 |
| Carousel 轮播 | ⏸ | 大屏非交互展示场景少用 |
| Calendar 日历 | ⏸ | 与 DatePicker 弹层共存即可 |
| Image / Cropper | ⏸ | 素材管理页低频；大屏用图卡 |
| ScrollList / OverflowList | ⏸ | 工程层能力 |
| UserGuide 用户引导 | ⏸ | 可后续做玻璃新手引导遮罩 |
| Highlight 高亮文本 | ⏸ | 工程能力 |

### 反馈类（Feedback）

| Semi 组件 | LG 状态 | 说明 / LG 对应 |
| --- | --- | --- |
| Toast / Notification | ✅ 3.9 + [07 · 7.3.7](07-交互动效与微交互规范.md) | 玻璃 Toast；Notification 右上堆叠版 |
| Progress 进度条 | ➕ | 玻璃进度（线性/环形，见 8.2.5） |
| Skeleton 骨架屏 | ➕ | 玻璃骨架（见 8.2.15） |
| Spin 加载器 | ➕ | 柔和玻璃 spinner（并入 8.2.15） |
| Banner 通知横幅 | ➕ | 玻璃横幅（见 8.2.16） |
| Popconfirm 气泡确认 | ➕ | 玻璃气泡确认（见 8.2.17） |
| Feedback 反馈 | ⏸ | 按场景用 Banner/Toast 组合 |

### 数据可视化 / AI / Plus（Semi 扩展）

| Semi 能力 | LG 状态 | 说明 |
| --- | --- | --- |
| Semi DV / VChart（ECharts 封装） | ✅ 替代方案 | LG [04](04-数据可视化规范.md) 已定义图表样式与数据色序；实现层建议 ECharts + LG theme |
| AI 组件（AIChatInput / AIChatDialogue / Sidebar） | ⏸ 观察项 | 大屏产品若含 AI 对话浮层，按 LG 玻璃浮层 + AI 星芒图标（[09](09-图标库规范.md) ai-*）实现 |
| AIIcon / AIButton（双色 AI 图标） | ➕ 参考 | LG 用紫渐变玻璃 AI 风格，见 09 · 5 |

### 工程类（其他）

`ConfigProvider / LocaleProvider / 无障碍 / 国际化 / 暗色模式 / D2C`：工程能力，与本视觉规范解耦；LG 主题接入即替换 02.8 Token 变量。暗色模式为后续版本（V1.1 规划项）。

---

## 8.2 本期补齐组件（LG 适配速查）

> 通用约束：材质取 `--lg-glass-*` 对应层级、圆角 `--lg-radius-*`、动效走 [07](07-交互动效与微交互规范.md) 配方；下述只给"LG 特有的差异化要点"，通用静态结构见 [03](03-组件规范.md)。

### 8.2.1 FloatButton / BackTop（悬浮按钮）
- 玻璃悬浮圆钮，直径 44–56，贴右缘/右下角，悬浮层级 L4。
- 主悬浮钮用紫渐变 + 白图标（`lg-icon-plus`/`lg-icon-arrow-up`）；hover 展开为次要动作组（缩放弹出 240ms）。
- 回到顶部：同款圆钮，`lg-icon-arrow-up`，滚动出现淡入 240ms。

### 8.2.2 Steps（步骤条）
- 形态：横向玻璃分段；**已完成段**内为紫渐变胶囊，**当前段**为白玻璃胶囊 + 紫描边呼吸点，未开始为透明胶囊 + 三级色。
- 节点图标：完成 `lg-icon-check`（白），当前 `lg-icon-clock`，未开始为序号（tabular-nums）。
- 连接线 1px `--lg-border-hairline`，已完成段用紫渐变虚线（`stroke-dasharray 4 4`）。
- 动效：进入下一步时当前胶囊 300ms 平移 + 完成态渐变淡入；失败态当前节点转红 + 胶囊描边红（07 反馈曲线）。

### 8.2.3 Pagination（分页）
- 玻璃 chip 组：`‹` `1 … 7 8 9 … 20` `›`；当前页紫渐变 chip 白字。
- 尺寸：chip 32×32，圆角 10（≥8px 规则内可 10）；总条数与每页条数文案 caption 三级色。
- 状态：hover 白玻璃底；禁用 opacity .4。

### 8.2.4 Anchor（锚点）
- 右侧纵向玻璃小胶囊（L4 淡版），列表项 12px 次级色；当前项 13px 紫 600 + 左侧 2px 紫渐变竖条（收缩展开 200ms）。
- 页面滚动联动自动高亮（工程层）。

### 8.2.5 Progress（进度）
- **线性**：轨道 `rgba(58,52,84,0.08)` 圆角胶囊，进度填充紫渐变，圆头端点；成功绿 / 危险红按语义。高度：默认 6，细 3，粗 10。
- **环形**：同 04.3.4 Donut 环样式（细环 10px），中心百分比 `tabular-nums`。
- 动效：填充宽度 700ms ease-out（07 M3）；达到 100% 一次白扫光提示。

### 8.2.6 Slider（滑杆）
- 轨道玻璃内阴影凹槽；滑块=白色玻璃圆（20px）+ 紫描边，hover 放大 1.05（spring 220ms），拖拽时出现紫辉光。
- 已选段紫渐变；刻度 label caption。
- 大屏调节场景（如告警阈值）建议滑块 + 右侧 InputNumber 联动。

### 8.2.7 InputNumber（数字步进器）
- 玻璃输入框（3.5.1）+ 右侧上下箭头双格按钮（`lg-icon-chevron-down`/`lg-icon-arrow-up` 变体），分隔线 hairline。
- 长按连续步进时按钮 120ms 淡按反馈；禁用 opacity .4。

### 8.2.8 Form（表单编排）
- 布局：一列为主，栅格两列仅用于宽屏；标签 13px 次级（顶部对齐为主）。
- 校验：错误信息 12px danger 色置于输入框下 8px；输入框错误态见 [07 · 7.3.6](07-交互动效与微交互规范.md)（红框 + 轻抖一次）。
- 提交：主按钮唯一（Primary），次要「取消」Ghost；提交中按钮 loading。

### 8.2.9 DatePicker / TimePicker
- 触发器=玻璃输入框 + 右侧 `lg-icon-calendar`（三级色）。
- 弹层=L4 玻璃日历：周头 caption、日期为 32×32 圆角 chip；今天=白玻璃 chip，选中=紫渐变 chip + 辉光，区间=淡紫洗色连接。
- 动效同 Popover 240ms；面板切换月/年用左右箭头 200ms 淡移。

### 8.2.10 Upload（上传）
- 拖拽区：玻璃虚线框（`1px dashed rgba(154,120,255,0.45)`）+ `lg-icon-upload` + 说明文字；拖入高亮为紫 100 洗色 + 描边实线紫。
- 文件列表=玻璃 chip 行（图标 16px + 文件名 + 进度/删除）；上传中显示细进度（8.2.5），成功绿点，失败红点可重试。

### 8.2.11 Descriptions（描述列表）
- 玻璃卡内键值网格：key caption 三级色、value body-sm；奇数行淡白玻璃底（可选）。
- 分栏 2–4 列自适应；长文本省略 + Tooltip（ellipsis 规则 8.2.13）。
- 适用：资产详情、合规策略、实例配置等"只读信息"。

### 8.2.12 Empty（空状态）
- 玻璃圆角占位卡：淡紫洗色圆底 + `lg-icon-search`/`lg-icon-cloud` 等 40px 图标 + 标题 body + 说明 caption；可带一个次按钮。
- 大屏图表空态用 3 点呼吸灰点占位（04.2），与页面空状态区分。

### 8.2.13 Typography 补充（省略/多行）
- 单行省略：`text-overflow: ellipsis` 固定 1 行。
- 多行省略：`-webkit-line-clamp: 2`（卡片内 ≤2，描述列表 ≤1）。
- 长文本详情一律「省略 + Tooltip 全文」，禁止卡片内无限展开。

### 8.2.14 List（列表）
- 玻璃卡 + 行（高 52–64）：行首可选玻璃头像/图标、中部主副文本（body / caption）、行尾操作（Ghost 图标钮）。
- hover 淡白玻璃底；行间 hairline 分隔。选代 3.7 表格同款行组件即可（规格同源）。

### 8.2.15 Skeleton / Spin（加载）
- Skeleton：玻璃条 `rgba(255,255,255,0.55)` 圆角胶囊骨架 + 1.6s 上下微透明呼吸（α .5↔.85，ease-in-out）——**禁止左右扫光马赛克**。
- Spin：18–40px 细环（2px），紫渐变 0.9s/圈旋转；深底/按钮内为白/浅色。仅允许这一个旋转元素。
- 首次进入用 Skeleton，刷新用局部 Spin，二者不叠加。

### 8.2.16 Banner（通知横幅）
- 玻璃横幅条（圆角 20，L3）：左侧语义图标（success/warning/error/info，见 09 图标库 s-*），正文 14px，右侧关闭（Ghost 图标钮）；可折叠。
- 大屏化：做成窄横幅贴顶部玻璃栏下方，重要告警才出现；出现 400ms 上滑淡入。

### 8.2.17 Popconfirm（气泡确认）
- 玻璃气泡（同 3.9 Popover）+ 文案 13px + 按钮组「取消(ghost) / 确认(primary 或 danger 主色)」。
- 危险操作确认按钮用 danger 色玻璃渐变；动效 240ms，可含 1 次微回弹。

---

## 8.3 暂缓/不适用说明

| 组件 | 理由 | 何时重新评估 |
| --- | --- | --- |
| Rating / PinCode / ColorPicker | 与目标产品（安全/云/软件工厂大屏）匹配度低 | 出现 C 端或通用 SaaS 页面需求时 |
| Cascader / Transfer / TreeSelect | 低频复杂选择，实现成本高 | 出现多级组织/权限选择页 |
| Resizable / ScrollList / OverflowList | 工程层能力而非视觉组件 | 进入复杂编辑器产品 |
| Carousel / Calendar | 大屏非交互展示不需要 | 出现运营大屏需求 |
| Image / Cropper / UserGuide | 低频 | 出现素材/引导场景 |
| AI 组件全套 | 属独立 AI 产品线 | 产品含 AI 对话浮层时按 3.9+09 定制 |

---

## 8.4 对齐后的组件地图（LG 规范 → Semi 名）

```text
LG 已覆盖：Button Card Nav(侧栏) Tabs Breadcrumb Input Select Switch Checkbox Radio
           Badge Tag Avatar Table Timeline Tooltip Popover Dropdown Modal Drawer(≈SideSheet)
           Toast Notification Divider Layout Grid Typography Icon Space
LG 本期补齐：FloatButton/BackTop Steps Pagination Anchor Progress Slider InputNumber
           Form DatePicker Upload Descriptions Empty List Skeleton/Spin Banner Popconfirm
LG 观察项：AI 组件、暗色模式、D2C
```

> 验收：新页面绘制前，先按本表确认每个需要的组件处于 ✅ 或 ➕，并引用其规范章节；暂缓项若必须使用，须先评审是否破坏 DNA。
