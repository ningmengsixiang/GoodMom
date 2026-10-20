# AGENTS.md

本仓库的代理协作约定。规范正文见 `README.md` 与各章 `[0-9][0-9]-*.md`；这里只放"跨会话必须知道"的工程约定。

## 推送：两个远端必须同时提交

| 远端 | 位置 | 可见性 |
| --- | --- | --- |
| `origin` | GitHub `ningmengsixiang/GoodMom` | 公开 |
| `codeup` | 公司内部 Codeup 仓库 | 私有 |

- `origin` 已配置**两个 pushurl**（GitHub + 内部仓库），因此 `git push`、`git push origin main`
  都会**同时**推两个仓库 —— 日常就用这一条，不要只 `git push codeup`（那只会推内部仓库）。
- 两个仓库的 `main` 必须保持一致。若某一边失败（网络 / 鉴权），修好后重跑 `git push` 即可：
  已成功的那个是幂等空操作。
- 检查配置：`git remote -v` 应看到 `origin` 有**两条** `(push)` 行。
  不要用 `git remote set-url` 覆盖成单条，会悄悄退化成单仓推送。

## 提交署名

- 沿用仓库本地配置 `ningmengsixiang <…@users.noreply.github.com>`，**不要**改成公司邮箱：
  GitHub 是公开仓库，公司域名不应出现在公开提交历史里。
- 需要临时换署名时用 `git -c user.name=… -c user.email=…`，不要改仓库配置。
