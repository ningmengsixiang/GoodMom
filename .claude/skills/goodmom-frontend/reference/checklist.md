# 提交前验收清单

逐条勾选。**能机器判定的必须跑命令，不许凭记忆断言。**

## 1. 命令验收（必跑）

```bash
npm run typecheck:vue      # 类型：vue-tsc --noEmit
npm run build:vue          # 库构建：dist/index.js + index.cjs + style.css + *.d.ts
python3 scripts/check-status-map.py --ci   # 状态字典 ⇄ 15 章一致性（改名/新增文案必跑）
```

真机冒烟（37 项，覆盖下列 2.1/2.2/3.1/3.2/4/5/7.6 条）：

```bash
# 终端 A
cd goodmom-vue && npx vite --config playground/vite.config.ts
# 终端 B
node goodmom-vue/playground/smoke.mjs
```

期望末行：`37/37 通过`。**改了组件或 Token 必须重跑**，否则改动不可信。

## 2. 颜色（机器可验证）

- [ ] 2.1 主行动按钮 = `--mmh-grad-action-hc` 渐变 + 深字 `rgb(52,58,70)`；全站无「粉底白字」（R1）
- [ ] 2.2 状态标签色由 `GmStatusTag` 自动推导，抽查 3 个文案色值正确（R3）
- [ ] 2.3 页面源码 `grep -nE '#[0-9A-Fa-f]{3,6}|rgba?\('` 在 `<style>`/内联样式中**无裸色值**（R2/R11）
- [ ] 2.4 状态展示都有「色点 + 文字」两通道（R5）

## 3. 无障碍（人工 + 脚本）

- [ ] 3.1 动作是 `<button>`、导航是 `<a href>`；无 `href="#"` 假链接（R6）
- [ ] 3.2 仅图标控件都有 `aria-label`（R8）
- [ ] 3.3 Tab 键能走完整个页面，焦点环处处可见，无 `outline:none` 裸奔（R8）
- [ ] 3.4 弹层 Esc 关闭后焦点回到触发元素（R8）
- [ ] 3.5 `GmProgress` 传了 `valueText` 人话
- [ ] 3.6 组合控件是 roving tabindex（组内只有 1 个 Tab 停靠点）
- [ ] 3.7 空态/加载态有 `role="status"` 或等价语义

```bash
python3 scripts/a11y.py --ci        # 静态走查
python3 scripts/a11y-dom.py         # 无头 Chrome DOM 实测（对比度）
```

## 4. Token 与样式

- [ ] 4.1 所有颜色/圆角/时长/阴影都来自 CSS 变量（未自造数值）
- [ ] 4.2 加粗/强调用 `box-shadow`/`outline`，未改 `border-width`（R9）
- [ ] 4.3 圆角符合 02.4 档位（交互组件 ≥16）
- [ ] 4.4 切换 `data-theme="dark"` 后**无需**额外样式即正常（未写暗色分支）
- [ ] 4.5 自定义量数值与 `02-Token规范.md` 一致（不一致则改文档，别只改代码）

## 5. 响应式与移动端

- [ ] 5.1 布局切换用容器宽度（`GmResponsiveView` / 容器查询），未用视口断点硬切（R7 关联）
- [ ] 5.2 同一时刻只渲染一个形态分支
- [ ] 5.3 形态切换**不重置**排序/筛选/分页状态
- [ ] 5.4 ≤767px 可点热区 ≥44×44（R7）
- [ ] 5.5 底部固定操作条考虑 `env(safe-area-inset-bottom)`

## 6. 业务一致性

- [ ] 6.1 所有状态文案取自 15 章词库，未自造词（如「已随访」→ 应为「已完成」）
- [ ] 6.2 新状态文案已登记 `goodmom-vue/src/tokens/business.ts` **且** `goodmom-ui/src/tokens/business.ts` **且** 15 章（R4），且 `python3 scripts/check-status-map.py --ci` 通过
- [ ] 6.3 组件名用 `Gm` 前缀、CSS 类用 `gm-` 前缀、Token 用 `--lg-`/`--mmh-`（14 章）
- [ ] 6.4 五色分级（`GmRiskPicker`/`GmTag five`）与六语义**未混用**

## 7. 交互与反馈

- [ ] 7.1 ≤300ms 的请求不显示 loading
- [ ] 7.2 骨架屏与真实内容同结构同高度（无 CLS 跳动）
- [ ] 7.3 提交中按钮 `loading` 且防重复提交
- [ ] 7.4 空态给出下一步动作，不是死路
- [ ] 7.5 危险操作有二次确认
- [ ] 7.6 动效尊重 `prefers-reduced-motion`（R10）

## 8. 性能与工程

- [ ] 8.1 列表 <500 行未上虚拟滚动（过度工程）；>500 行且定高才用 `GmVirtualList`
- [ ] 8.2 按需具名导入组件（不用 `app.use` 全量注册，除非原型）
- [ ] 8.3 页面层取数，组件不做 `fetch`
- [ ] 8.4 未用 `watch` 把 props 拷贝进本地 state

## 交付记录

改动完成后在 `CHANGELOG.md` 追加一条，说明：改了什么、为什么、验证命令与结果。
若涉及 Token/组件契约变更，同步更新对应规范章节。
