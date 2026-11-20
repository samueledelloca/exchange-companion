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
./scripts/deploy.sh          # tags CSS/JS with a version, so old phone tabs reload
```

The study round is set automatically from the date (Swiss time): `pre-class` before 26.11,
`class-2026-11-26`, `class-2026-12-02`, and `online` on any other day after 26.11. For team
tests add `?round=test` to the link. The 40 sessions recorded until 20.11.2026 were relabelled
`test`.

## Get the data

```bash
./scripts/export.sh      # writes data/all.jsonl, data/last.jsonl, data/sessions.csv, data/events.csv
```

`sessions.csv` has one row per participant (variants, profile, totals, problems by cause,
background, UEQ-S items and scale scores on -3..+3, tailored items, open answers);
`events.csv` has one row per event with the details as JSON. For local server data run
`python3 scripts/to_csv.py`. `data/` is git-ignored: recordings never go to the repository.

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

## Withdrawal requests

Participants see a code like `EC-7K3QF2` (consent details, "My steps", final page). To delete
everything recorded for that code:

```bash
npx wrangler d1 execute exchange-companion --remote --command "DELETE FROM snapshots WHERE json_extract(payload, '$.code') = 'EC-7K3QF2'"
```

Then delete any local copy too (`data/`, re-export). Sessions recorded before 2026-11-20 have no code.

## Automatic publishing from GitHub

`.github/workflows/deploy.yml` runs `scripts/deploy.sh` on every push to `main` that touches
the app, so edits made from a cloud Claude Code session or the GitHub website go live without
a laptop. It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (a Cloudflare API token
with the permission Account, Cloudflare Pages, Edit) and `CLOUDFLARE_ACCOUNT_ID`.
To roll back, open the Pages project in the Cloudflare dashboard, Deployments, and use
"Rollback to this deployment" on an earlier one.
