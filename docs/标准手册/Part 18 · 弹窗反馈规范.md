# Part 18 · 弹窗反馈规范（标准正文）

> 状态：✅ 现行 · 版本 V1.1 · 维护指针：`docs/审查决策记录.md`
> 适用范围：Tooltip/Popover/Modal/Drawer/Toast/Popconfirm 与反馈层时序。
> 用词：应/宜/可；编号 `18-xx`。

## 1 目的与适用范围
## 2 条款
- MD-18-01 应：时序（03.9/07.3.7）——Tooltip 180ms（Y4px）；Popover 240ms 指向触发点；Modal 遮罩 250ms＋面板 320ms(.98→1,下移12px)；Drawer 右侧 320ms；Toast 顶部滑入 320ms→驻留 2.4s→240ms 上滑。
- MD-18-02 应：Modal 宽度语义化（常规 480–720）；遮罩点击/ESC/× 关闭；打开锁定滚动、焦点进面板首元素、关闭归还触发点；层叠 ≤2。
- MD-18-03 应：确认类（提交/签发/删除/注销）——确认弹层＋busyFor(600–950ms)→Toast/行动画；危险操作重述对象名。
- MD-18-04 应：Toast 纪律——同类仅 1 条；顶部偏上（移动避 TabBar）；表单错误正文不落 Toast。
- MD-18-05 应：移动——弹层/抽屉优先底部面板（高 ≤92% 上滑）；全屏编辑可整页（10.3/3.9）。
- MD-18-06 不应：弹层套弹层无限堆叠；关闭后焦点丢失；错误只弹 Toast 不落字段；无忙碌态双击提交。

## 3 落地实现（V2.9 补齐）

本条族的组件此前**只有目录登记、没有实现**（`00-组件总目录` 记了 Toast #63 / Notification #64 /
Modal #65 / ActionSheet #66 / Popconfirm #67 / Popover·Tooltip #68 / Banner #69），于是每个页面
各自造一份 —— 合并后的首页上实测到 **5 套 Toast 实现**，位置、时长、无障碍语义**没有一套完全达标**：

| 实现 | 位置 | 滑入 | 驻留 | role/aria | 描边 |
| --- | --- | --- | --- | --- | --- |
| `preview-index` `.copied` | `bottom:34px`（MD-18-04 要求顶部偏上） | `.35s` | 1600ms | 无 | — |
| 同页 `#toast` | 顶部 | `.35s` | 2400ms ✓ | 无 | — |
| 同页 `#gtoast` | 顶部 | `.35s` | 1500ms | 无 | — |
| `preview-examples` `.fx` | `bottom:26px` | `.25s` | 1600ms | 无 | — |
| `preview-mobile` `.mtoast` | `top:96px`（合并后移动端吸顶导航实测 144px → 被整条盖住） | `.25s` | 1600ms | 无 | — |
| 演示稿 `.toast` | `top:20px` ✓ | `.25s`/`.22s` | 2300ms | 无 | `1px solid rgba(255,255,255,1)` |

**V2.9 收敛为两处实现**：

- **组件库**：`GmToast`（`goodmom-ui` React + `goodmom-vue` Vue，props / 默认值 / 契约类名逐项一致）。
  受控（`open`），**驻留计时内置**（默认 2400ms），调用方不再各写 `setTimeout`；
  `error → role="alert" + aria-live="assertive"`，其余 `role="status" + aria-live="polite"`；
  退场先播满 **240ms** 再卸载 —— 节点当场消失的话，MD-18-01 的「240ms 上滑」只是一句空话。
- **站点外壳**：`window.gmToast(msg, status)`（见 `scripts/build-site.py` 的「全局反馈层」）。
  Toast 是**跨模块浮层**，故样式与实现都放外壳、只有一份；挂载点取 `.gm-mod.is-on`，
  既拿到模块作用域，又不必每个模块复制一遍。位置由外壳变量 `--gm-toast-top` 统一给出
  （桌面 76px / 移动 160px），用于避让 60/144px 的 sticky 吸顶导航 ——
  沿用独立页的 `top:20px` 时节点存在、样式生效，但**视觉被整条盖住**，静态检查无从发现。

其余反馈组件同轮对齐（MD-18-01/02）：

- **Modal**：`role="dialog"` + `aria-modal="true"` + `aria-labelledby`；遮罩 250ms、面板 320ms
  （`scale(.98→1)`、下移 12px）；遮罩点击 / ESC / × 关闭；打开锁定 `body` 滚动、焦点进面板首元素；
  关闭**归还触发点**。触发器报 `aria-haspopup="dialog"` + `aria-expanded`。
- **Popconfirm**：气泡 `role="dialog"` + `aria-labelledby`（非模态）；进出 180ms / Y 4px；
  ESC 关闭并归还焦点。
- **Tooltip**：180ms / Y 4px（旧值 `.2s` / 5px）。

## 4 守门

- `scripts/audit.py feedback-spec`：逐项校验上述数值、位置、`role` 分流、无白描边、
  Modal 的 `role`/`aria-modal`/ESC/焦点归还，并**禁止**站点再出现私有 Toast 实现。
- `scripts/gate-negative-tests.py`：给每条门禁注入真实缺陷，断言它必须 FAIL 且报出预期原因 ——
  门禁最危险的失效方式是「永远 PASS」，本仓已实测到过一次（正则里多出一个反斜杠导致检查空转）。
