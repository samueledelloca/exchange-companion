// Exchange Companion: all story content lives here, so the group can edit texts
// without touching the engine. Procedures are simplified for the simulation.
// Texts shown to participants carry no barrier codes. For the analysis, the
// problems map to Table 4.3 of Interim Report 1 as follows (problem id or step):
//   visa B2; usihome failed or "interest" B1, B4; roomhunt B5, B6, B7; lease B6;
//   arrival without room B5; register: Italian counter B14, sent back B9;
//   permit silence B10; insurance by post B12; lost-credentials B13;
//   course-clash B15; recognition wait B16; fine and Serafe bill B17.

export const BUDDY = { name: 'Miro' };

// The five topics of the map. Colours are used for areas, stamps and chips.
export const AREAS = {
  prep:     { label: 'Preparation',      color: '#4A6FA5', stamp: '🧳' },
  housing:  { label: 'Accommodation',    color: '#D46A43', stamp: '🏠' },
  admin:    { label: 'Admin procedures', color: '#C9921A', stamp: '🏛️' },
  study:    { label: 'Study plan',       color: '#1F9584', stamp: '🎓' },
  everyday: { label: 'Everyday life',    color: '#4E9A4E', stamp: '☕' },
};

// Places on the map (viewBox 1000 x 620).
export const PLACES = {
  laptop:    { x: 112, y: 140, label: 'Your desk at home',  icon: '💻' },
  embassy:   { x: 112, y: 255, label: 'Swiss embassy',      icon: '🛂' },
  mailbox0:  { x: 112, y: 370, label: 'USI Home portal',    icon: '📝' },
  roomsearch:{ x: 112, y: 485, label: 'Room search online', icon: '🔎' },
  station:   { x: 356, y: 340, label: 'Lugano station',     icon: '🚉' },
  campus:    { x: 560, y: 214, label: 'USI campus',         icon: '🎓' },
  office:    { x: 684, y: 206,  label: 'Exchange office',    icon: '📑' },
  busstop:   { x: 664, y: 320, label: 'Bus stop',           icon: '🚌' },
  municipio: { x: 522, y: 422, label: 'Punto Città',        icon: '🏛️' },
  canton:    { x: 286, y: 430, label: 'Cantonal office',    icon: '🪪' },
  post:      { x: 432, y: 398, label: 'Post office',        icon: '📮' },
  // "Your mailbox" moves to wherever you end up living (set by the engine)
  home2:     { x: 800, y: 330, label: 'Your mailbox',       icon: '📬' },
  lake:      { x: 650, y: 424, label: 'Lakefront',          icon: '🌅' },
  viewpoint: { x: 940, y: 236, label: 'Monte Brè',          icon: '⛰️' },
};

// Where you can end up living: real locations (OpenStreetMap). Only one becomes
// yours; the others disappear from the map once you have a room.
export const HOMES = {
  usihome: { x: 548, y: 296, name: 'USI Home', note: 'student residence', home2: 'Your room at USI Home' },
  lease:   { x: 466, y: 168, name: 'Molino Nuovo', note: 'one-year lease', home2: 'Your flat, Molino Nuovo' },
  sublet:  { x: 786, y: 111, name: 'Viganello', note: 'sublet for one semester', home2: 'Your room, Viganello' },
};

// Illustrative tips from past students. Names are invented; situations come
// from the interviews (not said to participants). "who" is hidden in the anonymous-tips variant.
export const TIPS = {
  usihome:  [{ who: 'Lena', when: 'Fall 2025', text: 'Registering interest is not applying. Put the real opening date in your calendar.' }],
  roomhunt: [{ who: 'Tomás', when: 'Spring 2026', text: 'Never pay a deposit before a viewing, even a video one.' },
             { who: 'Lena', when: 'Fall 2025', text: 'Ask outgoing USI students: many sublet their room for exactly one semester.' }],
  register: [{ who: 'Jakob', when: 'Fall 2025', text: 'If you sublet, Punto Città also wants a letter from the owner. I learned it at the counter.' }],
  permit:   [{ who: 'Ana', when: 'Spring 2026', text: 'Silence is normal. Mine took five weeks and then a letter just appeared.' }],
  insurance:[{ who: 'Jakob', when: 'Fall 2025', text: 'The exemption goes by post. Do it in week one or you will forget it.' }],
  courses:  [{ who: 'Ana', when: 'Spring 2026', text: 'Check every course for a timetable clash before you send the learning agreement.' }],
  transport:[{ who: 'Tomás', when: 'Spring 2026', text: 'Check the zones on your ticket. I got a fine in week two.' }],
  surprise: [{ who: 'Lena', when: 'Fall 2025', text: 'The Serafe fee is per household. Split it with your flatmates.' }],
};

