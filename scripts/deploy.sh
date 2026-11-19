#!/usr/bin/env bash
# Publish public/ to Cloudflare Pages with a version tag on every CSS and JS URL,
# so browsers (and old phone tabs) always load the new build after a deploy.
set -euo pipefail
cd "$(dirname "$0")/.."
V=$(date +%Y%m%d%H%M)
rm -rf .deploy && cp -r public .deploy
sed -i "s#css/app.css\"#css/app.css?v=$V\"#; s#js/app.js\"#js/app.js?v=$V\"#" .deploy/index.html
sed -i -E "s#(from '\./[a-z]+\.js)'#\1?v=$V'#g" .deploy/js/*.js
sed -i "s#VERSION: 'dev'#VERSION: '$V'#" .deploy/js/config.js
npx wrangler pages deploy .deploy --project-name exchange-companion --branch main --commit-dirty=true
echo "Published version $V"
