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
node scripts/site-smoke.mjs      # 41 项：模块切换 / 样式隔离 / 交互 / 键盘 / 零错误
node scripts/site-parity.mjs     # 15 项：各模块 vs 原页面（类名、id、主题变量）
```

`site-parity.mjs` 是合并类改动最重要的守门测试：它逐模块与原页面比对
**全部元素类名与 id 的差集**（只登记"有意移除"项——各页自建顶栏与旧页面返回链接），
任何因作用域改写失误导致的元素丢失都会立刻暴露。

## 旧入口

`docs.html` `manual.html` `spec.html`（本目录）与 `../preview/{index,examples,mobile,patterns}.html`
均已改写为**重定向页**：保留旧链接可达、锚点透传（如 `spec.html#ch-02` →
`index.html#site-spec--ch-02`）、带 `noindex`。

`../preview/manual.html`（打印版手册）按用途**保留为独立页**，不在合并范围内。
