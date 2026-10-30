/* ─────────────────────────────────────────────────────────────
   RadiantEdge Permanent Lighting Santa Ana — all editable content.
   Prices: `null` shows "Online quoting". Never add invented reviews,
   ratings, licenses or stats here.
   ───────────────────────────────────────────────────────────── */

export const BUSINESS = {
  name: 'RadiantEdge Permanent Lighting',
  shortName: 'RadiantEdge',
  city: 'Santa Ana',
  region: 'CA',
  phoneDisplay: '555-555-555',
  phoneHref: 'tel:555555555',
  // TODO: add the Google Business Profile review link once the profile is live.
  googleReviewUrl: '',
};

/* Plumbing — must stay unique per site (see the layout registry). */
export const SOURCE_TAG = 'radiantedge-santaana';
export const BOOKING_PREFIX = 'RE-';

/* Reservation deposit (USD). Applied to the final invoice. Must match DEPOSIT_CENTS in worker/worker.js. */
export const DEPOSIT = 149;

/* Install season (Pacific time, inclusive), every day Mon–Sun. */
export const SEASON = { start: { month: 10, day: 20 }, end: { month: 12, day: 20 } };
export const LEAD_HOURS = 48;

/* `id` is the exact value stored in the D1 `time` column (en dash). `start` = 24h start hour, Pacific. */
export const TIME_WINDOWS = [
  { id: '8AM–12PM', label: '8 AM – 12 PM', part: 'Morning', start: 8 },
  { id: '12PM–4PM', label: '12 PM – 4 PM', part: 'Afternoon', start: 12 },
];

/* TODO: confirm takedown timing with the crew. */
export const TAKEDOWN = 'the first two weeks of January';

/* Booking step 1. Permanent always shows "Online quoting". */
export const LIGHTING_TYPES = [
  {
    id: 'Permanent',
    name: 'Permanent',
    tagline: 'Installed once, lit year-round',
    blurb: 'A low-profile lighting channel along your roofline that stays up — no yearly install or takedown.',
  },
  {
    id: 'Seasonal',
    name: 'Seasonal',
    tagline: 'Christmas install, maintained & taken down',
    blurb: 'Leased commercial-grade LEDs for the holidays: we design, install, maintain and take them down.',
  },
];

/* Booking step 2. `price: null` → "Online quoting". `id` is stored in the D1 `service` column. */
export const PACKAGES = [
  {
    id: 'Front Only',
    code: 'FO',
    price: null, // TODO: starting price, e.g. 499
    coverage: 'front',
    summary: 'The roofline that faces the street.',
    features: {
      Seasonal: [
        'Professional design for the front of the home',
        'Commercial-grade LED lights (leased, no purchase needed)',
        'Roofline & gutter-line installation',
        'Timer setup',
        'In-season maintenance & bulb replacement',
        'Takedown after the holidays',
      ],
      Permanent: [
        'Professional design for the front of the home',
        'Low-profile channel along the front roofline',
        'Roofline & gutter-line installation',
        'Stays up year-round — no yearly takedown',
      ],
    },
  },
  {
    id: 'Front & Sides',
    code: 'FS',
    price: null, // TODO: starting price, e.g. 799
    coverage: 'front-sides',
    summary: 'Front plus the side edges for a full outline.',
    features: {
      Seasonal: ['Everything in Front Only', 'Side rooflines & gutters', 'Expanded custom design'],
      Permanent: ['Everything in Front Only', 'Side rooflines & gutters', 'Expanded custom design'],
    },
  },
];

/* Booking step 3. `percent` = % of the package price. `seasonalOnly` hides it for Permanent. */
export const TWO_STORY_PERCENT = 50;
export const ADDONS = [
  { id: 'tree-wrap', name: 'Tree & bush wrapping', short: 'Tree wrap', price: null, icon: 'tree' },
  { id: 'wreaths', name: 'Wreaths / garland', short: 'Wreaths', price: null, icon: 'wreath' },
  { id: 'pathway', name: 'Pathway / stake lights', short: 'Pathway lights', price: null, icon: 'path' },
  { id: 'own-lights', name: 'Install customer-owned lights', short: 'Own lights', price: null, icon: 'bulb' },
  { id: 'storage', name: 'Off-season storage', short: 'Storage', price: null, icon: 'box', seasonalOnly: true },
];