// Other students' trips: complete illustrative journeys (written for the
// prototype), step by step, in an order the dependencies allow. A step may
// appear twice (sent back, or a waiting step that comes back).
export const TRIPS = [
  { who: 'Lena', profile: 'EU, one semester, first time abroad',
    story: 'Missed USI Home, found a sublet, went to Punto Città twice because of the owner\'s letter.',
    steps: [
      ['accounts', 'win', 'Saved the username in a password manager.'],
      ['usihome', 'oops', 'Thought registering interest was enough. USI Home was full.'],
      ['roomhunt', 'win', 'Found a sublet in Viganello from an outgoing student.'],
      ['courses', 'win', 'Learning agreement sent, no clashes.'],
      ['arrive', 'win', 'Train through the Gotthard.'],
      ['register', 'oops', 'Sent back: the owner\'s letter was missing.'],
      ['register', 'win', 'Came back with the letter. Registered.'],
      ['permit', 'meh', 'Submitted the form, then four weeks of silence.'],
      ['insurance', 'win', 'Posted the exemption letter in week one.'],
      ['transport', 'win', 'Bought a monthly student pass.'],
      ['recognition', 'win', 'Learning agreement approved at once.'],
      ['surprise', 'meh', 'Serafe bill, split with the flatmates.'],
      ['permit', 'win', 'Letter arrived: biometrics done.'],
      ['settled', 'win', 'Settled. Aperitivo on Monte Brè.'],
    ] },
  { who: 'Ana', profile: 'Non-EU, one semester',
    story: 'Waited five weeks for the visa, got a room at USI Home, ran six procedures at once.',
    steps: [
      ['accounts', 'win', 'Screenshot of the username, just in case.'],
      ['visa', 'meh', 'Embassy in another city, then five weeks of waiting.'],
      ['usihome', 'win', 'Applied the minute it opened and got a room.'],
      ['courses', 'oops', 'Two courses on Tuesday at 10:30. Changed the plan.'],
      ['visa', 'win', 'Visa collected.'],
      ['arrive', 'win', 'Flight to Zurich, then the train.'],
      ['register', 'win', 'Used the checklist. Registered at the first try.'],
      ['insurance', 'win', 'Compared three student insurances, bought one online.'],
      ['permit', 'meh', 'Submitted. Six procedures running at once.'],
      ['transport', 'win', 'Asked which zones she needed.'],
      ['recognition', 'oops', 'One course refused at home. Swapped it.'],
      ['surprise', 'win', 'Serafe: USI Home pays it, nothing to do.'],
      ['social', 'win', 'Welcome aperitivo at the lake.'],
      ['permit', 'oops', 'The canton wanted proof of money. Sent the grant letter.'],
      ['permit', 'win', 'Biometrics done.'],
      ['settled', 'win', 'Settled.'],
    ] },
  { who: 'Tomás', profile: 'EU, full year, studied abroad before',
    story: 'Confident about the paperwork, still got a bus fine and a surprise bill.',
    steps: [
      ['accounts', 'win', 'Password manager, as always.'],
      ['usihome', 'oops', 'Applied on time, but no room was left.'],
      ['roomhunt', 'meh', 'A listing asked for a deposit before any viewing. Walked away.'],
      ['roomhunt', 'win', 'One-year lease in Molino Nuovo, right for a full year.'],
      ['arrive', 'win', 'Drove down with family.'],
      ['register', 'win', 'Registered at the first try.'],
      ['courses', 'win', 'Study plan sent.'],
      ['permit', 'meh', 'Submitted, then waited.'],
      ['insurance', 'oops', 'Postponed the exemption letter. Posted it just in time.'],
      ['transport', 'oops', 'Cheapest ticket, wrong zone: about 80 CHF of surcharge and fare.'],
      ['recognition', 'win', 'Approved.'],
      ['surprise', 'oops', 'Ignored the Serafe bill. Paid a reminder fee.'],
      ['permit', 'win', 'Biometrics done.'],
      ['settled', 'win', 'Settled.'],
    ] },
];

// Ready-made characters (from the three personas of Interim Report 1).
export const PRESETS = [
  { id: 'jonas', name: 'Jonas', flag: '🇩🇪', origin: 'eu', stay: 'semester', abroad: false,
    blurb: 'MSc student from Germany, one semester, first time living abroad.' },
  { id: 'mariana', name: 'Mariana', flag: '🇧🇷', origin: 'noneu', stay: 'semester', abroad: true,
    blurb: 'Master\'s student from Brazil, needs a visa, many procedures at once.' },
  { id: 'alex', name: 'Alex', flag: '🌍', origin: 'eu', stay: 'year', abroad: true,
    blurb: 'Has done an exchange before, a full year this time.' },
];

// Buddy lines. "win" after a good outcome, "oops" after a problem (support, no
// jokes), "meme" = caption pair for the playful variant.
export const MEMES = {
  accounts:  ['USI: "your username is shown only once"', 'Me: screenshots it 4 times'],
  usihome:   ['When you apply the minute it opens', 'and the room is actually yours'],
  roomhunt:  ['12 messages sent', '1 landlord replied. A legend.'],
  arrive:    ['Lugano: palm trees, a lake, mountains', 'The paperwork is also here. Later.'],
  register:  ['Me at Punto Città with every document', 'in the right order. Character development.'],
  permit:    ['The permit letter arrived', 'My mailbox and I are now best friends'],
  insurance: ['Sending a paper letter in 2026', 'Achievement unlocked: retro mode'],
  courses:   ['Timetable with zero clashes', 'Rarer than a free table at the mensa'],
  recognition:['Home university: "approved"', 'Me: framing the email'],
  transport: ['Bought the right ticket', 'The inspector found nobody to fine today'],
  surprise:  ['A bill for a TV I don\'t own', 'Welcome to Switzerland, I guess'],
  social:    ['Came for the courses', 'Stayed for the aperitivo'],
};

