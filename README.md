# Exchange Companion (prototype)

Group 6, USI UX Design 2026. A simulated exchange told as an interactive map of Lugano.
The participant plays an exchange student and walks paths whose steps depend on each
other. The companion (Miro, the cat) guides them, and the app records what they do.
A play-through takes about 5 to 10 minutes plus a 2-minute questionnaire.

## Run it

Live: **https://exchange-companion.pages.dev** (Cloudflare Pages, see `DEPLOY.md`).

Locally:

```bash
python3 server.py              # then open http://localhost:8000
```

Python 3 only, no install; sessions go to `data/`. Useful URL parameters:

| Parameter | Effect |
|---|---|
| `?buddy=playful` or `plain` | force the companion variant (memes vs neutral) |
| `?tips=named` or `anon` | force the tips variant (signed by a past student vs anonymous) |
| `?seed=42` | replay the same random events (USI Home lottery, landlord replies, recognition) |
| `?debug=1` | show the assigned variant at the top |

## Files

| File | What it holds | Who edits it |
|---|---|---|
| `public/js/content.js` | all texts, steps, choices, problems, tips, memes, trips, questionnaire items | everyone |
| `public/js/config.js` | study round label, variants, why-prompt rate | whoever runs a test round |
| `public/js/app.js` | engine, screens, buddy, tutorial | Samuele |
| `public/js/map.js` | the illustrated map | Samuele |
| `public/css/app.css` | look | anyone, carefully |
| `server.py` | local server: serves the app and records sessions to `data/` | nobody |
| `functions/api/log.js`, `schema.sql`, `wrangler.toml` | the same recorder on Cloudflare (D1 database) | nobody |
| `scripts/export.sh` | downloads the online data to `data/` | whoever analyses |

To change a story, edit `STEPS` in `content.js`. Each step has a place on the map,
an area (one of the five topics), `requires` (the steps that must be done first: this
is what draws the paths) and scenes. A choice either leads to another scene or ends the
step as done, waiting (someone else must act, e.g. the canton) or postponed. Problems
come from the barrier table of Interim Report 1. Participants never see the codes (B1 to
B17); the mapping from problem ids to codes is in the comment at the top of `content.js`.
Every run meets at least one problem: if a participant has avoided all of them by the
time the permit or the recognition answer arrives, that answer goes wrong. Each `problem`
event carries a `cause`: `choice` (followed from what they chose), `random` (dice) or
`forced` (the guarantee rule). **Count `forced` problems separately**, or careful players
will look as if they made mistakes; the `end` event also gives `forcedProblems`.

**Money.** The top bar shows the budget: everything spent, with surprises (fines, scam,
taxi, Serafe, extra lease month) in red. Choices show estimated prices, every outcome
lists what the step cost, and the budget breakdown also estimates the rent still ahead.
Amounts are rough 2026 estimates listed at the top of `content.js`; **check them before
the class session.**

## What is tested

- **Map and paths.** Dependencies made visible (no address, no registration).
- **Personalisation.** Three personas from Report 1, or a custom student (EU or not,
  semester or year, first time abroad or not). Non-EU students get the visa step and no
  insurance exemption. Students who lived abroad skip one tutorial card.
- **Companion.** Intro, tutorial (skippable), next-step hints, reactions after each step.
  Jokes only after good outcomes. After a problem it is supportive in both variants.
- **Critical scenarios.** A scam listing, missing documents at Punto Città, an
  Italian-only counter, the silent permit wait, the postal exemption letter, a lost
  one-time username, a timetable clash, a refused course, a transport fine and the Serafe
  bill. Several are random, several depend on earlier choices.
- **Social layer.** Tips from past students on the steps, and other students' trips
  shown as trails on the map. Sharing your own trip is an opt-in at the end
  (simulated, nothing is published).

### Variants

| Factor | Levels | Assigned | Why |
|---|---|---|---|
| Companion tone | playful (memes) / plain | per participant, random | a tone that changes mid-run would be confounded with the step |
| Tips signature | named past student / anonymous | per participant, random | same |
| Status message while waiting | rich ("nothing to do for you now, usually 3 to 6 weeks") / bare ("in progress") | within the run, balanced across the waiting procedures | after each status view a one-tap question asks "do you know what to do next?" |

With the small samples of this course the comparisons are descriptive (engineering
evaluation, not a statistical test), so read them together with think-aloud and the
open answers.

### Questionnaire

UEQ-S (8 items, 7-point; first four pragmatic, last four hedonic), six tailored
5-point items (map, next step, companion pleasant, jokes got in the way (playful only),
costs realistic, others' trips useful), two open questions, and a screener (exchange student now, in the
past, student, other), plus optional background questions in broad categories (age range,
region where they grew up, occupation, field). We also sample up to three "why did you choose that?" prompts
per run, after choices with several reasonable options.

## Accidental reloads

Desktop and Android browsers ask before reloading mid-game. iPhones ignore that prompt, so the
game state is also kept in the tab: after a reload the companion offers to continue the same
session (same id and code, event `resume`). A step left half-way restarts from its first scene.

## Data

Every session posts snapshots to `api/log`, both when the page is hidden or closed and
on completion. Locally, `server.py` appends each snapshot as one JSON line to `data/<session>.jsonl`
and `data/all.jsonl`; online, the snapshots go to D1 and `scripts/export.sh` writes the
same `data/all.jsonl`. **Keep the last snapshot per `id`.** Nothing is sent before consent.
No IP address and no name are stored.

A snapshot contains `id`, `code` (the short participant code shown to them, for withdrawal requests: see `DEPLOY.md`), `round`, `version`, `startedAt`, `variant` (buddy, tips, seed,
statusStyle), `events` (type, `t` in ms since load, and details) and `answers`. The
main event types are:

`consent`, `profile`, `tutorial` (skipped, ms), `open_step`, `choice`, `multi`,
`outcome` (end, mood, simulated day, totalCHF, surpriseCHF), `problem` (id, cause), `cost` (chf, why, kind planned or surprise), `costs_open`, `why`,
`status_view` (where: status or outcome), `next_step_q`, `next_step_hint` (shown after a no or not sure), `waiting_action`, `tips_open`, `timetable_check`,
`counter_card`, `quiz` (comprehension check at arrival: selected, correct), `list_open`, `list_pick`, `trips_open`, `trip_view`, `trip_hide`, `meme_shown`,
`buddy_click`, `buddy_dismiss`, `stamp`, `mail_arrived`, `end` (early, done/total, totalCHF, surpriseCHF, costs, problems with cause, forcedProblems), `share_trip`, `questionnaire`.

If the server cannot be reached (for example the page is opened as a file), the thank-you
screen shows a folded "Save the session file" fallback; otherwise it only closes the story.

Deployment and data export: see `DEPLOY.md`.
