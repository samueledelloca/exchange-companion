// Study configuration. Edit here, not in the engine.
export const CONFIG = {
  VERSION: 'dev', // replaced by scripts/deploy.sh; recorded in every session
  // Where the anonymous session log is POSTed. Relative, so it works under any
  // path prefix (e.g. /exchange-companion/). server.py records it as JSON Lines.
  // Empty string = no sending (the end screen offers a download instead).
  LOG_ENDPOINT: 'api/log',

  // Study label stored with every session (change it per test round).
  STUDY_ROUND: 'pilot-internal',

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
};
