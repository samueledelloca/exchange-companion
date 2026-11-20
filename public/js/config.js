// Study configuration. Edit here, not in the engine.

// Study round, set automatically from the date in Lugano so nobody has to remember
// to change it: before the class sessions 'pre-class', the two class days by date,
// any other day after that 'online'. ?round=test (or any label) overrides it, e.g.
// for team tests. Sessions recorded until 20.11.2026 were relabelled 'test'.
function studyRound() {
  const forced = new URLSearchParams(location.search).get('round');
  if (forced) return forced.replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'test';
  const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Zurich' }); // YYYY-MM-DD
  if (day === '2026-11-26') return 'class-2026-11-26';
  if (day === '2026-12-02') return 'class-2026-12-02';
  return day < '2026-11-26' ? 'pre-class' : 'online';
}

export const CONFIG = {
  VERSION: 'dev', // replaced by scripts/deploy.sh; recorded in every session
  // Where the anonymous session log is POSTed. Relative, so it works under any
  // path prefix (e.g. /exchange-companion/). server.py records it as JSON Lines.
  // Empty string = no sending (the end screen offers a download instead).
  LOG_ENDPOINT: 'api/log',

  // Study label stored with every session (see studyRound above).
  STUDY_ROUND: studyRound(),

  // Variants. Each session is assigned at random unless the URL forces one,
  // e.g. ?buddy=plain&tips=anon. Status style is varied WITHIN the run:
  // the waiting procedures get "rich" or "bare" status in a balanced random way.
  VARIANTS: {
    buddy: ['playful', 'plain'],   // memes and jokes vs neutral confirmations
    tips: ['named', 'anon'],       // tips signed by a past student vs anonymous
  },

  // At most this many "why did you choose that?" prompts per session,
  // each shown with this probability on eligible choices.
  WHY_MAX: 3,
  WHY_PROB: 0.5,

  // Contact shown in the consent text.
  CONTACT: 'USI UX Design course, Group 6',
  CONTACT_EMAIL: 'samuele.delloca@supsi.ch', // withdrawal requests and questions
};
