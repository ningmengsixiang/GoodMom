# site/ —— 站点唯一入口

**本站只有一个入口页：`index.html`。** V2.7 把原先 9 个 HTML 入口页合并为这一个文件 +
顶部一套主导航，切换 8 个模块：

| 模块 | 内容 | 片段来源 |
| --- | --- | --- |
| 首页与总览 | 品牌 · 能力 · 开源治理 · 站点地图 | `fragments/site-index.html` |
| 视觉规范 | 设计 DNA · 色彩 · 字体 · 玻璃 · 间距 · 阴影 | `fragments/preview-index.html` |
| 组件与状态 | 组件全量 · 状态谱 · 健康度 · 图表 | `fragments/preview-examples.html` |
| 移动端 | 移动端组件与交互形态 | `fragments/preview-mobile.html` |
| 交互范式 | 链接 · 级联 · 响应式容器 · 虚拟列表 · 暗色 | `fragments/preview-patterns.html` |
| 规范全文 | 19 份规范正文在线阅读（含阅读模式） | `fragments/site-spec.html` |
| 标准手册 | 38 部分标准手册 | `fragments/site-manual.html` |
| 文档索引 | 按角色与任务的文档导航 | `fragments/site-docs.html` |

## ⚠️ index.html 是产物，不要直接编辑

直接改 `index.html` 会在下次构建时被覆盖。改内容请改**片段**，再重新构建：

```bash
python3 scripts/build-site.py           # 生成 site/index.html
python3 scripts/build-site.py --check    # 校验产物与构建结果一致（CI 用）
python3 scripts/redirect-legacy.py        # 重建旧入口重定向页
python3 scripts/redirect-legacy.py --check
```

## 片段格式

```
<!--@css-->        ← 可选：模块样式（会被自动作用域隔离到 .gm-mod--<模块>）
   …CSS…
<!--@body-->       ← 模块主体 HTML
   …HTML…
<!--@js-->         ← 可选：模块脚本（会被自动限定模块作用域）
   …JS…
```

另有 `<!--@passthrough-->` 形态：内容**已完成作用域改写**，构建时原样内联不再变换。
用于「从既有产物回填片段」的场景。

## 构建期自动完成的事（不要手工重复）

合并 6 套独立样式与 10 段脚本时，`scripts/build-site.py` 会自动处理三类冲突——
细节与踩坑记录见该脚本头部注释：

1. **CSS 作用域**：类名与自定义属性（`--t`/`--rose`… 同名不同值）全部隔离到
   `.gm-mod--<模块>`；`:root`/`html`/`body`/`*` 规则改写到模块根。
2. **JS 作用域**：`getElementById` / `querySelector` 限定到模块根；
   `document.body` 挂载点与页面级 `data-theme` 改挂模块根。
3. **链接改写**：指向旧页面的 `href` 改为 `#gm-mod-<模块>` 模块切换（不再绕一次重定向）。

## 验收

```bash
python3 -m http.server 5288 --bind 127.0.0.1 &   # 仓库根起静态服务
node scripts/site-smoke.mjs      # 48 项：模块切换 / 样式隔离 / 交互 / 键盘 / 零错误
node scripts/site-parity.mjs     # 15 项：各模块 vs 原页面（类名、id、主题变量）
node scripts/page-qa.mjs --ci    # 逐页规范质检（P0–P2 必须为 0）
```

### 逐页规范质检（`page-qa.mjs`）

渲染级逐页质检：每页在 桌面 1440 / 移动 375 / 暗色 三档各测一遍，17 类规则逐条给出
**规范锚点 + 选择器 + 实测值**，报告落在 `docs/page-qa-report.md`。

| 维度 | 覆盖 |
| --- | --- |
| 结构语义 | 重复 id · 标题跳级 · 图片 alt · 可交互元素可访问名 · 表单标签 |
| 对比度 | WCAG 2.2 AA（保留 alpha 做 source-over 合成；渐变承载面取色标上界以**确证**失败） |
| 焦点 | 逐元素 `focus({focusVisible:true})`，比对 outline/box-shadow/border/background 是否变化 |
| 触控 | ≤767px 热区 ≥44×44（识别 `::after` 扩热区的合规实现） |
| 布局 | 桌面与移动横向溢出 |
| Token 档位 | 圆角（02 · 2.4）· 边框（2.7.1）· 阴影（2.6 禁纯黑）· 模糊（2.7.2）· 字号（2.2.2）· 字重（2.2.4） |
| 内容 | 界面 emoji（09 / IC-08-05）· 同页版本号（16.2）· 图标网格（09.2） |

**与既有守门的分工**：`audit.py` 扫源码、`a11y.py` 是静态断言、`a11y-dom.py` 只测对比度 ——
只有本工具是"渲染后按规范档位逐页量"。它自己也要站得住，故内置三条口径：
禁用态按 WCAG 1.4.3 豁免、规范正文（`.md`/`.chap`）算文档内容而非界面、
【02 · 2.4】只管短边 ≥32px 的组件与容器（行内 `code` 芯片不在管辖内）。

> ⚠️ `site/fragments/site-spec.html` 与 `site-manual.html` 是**生成产物**：
> 分别由 `scripts/gen-spec.py` / `scripts/gen-manual.py` 产出，直接改片段会被下次生成覆盖。
> 要改这两块的内容或样式，请改生成器（或它们读的 Markdown 源）。

`site-parity.mjs` 是合并类改动最重要的守门测试：它逐模块与原页面比对
**全部元素类名与 id 的差集**（只登记"有意移除"项——各页自建顶栏与旧页面返回链接），
任何因作用域改写失误导致的元素丢失都会立刻暴露。

## 旧入口

`docs.html` `manual.html` `spec.html`（本目录）与 `../preview/{index,examples,mobile,patterns}.html`
均已改写为**重定向页**：保留旧链接可达、锚点透传（如 `spec.html#ch-02` →
`index.html#site-spec--ch-02`）、带 `noindex`。

`../preview/manual.html`（打印版手册）按用途**保留为独立页**，不在合并范围内。