// Step definitions. requires: ids that must be done. when(s): visibility.
// scenes: start scene "start"; each scene returns {text, choices} or a multi
// select. A choice's go(ctx) returns a scene id or an end object:
//   { end: 'done' | 'wait' | 'later', mood: 'win' | 'oops' | 'meh', note }
// COSTS. c.spend() = planned costs, c.cost() = surprises. All amounts are rough
// 2026 estimates for the simulation, to be checked by the group: USI Home
// about 650 CHF/month, private rooms 650-700, deposit up to 3 months on a lease,
// train from Germany about 130, Swiss national visa about 80, permit and
// biometrics about 100, Swisscare-type student insurance 80-95 CHF/month,
// Arcobaleno student monthly pass about 55, surcharge for a partially valid
// ticket (wrong zones) about 75 plus the fare (75 in Zurich, 105 in Lausanne; Ticino not found), taxi
// Malpensa-Lugano about 160, Serafe 335 a year per household.
// PROBLEM CAUSES. c.problem(id, cause): 'choice' (default) follows from what the
// participant chose, 'random' from the dice, 'forced' from the rule that every
// run meets at least one problem. Analyse 'forced' separately.

// Serafe (radio and TV fee, about 335 CHF a year per household). To verify
// with the group: collective households such as a student residence do not pay.
function serafe(c) {
  if (c.s.flags.housing === 'usihome') return 0;
  const chf = c.s.flags.housing === 'lease' ? 335 : 112;
  c.cost(chf, c.s.flags.housing === 'lease' ? 'Serafe radio and TV fee' : 'Your share of the Serafe fee');
  return chf;
}

function land(c, note, mood = 'win') {
  if (!c.s.flags.housing) c.cost(300, 'Hostel while looking for a room');
  c.s.day = Math.max(c.s.day + 1, -7); c.set('arrivedDay', c.s.day);
  return { end: 'done', mood, note };
}