/* TODO: confirm the service-area list. Santa Ana is home base. */
export const CITIES = [
  'Santa Ana', 'Tustin', 'Orange', 'Irvine', 'Costa Mesa', 'Garden Grove',
  'Fountain Valley', 'Westminster', 'Anaheim', 'Newport Beach', 'Huntington Beach', 'North Tustin',
];

/* Real reviews only — never invent. Leave empty until real ones exist.
   Shape: { name: 'Jane D.', city: 'Santa Ana', text: '…', rating: 5 }
   TODO: paste real Google reviews here. */
export const REVIEWS = [];

/* Gallery — illustrated design previews until real install photos exist.
   TODO: replace with photos of your own installs (public/images/gallery/…, set `photo`). */
export const GALLERY = [
  { id: 'g1', title: 'Warm white edge', note: 'Single-story · Front Only', photo: '', scene: { color: 'warm', variant: 'a', coverage: 'front', stories: 1 } },
  { id: 'g2', title: 'Sunburst gold', note: 'Two-story · Front & Sides', photo: '', scene: { color: 'gold', variant: 'b', coverage: 'front-sides', stories: 2 } },
  { id: 'g3', title: 'Emerald & gold', note: 'Permanent · game-day scene', photo: '', scene: { color: 'emerald', variant: 'c', coverage: 'front-sides', stories: 1 } },
  { id: 'g4', title: 'Classic multicolor', note: 'Front & Sides · tree wrap', photo: '', scene: { color: 'multi', variant: 'a', coverage: 'front-sides', stories: 1, addons: ['tree-wrap'] } },
  { id: 'g5', title: 'Red & white', note: 'Two-story · wreaths', photo: '', scene: { color: 'candy', variant: 'b', coverage: 'front', stories: 2, addons: ['wreaths'] } },
  { id: 'g6', title: 'Cool white', note: 'Front Only · pathway lights', photo: '', scene: { color: 'cool', variant: 'c', coverage: 'front', stories: 1, addons: ['pathway'] } },
];

export const STEPS = [
  { id: 'book', title: 'Book', text: 'Pick your package, add-ons, install date and time window online — about two minutes.' },
  { id: 'design', title: 'Design', text: 'We lay out the roofline, colors and add-ons for your home and confirm the final price at the on-site visit.' },
  { id: 'install', title: 'Install', text: 'Our crew installs on your date, sets the timer and tests every run before we leave.' },
  { id: 'takedown', title: 'Takedown', text: `Seasonal lights come down in ${TAKEDOWN}. Permanent lighting simply stays up.` },
];

export const FAQ = [
  {
    q: 'Do I need outdoor outlets?',
    a: 'One working exterior outlet near the roofline run is usually enough. We check outlets and power at the on-site visit and plan the runs so nothing overloads a circuit. If you don’t have an outlet where we need one, we’ll tell you before install day.',
  },
  {
    q: 'Do I lease the lights or own them?',
    a: 'Seasonal installs use commercial-grade LEDs leased to you for the season — nothing to buy, store or untangle. Permanent lighting is mounted on your home and stays up year-round; we go over the system details with your online quote. Already have lights? We can install customer-owned lights as an add-on.',
  },
  {
    q: 'How do the timers work?',
    a: 'Seasonal installs include timer setup, so your lights switch on in the evening and off at the time you choose. We set it on install day and can change it during the season.',
  },
  {
    q: 'What if it rains or the weather turns?',
    a: 'If wind or rain makes the roof unsafe on your install date, we’ll call you to move it to the next open window. In-season maintenance on Seasonal installs covers any bulb or run that goes out.',
  },
  {
    q: 'When do the lights come down?',
    a: `Seasonal takedown happens after the holidays, in ${TAKEDOWN}. We’ll contact you to schedule it. Permanent lighting stays up — no takedown needed.`,
  },
  {
    q: 'Permanent or seasonal — which is right for me?',
    a: 'Seasonal is a full-service Christmas install that comes down in January. Permanent is installed once and stays on the roofline for every holiday and season after. Both start with Front Only or Front & Sides coverage.',
  },
  {
    q: `What is the $${DEPOSIT} deposit?`,
    a: 'It reserves your install date and is applied to your final invoice. Prefer not to pay online? Choose “I’ll pay at the visit” at checkout.',
  },
];
