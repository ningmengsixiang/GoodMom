# frontend-app · 妈咪好 GoodMom 前端工程骨架（Vite + React + Arco）

Monorepo（npm workspaces）：应用在根，封装层在 `packages/gm-arco-ui`。

```text
frontend-app/
├── package.json            # workspaces:["packages/*"] · dev/build
├── vite.config.js          # dev 别名 → 封装层 src
├── src/                    # 演示应用（main.tsx 引入 arco.css + @gm/gm.css）
└── packages/gm-arco-ui/    # @goodmom/gm-arco-ui 封装层（独立子包）
```

## 运行（需可访问 npm 的网络环境）
```bash
cd frontend-app
npm install
npm run dev          # http://localhost:3081
npm run gm:typecheck # 封装层类型检查
npm run build
```

> 本机沙箱无外网（GitHub/npm 均不可达），此处只完成骨架与源码；请在可联网机器执行以上命令。
