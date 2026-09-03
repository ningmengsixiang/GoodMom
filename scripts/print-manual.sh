#!/usr/bin/env bash
# 导出《妈咪好 GoodMom 设计系统总览手册》PDF（需本机安装 Google Chrome）
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ ! -x "$CHROME" ]; then echo "未找到 Chrome，请安装后重试"; exit 1; fi
mkdir -p "$ROOT/docs"
PROFILE="$(mktemp -d)"
"$CHROME" --headless=new --disable-gpu --no-sandbox --user-data-dir="$PROFILE" \
  --print-to-pdf="$ROOT/docs/GoodMom-Design-System-V2.2-Overview.pdf" \
  "file://$ROOT/preview/manual.html" >/dev/null 2>&1 || true
rm -rf "$PROFILE"
echo "已生成 docs/GoodMom-Design-System-V2.2-Overview.pdf（如失败请手动：浏览器打开 preview/manual.html → 打印 → 另存为 PDF）"
