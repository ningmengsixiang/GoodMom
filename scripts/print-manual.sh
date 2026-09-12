#!/usr/bin/env bash
# 导出《妈咪好 GoodMom 设计系统总览手册》PDF（需本机安装 Chrome/Chromium）
#
# 修复（P2-9 / P1-8）：
#   · 输出文件名从**版本源** `VERSION` 读取，不再硬编码（旧版永远产出 V2.2 的错名文件）；
#   · 去掉行尾的 `|| true` —— 它破坏了上一行的 `set -e`，让失败也继续往下走；
#   · 只有真的产出非空 PDF 才打印"已生成"，不再"失败也报成功"。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$ROOT/VERSION")"
OUT="$ROOT/docs/GoodMom-Design-System-V${VERSION}-Overview.pdf"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CHROME" ]; then
  # 退回 Playwright 下载的 chromium（CI 与无 Chrome 的机器上常是唯一可用者）
  for c in "$HOME"/Library/Caches/ms-playwright/*/chrome-mac/Chromium.app/Contents/MacOS/Chromium \
           "$HOME"/.cache/ms-playwright/*/chrome-linux/chrome; do
    if [ -x "$c" ]; then CHROME="$c"; break; fi
  done
fi
if [ ! -x "$CHROME" ]; then
  echo "未找到 Chrome/Chromium。请设置 CHROME 环境变量后重试。" >&2
  exit 1
fi

mkdir -p "$ROOT/docs"
PROFILE="$(mktemp -d)"
CHROME_PID=""
cleanup() {
  [ -n "$CHROME_PID" ] && kill "$CHROME_PID" 2>/dev/null || true
  rm -rf "$PROFILE" 2>/dev/null || true
}
trap cleanup EXIT

echo "版本源 VERSION = $VERSION  →  $(basename "$OUT")"
rm -f "$OUT"

# ⚠️ 无头 Chrome 打完 PDF 后**不会自行退出**（实测会一直挂住），
# 所以不能同步等待它返回：后台启动 + 轮询产物出现并稳定，然后主动收工。
"$CHROME" --headless=new --disable-gpu --no-sandbox --no-first-run \
  --user-data-dir="$PROFILE" --no-pdf-header-footer \
  --print-to-pdf="$OUT" "file://$ROOT/preview/manual.html" >/dev/null 2>&1 &
CHROME_PID=$!

LAST=0
for _ in $(seq 1 120); do
  if [ -s "$OUT" ]; then
    CUR=$(wc -c < "$OUT" | tr -d ' ')
    # 连续两次大小不变即认为写完
    if [ "$CUR" = "$LAST" ] && [ "$CUR" -gt 10000 ]; then break; fi
    LAST="$CUR"
  fi
  sleep 1
done

if [ ! -s "$OUT" ]; then
  echo "打印失败或超时（未产出非空 PDF ${OUT}）。请手动：浏览器打开 preview/manual.html → 打印 → 另存为 PDF" >&2
  exit 1
fi

echo "已生成 ${OUT}（$(wc -c < "${OUT}" | tr -d ' ') 字节）"
