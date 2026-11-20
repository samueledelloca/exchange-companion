#!/usr/bin/env python3
"""Turn recorded sessions into two CSV files for analysis.

    python3 scripts/to_csv.py                 # reads data/all.jsonl
    python3 scripts/to_csv.py path/to/all.jsonl

Keeps the last snapshot per session id, then writes
  data/sessions.csv  one row per session (variants, profile, totals, answers, UEQ-S scores)
  data/events.csv    one row per event (time, type, step, choice, other details as JSON)
Works on the local server's data and on the Cloudflare export alike.
"""
import csv, json, os, sys
from statistics import mean

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA, 'all.jsonl')

last = {}
for line in open(src, encoding='utf-8'):
    line = line.strip()
    if not line:
        continue
    rec = json.loads(line)
    last[rec.get('id')] = rec            # later snapshots replace earlier ones
sessions = sorted(last.values(), key=lambda r: r.get('startedAt', ''))

TAILORED = ['map_where', 'next_step', 'buddy_pleasant', 'buddy_annoy', 'costs_clear', 'trips_useful']
ABOUT = ['screen', 'age', 'region', 'occupation', 'field']

def first(ev, kind):
    return next((e for e in ev if e['type'] == kind), {})

def ueq(answers):
    # UEQ-S: 1..7 mapped to -3..+3; items 1-4 pragmatic, 5-8 hedonic.
    vals = [answers.get(f'ueq{i}') for i in range(8)]
    vals = [int(v) - 4 if v not in (None, '') else None for v in vals]
    prag = [v for v in vals[:4] if v is not None]
    hed = [v for v in vals[4:] if v is not None]
    return vals, (round(mean(prag), 3) if len(prag) == 4 else ''), (round(mean(hed), 3) if len(hed) == 4 else '')

rows = []
for r in sessions:
    ev = r.get('events', [])
    a = r.get('answers') or {}
    v = r.get('variant', {})
    prof, end, tut = first(ev, 'profile'), first(ev, 'end'), first(ev, 'tutorial')
    probs = end.get('problems') or [{'id': e.get('id'), 'cause': e.get('cause', 'choice')} for e in ev if e['type'] == 'problem']
    probs = [p if isinstance(p, dict) else {'id': p, 'cause': ''} for p in probs]
    items, prag, hed = ueq(a)
    row = {
        'id': r.get('id'), 'code': r.get('code', ''), 'round': r.get('round', ''), 'version': r.get('version', ''),
        'started_at': r.get('startedAt', ''), 'last_saved': r.get('_server_time', ''),
        'device': (r.get('device') or {}).get('class', r.get('userAgent', '')), 'screen_size': r.get('screen', ''),
        'os': (r.get('device') or {}).get('os', ''), 'browser': (r.get('device') or {}).get('browser', ''),
        'touch': (r.get('device') or {}).get('touch', ''), 'dpr': (r.get('device') or {}).get('dpr', ''),
        'orientation_start': ((r.get('device') or {}).get('start') or {}).get('orientation', ''),
        'viewport_end': '{w}x{h}'.format(**end['viewport']) if end.get('viewport') else '',
        'orientation_changes': sum(e['type'] == 'viewport' for e in ev),
        'buddy': v.get('buddy', ''), 'tips': v.get('tips', ''), 'seed': v.get('seed', ''),
        'status_style': json.dumps(v.get('statusStyle', {})),
        'persona': prof.get('preset', ''), 'origin': prof.get('origin', ''), 'stay': prof.get('stay', ''), 'abroad_before': prof.get('abroad', ''),
        'tutorial_skipped': tut.get('skipped', ''), 'tutorial_s': round(tut['ms'] / 1000, 1) if 'ms' in tut else '',
        'reached_end': bool(end), 'ended_early': end.get('early', ''), 'questionnaire_sent': bool(a),
        'steps_done': end.get('done', ''), 'steps_total': end.get('total', ''), 'sim_day': end.get('day', ''),
        'total_chf': end.get('totalCHF', ''), 'surprise_chf': end.get('surpriseCHF', ''),
        'problems': len(probs), 'problem_types': len({p['id'] for p in probs}),
        'problems_choice': sum(p.get('cause') == 'choice' for p in probs),
        'problems_random': sum(p.get('cause') == 'random' for p in probs),
        'problems_forced': sum(p.get('cause') == 'forced' for p in probs),
        'problem_ids': ' '.join(p['id'] for p in probs),
        'why_answers': sum(e['type'] == 'why' for e in ev),
        'next_step_q': ' '.join(f"{e.get('step')}:{e.get('style')}:{e.get('answer')}" for e in ev if e['type'] == 'next_step_q'),
        'tips_opened': sum(e['type'] == 'tips_open' for e in ev),
        'trips_viewed': sum(e['type'] == 'trip_view' for e in ev),
        'memes_shown': sum(e['type'] == 'meme_shown' for e in ev),
        'resumed': sum(e['type'] == 'resume' for e in ev),
        'events': len(ev), 'duration_s': round(ev[-1]['t'] / 1000) if ev else '',
        'share_trip': a.get('shareTrip', ''),
    }
    for k in ABOUT:
        row[k] = a.get(k, '')
    for i, val in enumerate(items):
        row[f'ueq{i + 1}'] = '' if val is None else val
    row['ueq_pragmatic'] = prag
    row['ueq_hedonic'] = hed
    for k in TAILORED:
        row[k] = a.get(k, '')
    row['open_change'] = a.get('open_change', '')
    row['open_like'] = a.get('open_like', '')
    rows.append(row)

os.makedirs(DATA, exist_ok=True)
# utf-8-sig so Excel shows accents correctly
with open(os.path.join(DATA, 'sessions.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ['id'])
    w.writeheader(); w.writerows(rows)

CORE = ['type', 't', 'step', 'scene', 'choice']
with open(os.path.join(DATA, 'events.csv'), 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['session_id', 'code', 'round', 't_ms', 'type', 'step', 'scene', 'choice', 'details'])
    n = 0
    for r in sessions:
        for e in r.get('events', []):
            rest = {k: v for k, v in e.items() if k not in CORE}
            w.writerow([r.get('id'), r.get('code', ''), r.get('round', ''), e.get('t'), e.get('type'), e.get('step', ''),
                        e.get('scene', ''), e.get('choice', ''), json.dumps(rest, ensure_ascii=False) if rest else ''])
            n += 1
print(f"{len(rows)} sessions -> data/sessions.csv, {n} events -> data/events.csv")
