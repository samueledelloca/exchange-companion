#!/usr/bin/env bash
# Download every recorded snapshot from Cloudflare D1 into data/all.jsonl
# (same format as server.py), data/last.jsonl with the last snapshot per session,
# and data/sessions.csv + data/events.csv for analysis (scripts/to_csv.py).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data
npx wrangler d1 execute exchange-companion --remote --json \
  --command "SELECT payload FROM snapshots ORDER BY id" > data/_d1.json
python3 - <<'PY'
import json
rows = json.load(open('data/_d1.json'))[0]['results']
last = {}
with open('data/all.jsonl', 'w') as f:
    for r in rows:
        f.write(r['payload'] + '\n')
        rec = json.loads(r['payload']); last[rec.get('id')] = r['payload']
with open('data/last.jsonl', 'w') as f:
    for p in last.values(): f.write(p + '\n')
print(f"{len(rows)} snapshots, {len(last)} sessions -> data/all.jsonl, data/last.jsonl")
PY
rm data/_d1.json
python3 scripts/to_csv.py data/all.jsonl
