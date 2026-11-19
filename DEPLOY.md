# Deploying Exchange Companion (Cloudflare Pages + D1, free tier)

Live at **https://exchange-companion.pages.dev**

```
browser -> Cloudflare Pages (public/) -> Pages Function functions/api/log.js -> D1 database (Western Europe)
```

The app posts to the relative `api/log`, so the same code runs with `python3 server.py`
on a laptop and on Cloudflare. Recordings live in the D1 database `exchange-companion`
(table `snapshots`, see `schema.sql`), never in the published files. No IP address is stored.

## Publish a new version

```bash
npx wrangler login                                   # once, opens the browser
npx wrangler pages deploy --branch main --commit-dirty=true
```

Before each test round, set `STUDY_ROUND` in `public/js/config.js`
(`pilot-internal`, `class-2026-11-26`, `class-2026-12-02`, `online`) and publish again.

## Get the data

```bash
./scripts/export.sh      # writes data/all.jsonl and data/last.jsonl (last snapshot per session)
```

`data/` is git-ignored: recordings never go to the repository.

## Checks

- `https://exchange-companion.pages.dev/api/health` returns `{"ok":true,...}`.
- Count sessions: `npx wrangler d1 execute exchange-companion --remote --command "SELECT round, count(DISTINCT session_id) FROM snapshots GROUP BY round"`.

## Set up from scratch (another account)

```bash
npx wrangler d1 create exchange-companion --location weur   # copy the id into wrangler.toml
npx wrangler d1 execute exchange-companion --remote --file schema.sql
npx wrangler pages project create exchange-companion --production-branch main
npx wrangler pages deploy --branch main
```