export const STEPS = [
  {
    id: 'accounts', area: 'prep', place: 'laptop', title: 'Set up your USI accounts', mandatory: true,
    requires: [],
    scenes: {
      start: () => ({
        text: 'USI emails you a link to your new account. The page says the username is shown <b>only once</b>.',
        why: true,
        choices: [
          { id: 'manager', label: 'Save it in a password manager', go: c => { c.set('savedCreds', true); c.days(1); return { end: 'done', mood: 'win', note: 'Saved. Future you says thanks.' }; } },
          { id: 'screenshot', label: 'Take a screenshot', go: c => { c.set('savedCreds', true); c.days(1); return { end: 'done', mood: 'win', note: 'Screenshot taken. Somewhere between 400 cat photos, but safe.' }; } },
          { id: 'memory', label: 'I will remember it', go: c => { c.set('savedCreds', false); c.days(1); return { end: 'done', mood: 'meh', note: 'Bold move. Let\'s see.' }; } },
        ],
      }),
    },
  },
  {
    id: 'visa', area: 'prep', place: 'embassy', title: 'Get your Swiss visa', mandatory: true,
    requires: ['accounts'], when: s => s.profile.origin === 'noneu', waitSteps: 2,
    scenes: {
      start: () => ({
        text: 'As a non-EU student you need a Swiss visa before you travel. The embassy is in another city and the process can take weeks.',
        why: true,
        choices: [
          { id: 'now', label: 'Book the embassy appointment now (fee about 80 CHF)', go: c => { c.spend(80, 'Swiss visa fee'); c.days(4); return { end: 'wait', mood: 'meh', note: 'Application handed in. Now the waiting starts.' }; } },
          { id: 'later', label: 'Wait for more documents first', go: c => { c.spend(80, 'Swiss visa fee'); c.days(10); c.set('visaLate', true); return { end: 'wait', mood: 'oops', note: 'You lose ten days, then apply anyway. The waiting starts later.' }; } },
        ],
      }),
      waiting: c => c.statusScene({
        rich: 'Waiting for the embassy. Usually 3 to 8 weeks. <b>Nothing to do for you now.</b> You will get a letter or an email; the companion will tell you.',
        bare: 'Visa application: in progress.',
      }),
      ready: () => ({
        text: '📬 The embassy writes: your visa is ready to collect.',
        choices: [{ id: 'collect', label: 'Collect the visa', go: c => { c.days(2); return { end: 'done', mood: 'win', note: 'Visa in your passport. Lugano, here you come.' }; } }],
      }),
    },
  },
  {
    id: 'usihome', area: 'housing', place: 'mailbox0', title: 'Apply for USI Home', mandatory: true,
    requires: [],
    scenes: {
      start: () => ({
        text: 'USI Home, the student residence, opens applications in three days. A friend says that registering your interest is already enough.',
        why: true, tips: 'usihome',
        choices: [
          { id: 'apply', label: 'Apply the minute it opens', go: c => {
              c.days(3);
              if (c.rng() < 0.45) { c.set('housing', 'usihome'); c.spend(1300, 'USI Home: deposit and first month'); return { end: 'done', mood: 'win', note: 'You got a room at USI Home, about 650 CHF a month. One form and done.' }; }
              c.set('housing', null); c.problem('no-usihome', 'random'); return { end: 'done', mood: 'oops', note: 'Too many applicants: no room left. You will need the private market.' }; } },
          { id: 'interest', label: 'Registering interest is enough', go: c => {
              c.days(3); c.set('housing', null); c.problem('no-usihome');
              return { end: 'done', mood: 'oops', note: 'Registering interest was not an application. By the time you check, USI Home is full.' }; } },
        ],
      }),
    },
  },
  {
    id: 'roomhunt', area: 'housing', place: 'roomsearch', title: 'Find a room', mandatory: true,
    requires: ['usihome'], when: s => s.flags.housing !== 'usihome' || s.steps.roomhunt?.status === 'done',
    scenes: {
      start: c => ({
        text: `You message 12 landlords from home. ${c.rng() < 0.5 ? 'One replies.' : 'Nobody replies for a week.'} Some only offer one-year leases or want a Swiss phone number. A new listing pops up in a Facebook group.`,
        tips: 'roomhunt',
        choices: [
          { id: 'listing', label: 'Look at the new listing', go: () => 'scam' },
          { id: 'database', label: 'Check the USI housing database', go: c => { c.days(2); return 'offers'; } },
        ],
      }),
      scam: () => ({
        text: 'Bright room in the centre, 600 CHF. The landlord is "abroad for work" and asks for a 1,200 CHF deposit by bank transfer before any viewing.',
        why: true,
        choices: [
          { id: 'pay', label: 'Pay the deposit, rooms go fast', go: c => { c.cost(1200, 'Deposit to a fake landlord'); c.problem('scam'); c.days(4); return 'scamResult'; } },
          { id: 'video', label: 'Ask for a video viewing first', go: c => { c.days(2); return 'scamAvoided'; } },
        ],
      }),
      scamResult: () => ({
        text: 'The landlord stops answering. The listing disappears. The 1,200 CHF are gone.',
        mood: 'oops',
        choices: [{ id: 'db', label: 'Try the USI housing database', go: c => { c.days(2); return 'offers'; } }],
      }),
      scamAvoided: () => ({
        text: 'The "landlord" never answers the video request. Probably a scam. Good call.',
        choices: [{ id: 'db', label: 'Try the USI housing database', go: c => { c.days(1); return 'offers'; } }],
      }),
      offers: () => ({
        text: 'Two real options:<br>🏢 <b>Molino Nuovo</b>: your own lease, 650 CHF a month, deposit of three months, but the contract runs one year.<br>🏡 <b>Viganello</b>: a sublet from a student leaving for an exchange, 700 CHF a month, one month of deposit, exactly your semester.',
        why: true,
        choices: [
          { id: 'lease', label: 'Take the one-year lease (2,600 CHF to move in)', go: c => { c.set('housing', 'lease'); c.spend(2600, 'Lease: 3 months deposit and first month'); c.cost(c.s.profile.stay === 'semester' ? 650 : 0, 'Extra month to leave the lease early'); c.days(5); return 'contractLease'; } },
          { id: 'sublet', label: 'Take the sublet (1,400 CHF to move in)', go: c => { c.set('housing', 'sublet'); c.spend(1400, 'Sublet: deposit and first month'); c.days(5); return 'contractSublet'; } },
        ],
      }),
      contractLease: c => ({
        text: c.s.profile.stay === 'semester'
          ? 'You sign. To leave after one semester you will pay one extra month. The contract is in your inbox.'
          : 'You sign a one-year lease, which fits your full-year stay. The contract is in your inbox.',
        choices: [{ id: 'ok', label: 'Done, I have a room', go: () => ({ end: 'done', mood: 'win', note: 'You have an address in Lugano.' }) }],
      }),
      contractSublet: () => ({
        text: 'The main tenant sends you the sublet contract. Is there anything else you want to ask for?',
        why: true,
        choices: [
          { id: 'only', label: 'No, the contract is enough', go: c => { c.set('ownerLetter', false); return { end: 'done', mood: 'win', note: 'You have an address in Lugano.' }; } },
          { id: 'letter', label: 'Ask also for a letter from the owner', go: c => { c.set('ownerLetter', true); c.days(2); return { end: 'done', mood: 'win', note: 'Contract and owner\'s letter in hand.' }; } },
        ],
      }),
    },
  },
  {
    id: 'arrive', area: 'prep', place: 'station', title: 'Travel to Lugano', mandatory: true,
    requires: ['accounts', 'usihome', 'visa'],
    scenes: {
      start: c => ({
        text: `Bags packed. ${c.s.flags.housing ? 'Your room in Lugano is waiting.' : 'You still have no room in Lugano.'} How do you get there?`,
        why: true,
        choices: c.s.profile.origin === 'eu' ? [
          { id: 'train', label: 'Direct train through the Gotthard (about 130 CHF)', go: c => { c.spend(130, 'Train to Lugano'); c.days(1); c.set('travelNote', 'Six hours of mountains and tunnels, right on time.'); return 'arrived'; } },
          { id: 'flight', label: 'Cheapest flight to Milan, then the bus (about 110 CHF)', go: c => {
              c.spend(110, 'Flight and bus to Lugano'); c.days(1);
              if (c.rng() < 0.5) { c.cost(160, 'Taxi from Milan after a missed bus'); c.problem('missed-bus', 'random'); c.set('travelNote', 'The flight lands late and the last bus to Lugano has gone. Taxi: 160 CHF.'); }
              else c.set('travelNote', 'Cheap flight, bus on time. Lucky you.');
              return 'arrived'; } },
          { id: 'car', label: 'Drive down with family (fuel and vignette, about 90 CHF)', go: c => { c.spend(90, 'Fuel and motorway vignette'); c.days(1); c.set('travelNote', 'Your family carries the boxes and leaves you a full fridge.'); return 'arrived'; } },
        ] : [
          { id: 'zurich', label: 'Long-haul flight to Zurich, then the train (about 950 CHF)', go: c => { c.spend(950, 'Flight to Zurich and train to Lugano'); c.days(1); c.set('travelNote', 'Thirteen hours in the air and three on the train. Tired, but on time.'); return 'arrived'; } },
          { id: 'milan', label: 'Cheaper long-haul flight to Milan, then the bus (about 800 CHF)', go: c => {
              c.spend(800, 'Flight to Milan and bus to Lugano'); c.days(1);
              if (c.rng() < 0.5) { c.cost(160, 'Taxi from Milan after a missed bus'); c.problem('missed-bus', 'random'); c.set('travelNote', 'The flight lands late and the last bus to Lugano has gone. Taxi: 160 CHF.'); }
              else c.set('travelNote', 'Long flight, bus on time. Lucky you.');
              return 'arrived'; } },
        ],
      }),
      arrived: c => ({
        text: `${c.s.flags.travelNote} Palm trees, the lake, the mountains. ${c.s.flags.housing ? 'You have the keys to your room.' : 'With no room yet, you book a hostel for the first nights (about 300 CHF).'} What do you do first?`,
        choices: [
          { id: 'lake', label: 'Drop the bags and walk to the lake', go: c => land(c, 'Welcome to Lugano! Remember: register at Punto Città within 8 days.') },
          { id: 'quiz', label: 'Ask the companion what the first two weeks look like', go: () => 'quiz' },
          { id: 'sim', label: 'Buy a Swiss SIM card at the station (about 25 CHF)', go: c => { c.set('swissPhone', true); c.spend(25, 'Swiss SIM card'); return land(c, 'Swiss number sorted: landlords and offices stop asking for one.'); } },
        ],
      }),
      quiz: () => ({
        text: 'Quick check first. Which of these must you do <b>within 8 days</b> of arriving?',
        multi: [
          { id: 'register', label: 'Register at Punto Città' },
          { id: 'bank', label: 'Open a Swiss bank account' },
          { id: 'halffare', label: 'Buy a Half Fare travelcard' },
          { id: 'courses', label: 'Pick your courses' },
        ],
        submit: (c, sel) => {
          const right = sel.length === 1 && sel[0] === 'register';
          c.log('quiz', { step: 'arrive', selected: sel, correct: right });
          return land(c, right
            ? 'Exactly. Register at Punto Città within 8 days, then start the residence permit online within 14 days.'
            : 'The one with the 8-day deadline is the registration at Punto Città. Then the residence permit, online, within 14 days. The rest can wait.', right ? 'win' : 'meh');
        },
      }),
    },
  },
  {
    id: 'register', area: 'admin', place: 'municipio', title: 'Register at Punto Città', mandatory: true,
    requires: ['arrive', 'roomhunt'],
    scenes: {
      start: c => ({
        text: 'Every new resident must register at Punto Città, the city\'s service point, within 8 days of arrival. Before you go:',
        tips: 'register', why: true,
        choices: [
          { id: 'checklist', label: 'Open the companion\'s checklist for my situation', go: c => { c.set('usedChecklist', true); return 'checklist'; } },
          { id: 'straight', label: 'Just go, I will figure it out', go: () => 'bring' },
        ],
      }),
      checklist: c => ({
        text: `Your checklist (${c.s.flags.housing === 'sublet' ? 'subtenant' : c.s.flags.housing === 'usihome' ? 'USI Home resident' : 'main tenant'}):<ul class="checklist">
          <li>Passport or ID card</li><li>Rental contract${c.s.flags.housing === 'sublet' ? ' <b>and a letter from the owner</b>' : ''}</li>
          </ul><p class="small muted">Your USI enrolment certificate and the photo are for the residence permit, not for this counter.</p>
          <button class="btn-link" data-action="counter-card">Show the counter card in Italian</button>`,
        choices: [{ id: 'go', label: 'Got it, choose what to bring', go: () => 'bring' }],
      }),
      bring: c => ({
        text: 'What do you put in your bag?',
        keep: 'lastBring',
        multi: [
          { id: 'id', label: 'Passport or ID card' },
          { id: 'contract', label: 'Rental contract' },
          { id: 'owner', label: 'Letter from the owner', disabled: c.s.flags.housing === 'sublet' && !c.s.flags.ownerLetter, hint: c.s.flags.housing === 'sublet' && !c.s.flags.ownerLetter ? 'You don\'t have it yet' : '' },
          { id: 'cert', label: 'USI enrolment certificate' },
          { id: 'photo', label: 'Passport photo' },
          { id: 'birth', label: 'Birth certificate' },
          { id: 'bank', label: 'Bank statement' },
        ],
        submit: (c, sel) => {
          c.set('lastBring', sel);
          const need = ['id', 'contract'];
          if (c.s.flags.housing === 'sublet') need.push('owner');
          const missing = need.filter(n => !sel.includes(n));
          c.days(1); c.count('counterVisits');
          if (missing.length === 0) return { end: 'done', mood: 'win', note: 'Registered! Now you can apply for your residence permit.' };
          c.set('missingDocs', missing);
          c.problem('missing-docs');
          return 'sentBack';
        },
      }),
      sentBack: c => {
        const m = c.s.flags.missingDocs || [];
        const names = { id: 'an ID', contract: 'the contract', owner: 'the owner\'s letter', cert: 'the enrolment certificate', photo: 'a photo' };
        const it = m.includes('owner') ? '"Manca la lettera del proprietario."' : '"Manca un documento."';
        return {
          text: `The clerk speaks Italian: ${it}<br>${c.s.flags.usedCounterCard ? 'Thanks to the counter card you understand: ' : 'With a translation app you work out: '}you are missing <b>${m.map(x => names[x]).join(', ')}</b>. You have to come back.`,
          mood: 'oops',
          choices: [
            { id: 'getletter', label: m.includes('owner') ? 'Ask the owner for the letter, then come back' : 'Collect the documents, then come back', go: c => { c.set('ownerLetter', true); c.days(4); return 'bring'; } },
          ],
        };
      },
    },
  },
  {
    id: 'permit', area: 'admin', place: 'canton', title: 'Apply for your residence permit', mandatory: true,
    requires: ['register'], waitSteps: 3,
    scenes: {
      start: () => ({
        text: 'The residence permit application is an online form of the cantonal migration office, in Italian. You attach a copy of your ID, the arrival notification from Punto Città, your USI enrolment certificate and the lease, all in Italian, within 14 days of arrival.',
        tips: 'permit', why: true,
        choices: [
          { id: 'guide', label: 'Use the companion\'s line-by-line guide', go: c => { c.days(1); return { end: 'wait', mood: 'win', note: 'Submitted. Then... silence.' }; } },
          { id: 'translate', label: 'Use a translation app', go: c => { c.days(2); return { end: 'wait', mood: 'meh', note: 'Submitted. Then... silence.' }; } },
          { id: 'ai', label: 'Ask an AI chatbot to explain it', go: c => { c.days(1); return { end: 'wait', mood: 'meh', note: 'Submitted. Then... silence.' }; } },
        ],
      }),
      waiting: c => c.statusScene({
        rich: 'Waiting for the cantonal office. Usually 3 to 6 weeks. <b>Nothing to do for you now.</b> A letter will invite you to take your fingerprints; the companion will tell you when it arrives.',
        bare: 'Permit application: in progress.',
        actions: [
          { id: 'call', label: 'Call the office', reply: 'After 20 minutes on hold: "La pratica è in elaborazione." It is being processed.' },
          { id: 'ask', label: 'Ask other students', reply: 'Three students say: totally normal, theirs took 4 to 6 weeks.' },
        ],
      }),
      ready: c => {
        // The canton asks for one more document: random, and certain if the run had no problem yet.
        if (c.flags('permitExtra') === undefined) { const dice = c.rng() < 0.35, force = !dice && c.s.problems.length === 0; c.set('permitExtra', dice || force); c.set('permitExtraCause', force ? 'forced' : 'random'); }
        if (c.flags('permitExtra') && !c.flags('permitExtraDone')) return {
          text: '📬 A letter from the canton, in Italian. Before deciding, they want proof that you can support yourself during your stay.',
          mood: 'oops', why: true,
          choices: [
            { id: 'bank', label: 'Send a recent bank statement', go: c => { c.problem('permit-extra-doc', c.flags('permitExtraCause')); c.set('permitExtraDone', true); c.days(6); return 'ready'; } },
            { id: 'grant', label: 'Send the grant letter from your home university', go: c => { c.problem('permit-extra-doc', c.flags('permitExtraCause')); c.set('permitExtraDone', true); c.days(4); return 'ready'; } },
            { id: 'wait', label: 'Ignore it, they will figure it out', go: c => { c.problem('permit-extra-doc', c.flags('permitExtraCause')); c.days(14); return 'suspended'; } },
          ],
        };
        return {
          text: '📬 A letter from the canton: book your biometrics appointment (photo and fingerprints).',
          choices: [{ id: 'book', label: 'Book and go to the appointment (fees about 100 CHF)', go: c => { c.spend(100, 'Permit and biometrics fees'); c.days(3); return { end: 'done', mood: 'win', note: 'Biometrics done. Your permit card will follow by post.' }; } }],
        };
      },
      suspended: () => ({
        text: 'Two weeks later, a second letter: without the document your application is <b>suspended</b>.',
        mood: 'oops',
        choices: [{ id: 'send', label: 'Send the bank statement now', go: c => { c.set('permitExtraDone', true); c.days(5); return 'ready'; } }],
      }),
    },
  },
  {
    id: 'insurance', area: 'admin', place: 'post', title: 'Sort out health insurance', mandatory: true,
    requires: ['register'],
    scenes: {
      start: c => c.s.profile.origin === 'eu' ? {
        text: 'Swiss health insurance is compulsory. With your European card you can ask for an <b>exemption</b>, but the request goes <b>by post</b>, on paper.',
        tips: 'insurance', why: true,
        choices: [
          { id: 'now', label: 'Let the companion prepare the letter, post it today', go: c => { c.days(1); return { end: 'done', mood: 'win', note: 'Letter posted. Exemption on its way.' }; } },
          { id: 'later', label: 'It\'s just a letter, I\'ll do it later', go: c => { c.days(1); c.problem('postponed'); return { end: 'later', mood: 'oops', note: 'Postponed. The deadline does not move, though.' }; } },
        ],
      } : {
        text: 'As a non-EU student you cannot get the exemption. You need a student health insurance (for example Swisscare), bought online.',
        why: true,
        choices: [
          { id: 'buy', label: 'Buy the first one online now (about 95 CHF a month)', go: c => { c.days(1); c.spend(95 * (c.s.profile.stay === 'year' ? 12 : 6), 'Student health insurance'); return { end: 'done', mood: 'win', note: 'Done in ten minutes. The easiest procedure of the lot.' }; } },
          { id: 'compare', label: 'Compare a few options first', go: c => { c.days(3); c.spend(80 * (c.s.profile.stay === 'year' ? 12 : 6), 'Student health insurance'); return { end: 'done', mood: 'win', note: 'Compared and bought one for about 80 CHF a month. Insured, and cheaper.' }; } },
        ],
      },
      later: () => ({
        text: 'The exemption letter is still on your desk. The deadline is getting close.',
        choices: [{ id: 'post', label: 'Print it and post it now', go: c => { c.days(1); return { end: 'done', mood: 'win', note: 'Posted, just in time.' }; } }],
      }),
    },
  },
  {
    id: 'courses', area: 'study', place: 'campus', title: 'Build your study plan', mandatory: true,
    requires: ['accounts'],
    scenes: {
      start: c => c.s.flags.savedCreds === false && !c.s.flags.credsRecovered ? {
        text: 'You open the course portal. Username? It was shown only once...',
        mood: 'oops',
        choices: [{ id: 'it', label: c.s.steps.arrive?.status === 'done' ? 'Go to IT support in person' : 'Email IT support and wait', go: c => { c.problem('lost-credentials'); c.set('credsRecovered', true); c.days(c.s.steps.arrive?.status === 'done' ? 1 : 4); return 'pick'; } }],
      } : { redirect: 'pick' },
      pick: () => ({
        text: 'Pick the courses for your learning agreement (choose 3). Notes come from past exchange students.',
        tips: 'courses', keep: 'lastCourses',
        multi: [
          { id: 'daf', label: 'Data Analytics for Finance', hint: 'Tue 10:30, workload medium, "practical"' },
          { id: 'ie',  label: 'International Economics', hint: 'Wed 08:30, workload medium' },
          { id: 'fm',  label: 'Financial Markets', hint: 'Tue 10:30, workload high' },
          { id: 'dm',  label: 'Digital Marketing', hint: 'Thu 14:30, workload low' },
          { id: 'ml',  label: 'Advanced Machine Learning', hint: 'Mon 13:30, "check if open to exchange students"' },
        ],
        timetable: true,
        submit: (c, sel) => {
          c.set('lastCourses', sel);
          c.days(2);
          if (sel.length !== 3) return { error: 'Choose exactly 3 courses.' };
          const issues = [];
          if (sel.includes('daf') && sel.includes('fm')) issues.push('Data Analytics for Finance and Financial Markets are both on Tuesday at 10:30');
          if (sel.includes('ml')) issues.push('Advanced Machine Learning is not open to exchange students');
          if (issues.length) { c.problem('course-clash'); c.set('courseIssues', issues); return 'fix'; }
          c.set('courses', sel);
          return { end: 'done', mood: 'win', note: 'Study plan sent to your home university.' };
        },
      }),
      fix: c => ({
        text: `The faculty writes back: ${c.s.flags.courseIssues.join('; ')}. Change your plan.`,
        mood: 'oops',
        choices: [{ id: 'again', label: 'Change the plan', go: () => 'pick' }],
      }),
    },
  },
  {
    id: 'recognition', area: 'study', place: 'office', title: 'Get your courses recognised', mandatory: true,
    requires: ['courses'], waitSteps: 2,
    scenes: {
      start: () => ({
        text: 'Your home university must approve the learning agreement, so the credits count at home.',
        choices: [{ id: 'send', label: 'Send it to the home coordinator', go: c => { c.days(2); return { end: 'wait', mood: 'meh', note: 'Sent. Waiting for your home university.' }; } }],
      }),
      waiting: c => c.statusScene({
        rich: 'Waiting for your home coordinator. Usually 1 to 3 weeks. <b>Nothing to do for you now.</b> If a course is refused, the companion suggests a replacement.',
        bare: 'Learning agreement: in progress.',
        actions: [{ id: 'remind', label: 'Send a reminder email', reply: 'Auto-reply: "I am on holiday until next Monday."' }],
      }),
      ready: c => {
        if (c.flags('recoDecided') === undefined) { const dice = c.rng() < 0.45, force = !dice && c.s.problems.length === 0; c.set('recoDecided', dice || force ? 'refused' : 'ok'); c.set('recoCause', force ? 'forced' : 'random'); }
        return c.flags('recoDecided') === 'refused' ? {
          text: '📬 Your home coordinator refuses one course: it does not match your curriculum.',
          mood: 'oops',
          choices: [
            { id: 'swap', label: 'Swap it for the course past students suggest', go: c => { c.days(3); c.problem('recognition-refused', c.flags('recoCause')); return { end: 'done', mood: 'win', note: 'Swapped and approved.' }; } },
            { id: 'argue', label: 'Argue with the coordinator', go: c => { c.days(8); c.problem('recognition-refused', c.flags('recoCause')); return { end: 'done', mood: 'meh', note: 'After a week of emails, approved. Exhausting.' }; } },
          ],
        } : {
          text: '📬 Your home coordinator approves the whole learning agreement.',
          choices: [{ id: 'ok', label: 'Great', go: () => ({ end: 'done', mood: 'win', note: 'Credits will count at home.' }) }],
        };
      },
    },
  },
  {
    id: 'transport', area: 'everyday', place: 'busstop', title: 'Take the bus to campus', mandatory: true,
    requires: ['arrive'],
    scenes: {
      start: () => ({
        text: 'The ticket machine shows zones, ticket types and an Arcobaleno pass. Your first lecture is in 20 minutes.',
        tips: 'transport', why: true,
        choices: [
          { id: 'cheap', label: 'Buy the cheapest single ticket (2.30 CHF)', go: c => { c.spend(2, 'Single bus ticket'); c.cost(78, 'Surcharge for a partially valid ticket, plus the fare'); c.problem('fine'); c.days(1); return { end: 'done', mood: 'oops', note: 'Ticket check. Your ticket does not cover this zone, so it counts as partially valid: a surcharge plus the missing fare, about 80 CHF.' }; } },
          { id: 'ask', label: 'Check the companion: which zones do I need?', go: c => { c.spend(3, 'Bus ticket, right zones'); c.days(1); return { end: 'done', mood: 'win', note: 'Right ticket, on time for class.' }; } },
          { id: 'pass', label: 'Buy a monthly student pass (about 55 CHF)', go: c => { c.spend(55, 'Monthly student bus pass'); c.days(1); return { end: 'done', mood: 'win', note: 'Pass bought. No more machines this month.' }; } },
        ],
      }),
    },
  },
  {
    id: 'surprise', area: 'everyday', place: 'home2', title: 'A letter you did not expect', mandatory: true,
    requires: ['register'], when: s => !!s.flags.housing || s.steps.surprise?.status === 'done',
    scenes: {
      start: () => ({
        text: 'A bill arrives: 335 CHF a year for the radio and TV fee (Serafe). You don\'t even own a TV.',
        tips: 'surprise', why: true,
        choices: [
          { id: 'ignore', label: 'Ignore it, it must be a mistake', go: c => { serafe(c); c.cost(20, 'Serafe reminder fee'); c.problem('ignored-bill'); return { end: 'done', mood: 'oops', note: 'A reminder arrives with a fee. It was not a mistake: the fee is per household, TV or not.' }; } },
          { id: 'guide', label: 'Look it up in the companion\'s money guide', go: c => { const paid = serafe(c); return { end: 'done', mood: paid ? 'meh' : 'win', note: paid ? `It is per household, TV or not. ${c.s.flags.housing === 'lease' ? 'The flat is yours, so the bill is too.' : 'You split it with your flatmates.'}` : 'USI Home counts as a collective household: the residence pays, not you.' }; } },
        ],
      }),
    },
  },
  {
    id: 'social', area: 'everyday', place: 'lake', title: 'Meet other students', mandatory: false,
    requires: ['arrive'],
    scenes: {
      start: () => ({
        text: 'The student association organises a welcome aperitivo at the lakefront tonight.',
        choices: [
          { id: 'go', label: 'Go (about 15 CHF)', go: c => { c.spend(15, 'Aperitivo'); c.days(1); return 'met'; } },
          { id: 'skip', label: 'Skip, too tired', go: () => ({ end: 'done', mood: 'meh', note: 'Fair. There will be another one.' }) },
        ],
      }),
      met: () => ({
        text: 'You meet students from last year. One shows you their trip on the companion, step by step.',
        choices: [
          { id: 'trips', label: 'Look at their trips', go: c => { c.openTrips(); return { end: 'done', mood: 'win', note: 'New friends and inside knowledge.' }; } },
          { id: 'later', label: 'Maybe later', go: () => ({ end: 'done', mood: 'win', note: 'New friends, at least.' }) },
        ],
      }),
    },
  },
  {
    id: 'settled', area: 'everyday', place: 'viewpoint', title: 'Final stop: Monte Brè', mandatory: false, final: true,
    requires: ['permit', 'insurance', 'recognition', 'transport', 'surprise'],
    scenes: {
      start: c => {
        const left = c.left();
        return left.length ? {
          text: `Almost there. Before you go up, you still have:<ul class="plain">${left.map(st => `<li>${st.title}</li>`).join('')}</ul>Do them first, or finish your trip now?`,
          choices: [
            { id: 'back', label: 'Go back and do them', go: () => 'close' },
            { id: 'up', label: 'Go up anyway and finish my trip', go: () => 'top' },
          ],
        } : { redirect: 'top' };
      },
      top: () => ({
        text: 'From Monte Brè, Lugano looks small. So does the paperwork. Room, permit, courses, bus pass: all yours.',
        choices: [{ id: 'finish', label: 'Finish my trip', go: () => ({ end: 'done', mood: 'win', note: '' }) }],
      }),
    },
  },
];

