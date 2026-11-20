#!/usr/bin/env bash
# Download the study data through the site's protected export (no Cloudflare login needed).
#   EXPORT_KEY=... ./scripts/fetch.sh                  all rounds
#   EXPORT_KEY=... ./scripts/fetch.sh class-2026-11-26 one round
# Writes data/sessions.csv, data/events.csv and data/last.jsonl (git-ignored, never commit them).
set -euo pipefail
cd "$(dirname "$0")/.."
KEY=${EXPORT_KEY:-$(cat data/.export_key 2>/dev/null || true)}
[ -n "$KEY" ] || { echo "Set EXPORT_KEY (ask the maintainer)"; exit 1; }
BASE=${BASE:-https://exchange-companion.pages.dev}
R=${1:+&round=$1}
mkdir -p data
for f in sessions events jsonl; do
  out=data/$f.csv; [ $f = jsonl ] && out=data/last.jsonl
  curl -fsS -H "Authorization: Bearer $KEY" "$BASE/api/export?file=$f$R" -o "$out"
  # right after a deploy an old version may still answer with the web page: stop instead
  if head -c 200 "$out" | grep -qi '<!doctype html'; then echo "Got the web page instead of data; wait a minute and retry"; exit 1; fi
done
echo "$(($(wc -l < data/sessions.csv) - 1)) sessions, $(($(wc -l < data/events.csv) - 1)) events -> data/ (round: ${1:-all})"
