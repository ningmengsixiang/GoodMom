# @goodmom/ui · 妈咪好 GoodMom 视觉设计规范开源组件库

妈咪好 GoodMom 妇幼儿童全生命周期设计系统的 **开源组件代码层**：以 [Arco Design (React)](https://github.com/arco-design/arco-design)（MIT）为工程基底，源码仅作 API 参考，运行期依赖 npm 包 `@arco-design/web-react`，按 GoodMom 设计系统（00–16 号规范文档）进行主题与语义封装。

## 特性
- **主题开箱即用**：`src/theme.css` 将 Arco 主色变量覆盖为 GoodMom 蜜桃粉（--mmh-rose-*）+ 六语义状态色（02.9/12.3）
- **语义优先**：六语义状态（14 · 4.4.5）与孕产妇五色（02.10）内置 `tokens/`
- **领域组件**：服务对象卡、五色风险选择（15.6.1 / 13）
- 与规范同步：命名 14 · 2；按钮全谱 03 · 3.2.4；状态 15.2

## 已含组件
GmButton（全谱）· GmStatusTag（六语义+五色）· GmCard · GmAvatar · GmProgress · GmRiskPicker · GmClientCard
（tokens：status / business（semanticOf 40+ 词条）/ design）

## 安装与使用（需可访问 npm）
```bash
npm i @arco-design/web-react react react-dom   # peer
npm i -D typescript @types/react @types/react-dom
npm run typecheck
npm run build
```
```tsx
import "@arco-design/web-react/dist/css/arco.css";
import "@goodmom/ui/theme.css";                 // 主题覆盖（在 arco.css 之后）
import { GmButton, GmStatusTag, GmRiskPicker } from "@goodmom/ui";

<GmButton type="primary" size="large" long>保存并提交</GmButton>
<GmStatusTag semantic="attention">待随访</GmStatusTag>
<GmRiskPicker value="m2" onChange={(v) => console.log(v)} />
```

## 与规范文档配套
| 规范 | 说明 | 本库落点 |
| --- | --- | --- |
| 00–16 号文档 | 视觉 DNA / Token / 组件 / 数据可视化 / 命名 / 词库 | 与本目录同级（README 为入口） |
| preview/ | 首页全组件演示 · 示例中心 7 页 · 移动端 | 浏览器直接打开 |
| icons/lg-icons.svg | 77 枚自绘图标 | 引入后 `npm run build` 前可直接 `<symbol>` 引用 |

## 贡献
见 CONTRIBUTING（简版：先登记规范（00/14/15）→ 图标走 09.6 → 新增封装跟随「组件 → 封装」双登记）。