// "Why did you choose that?" chips, shown after some choices (sampled).
export const WHY_CHIPS = ['It seemed the safest', 'It seemed the fastest', 'A tip or the companion suggested it', 'Just curious what happens', 'That is what I would really do'];

// Questionnaire. UEQ-S (Schrepp, Hinderks and Thomaschewski 2017): 8 items, 7-point
// semantic differential; first four pragmatic, last four hedonic.
export const UEQS = [
  ['obstructive', 'supportive'], ['complicated', 'easy'], ['inefficient', 'efficient'], ['confusing', 'clear'],
  ['boring', 'exciting'], ['not interesting', 'interesting'], ['conventional', 'inventive'], ['usual', 'leading edge'],
];

export const TAILORED = [
  { id: 'map_where', text: 'The map helped me understand where I was in the whole process.' },
  { id: 'next_step', text: 'I always knew what to do next.' },
  { id: 'buddy_pleasant', text: 'The companion made the experience more pleasant.' },
  { id: 'buddy_annoy', text: 'The companion\'s jokes sometimes got in the way.', onlyPlayful: true },
  { id: 'costs_clear', text: 'I got a realistic idea of how much an exchange costs.' },
  { id: 'trips_useful', text: 'Seeing other students\' trips is useful to prepare an exchange.' },
];
