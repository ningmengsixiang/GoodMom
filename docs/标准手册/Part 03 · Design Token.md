# Part 03 · Design Token（标准正文）

> 状态：✅ 现行 · 版本：V1.0 · 维护指针：`docs/审查决策记录.md`（决策依据）
> 适用范围：全部视觉实现（md 规范、theme.css、tokens/*.ts、页面 CSS、Figma 变量）。
> 规范性用词：应＝must；宜＝should；可＝may。条目标号 `03-xx`。

## 1 目的与适用范围
## 1 目的
以「primitive→alias→component」三层模型提供唯一数值源，消灭魔法值与跨文件色漂移。

## 2 规范性条款
- TK-03-01 应：所有颜色/字号/间距/圆角/阴影/动效时长/断点取值出自 token；组件与页面禁止裸魔法值（audit color-css 严格层 FAIL 拦截）。
- TK-03-02 应：色值六进制只允许出现在 token 层文件（`goodmom-ui/src/tokens/*.ts`、theme.css 与受控生成物）。
- TK-03-03 应：三层引用方向 primitive→alias→component，禁止反向引用或跨层裸值。
- TK-03-04 应：状态文字/色点使用语义 alias 深色（`--lg-sem-*`，值见 Part 04 与 14.4.5）；白字实底使用 `--mmh-solid-*`（D5）。
- TK-03-05 应：命名 `--lg-*`（引擎）／`--mmh-*`（品牌）＋`{scope}-{语义kebab}`；组件类名 `gm-*`。
- TK-03-06 应：业务语义映射集中 `tokens/business.ts`（semanticOf 40+ 词条）；新业务词先入 15 章再落映射。
- TK-03-07 应：页面新色落在 ALLOWED∪PAGE_ALIAS（audit D4）；旧色回归（如 #3F9C88）由 color-banned 拦截。
- TK-03-08 宜：暗色与「冷静模式」以 `data-theme` / Token 开关实现（12.3.2 与 theme.css 最小段），不改结构。
- TK-03-09 应：Token 变更后执行 `refresh-spec.py` ＋ `npm run typecheck`（CI open-pkg-typecheck 复核）。

## 3 参考数值（只列已收敛核心，全表以 02 章为准）
- 文本：primary `#343A46`／secondary `#4F5B6E`（D7）／tertiary `#9AA2B0`（仅大字号）。
- 六语义 alias：positive #2f8f76 / info #4a76d0 / attention #b9771c / risk #d35466 / neutral #757e8e / special #7a5ce0。
- 白字 solid：positive #1e6b52 / attention #9a5a0e / danger #b04052 / info #385cb3 / special #6242b8。
- 圆角（02.4）：容器 40／卡 lg28·卡 22／控件 20／按钮 26·22·18（底 ≥16）/chip 999。
- 动效/断点/间距：见 Part 07/10/06（各自条款引用 02.2/2.3/2.4、07.2、10.2）。

## 4 验收
- [ ] 组件内 0 魔法色；[ ] 新 token 已登记且无同名；[ ] audit color-css/color-banned OK；[ ] spec 已 refresh；[ ] Figma 变量同名单（Part 25）。
