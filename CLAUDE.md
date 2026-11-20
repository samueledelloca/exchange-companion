# Working on Exchange Companion

Prototype for the USI UX Design course (Group 6): a simulated exchange in Lugano as an
interactive map. Read `README.md` (files, URL parameters) and `DEPLOY.md` (publishing, data).

## Publishing
- Every push to `main` that changes `public/`, `functions/`, `scripts/deploy.sh` or
  `wrangler.toml` goes live automatically (GitHub Action `Publish`, about a minute).
  Check the run in the Actions tab after pushing.
- Do not push on 26.11 or 2.12 during the class sessions unless asked: people are playing.

## Study data
The data can be exported without the maintainer's laptop. The site has a protected download,
`/api/export`, that gives exactly the same CSV files as the laptop export (`scripts/export.sh`).
Without the right key it returns "not found" (404).
- In a Claude session: run `./scripts/fetch.sh`. It saves `data/sessions.csv`,
  `data/events.csv` and the raw data (`data/last.jsonl`), ready for analysis. Add a round name
  for one round only, for example `./scripts/fetch.sh class-2026-11-26`.
- In the maintainer's cloud environment the key is saved as a network secret for
  `exchange-companion.pages.dev` (the proxy adds it as the Bearer header), so no real variable
  is needed: run `EXPORT_KEY=proxy-injected ./scripts/fetch.sh`. Only if that returns 404 or
  the host is blocked, ask the maintainer to save the key again (environment settings, Network
  secrets). Never ask for the key in the chat, never print it, write it into a file in the repo,
  or put it in a commit, an issue or a URL you show.
- Straight to a phone, no Claude needed: open
  `https://exchange-companion.pages.dev/api/export?key=KEY` in the browser and the CSV
  downloads. Add `&file=events` for the events file, `&file=jsonl` for the raw data,
  `&round=class-2026-11-26` for one round.
- If `fetch.sh` says it got the web page instead of data, a deploy is still propagating; wait a
  minute and retry.
- `data/` is git-ignored. Never commit recordings or CSVs; never paste participant answers
  into GitHub. Summaries (counts, means) in the chat are fine.
- Rounds: `test` (team tests and everything before 20.11.2026, 40 sessions), `pre-class`
  (until 25.11), `class-2026-11-26`, `class-2026-12-02`, `online` (other days after 26.11).
  The label is set by date in `public/js/config.js`; `?round=test` forces `test`.
- Column meanings: `DEPLOY.md` (Get the data). UEQ-S items are scored -3..+3, items 1-4
  pragmatic, 5-8 hedonic. `functions/api/export.js` and `scripts/to_csv.py` must produce the
  same columns; change both together.
- Withdrawal: a participant sends their code (EC-XXXXXX); the delete command is in `DEPLOY.md`
  and needs the maintainer's Cloudflare login.

## Editing
- Texts, steps, choices, problems, costs, tips, memes and past trips live in
  `public/js/content.js`. Prefer changes there over the engine (`app.js`).
- Vanilla JS modules, no build step, no dependencies. Test locally with `python3 server.py`
  (http://localhost:8000, add `?round=test`) and check both a phone width (390 px) and desktop.
- Check syntax before pushing: `for f in public/js/*.js; do node --check "$f"; done`.
- Keep recorded event names and questionnaire item ids stable: the analysis depends on them.
  Changing the questionnaire mid-study needs the maintainer's OK.

## How the app works (decisions already taken with the group; ask before reversing one)
- Two zones on one OpenStreetMap-based map: Home (before departure: accounts, visa if needed,
  USI Home, room search, study plan, all mandatory) and Lugano, fogged until arrival. The travel
  choice (train, plane via Milan or Zurich, car over the Tremola) plays an arrival scene
  (`public/js/arrival.js`), then the fog lifts and the welcome day at the International office
  is suggested.
- Paths: gold = suggested next, blue = also open, green = walked. Legend fixed in a corner on
  desktop, "?" pill on phones, same symbols in the tutorial.
- Role-play is explicit: the participant plays a preset student or one they create (EU,
  non-EU with visa, non-EU without visa). The "You play ..." chip opens the character card.
- Experimental variants (see `config.js`): companion tone playful/plain and tips named/anon,
  per participant; status message rich/bare, varying within the run. At least one problem per
  run, its cause logged as choice, random or forced. Memes only in the playful variant, one per
  outcome (`res.meme` in `content.js`), and they must match the outcome.
- Costs are central (planned vs surprises). Residence permit, biometrics and registration
  cost 0 for students; the visa fee only applies to visa students. Sources are in the header
  comment of `content.js`; do not invent new figures without a source.
- Phones: full-screen map with pinch, drag and double-tap (no zoom buttons, removed on purpose),
  the camera follows the suggested place and keeps it visible beside open panels.
- The questionnaire: optional About you, UEQ-S, six tailored items, two open questions. The
  participant code and withdrawal by email are shown at consent and at the end.
- Demo links (not recorded): `?demo=arrival&mode=train|flight|car[&via=zurich]`.
- Still open: the companion's final name and look; checking the remaining cost estimates and
  the sublet owner's-letter rule.

## Writing style for any text in the app
- Never use em-dashes or the middle dot. Use commas, parentheses or separate sentences.
- Plain, short sentences in English, the companion's tone for buddy lines.
- No personal data in the repo (it is public). Recordings never go into git (`data/` is ignored).
