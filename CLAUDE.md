# Working on Exchange Companion

Prototype for the USI UX Design course (Group 6): a simulated exchange in Lugano as an
interactive map. Read `README.md` (files, URL parameters) and `DEPLOY.md` (publishing, data).

## Publishing
- Every push to `main` that changes `public/`, `functions/`, `scripts/deploy.sh` or
  `wrangler.toml` goes live automatically (GitHub Action `Publish`, about a minute).
  Check the run in the Actions tab after pushing.
- Do not push on 26.11 or 2.12 during the class sessions unless asked: people are playing.
- Nothing here can read or export the study data. That is done from the maintainer's laptop.

## Editing
- Texts, steps, choices, problems, costs, tips, memes and past trips live in
  `public/js/content.js`. Prefer changes there over the engine (`app.js`).
- Vanilla JS modules, no build step, no dependencies. Test locally with `python3 server.py`
  (http://localhost:8000, add `?round=test`) and check both a phone width (390 px) and desktop.
- Check syntax before pushing: `for f in public/js/*.js; do node --check "$f"; done`.
- Keep recorded event names and questionnaire item ids stable: the analysis depends on them.
  Changing the questionnaire mid-study needs the maintainer's OK.

## Writing style for any text in the app
- Never use em-dashes or the middle dot. Use commas, parentheses or separate sentences.
- Plain, short sentences in English, the companion's tone for buddy lines.
- No personal data in the repo (it is public). Recordings never go into git (`data/` is ignored).
