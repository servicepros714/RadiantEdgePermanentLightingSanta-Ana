/**
 * RadiantEdge Permanent Lighting Santa Ana — booking API
 * Worker name: radiantedge-santaana-api   ·   source tag: radiantedge-santaana   ·   ID prefix: RE-
 *
 * Bindings (set in the Cloudflare dashboard):
 *   DB                 D1 database (shared bookings table)
 *   STRIPE_SECRET_KEY  secret
 *   ADMIN_TOKEN        secret, optional — GET/PATCH /api/bookings stay closed until it is set
 *   ALLOWED_ORIGIN     variable, optional — defaults to "*"
 *
 * Paste this whole file into the dashboard editor (Workers & Pages → the Worker → Edit code) and Deploy.
 */

const SOURCE = 'radiantedge-santaana';
const PREFIX = 'RE-';
const DEPOSIT_CENTS = 14900; // $149 — must match DEPOSIT in src/config/site.js
const LEAD_HOURS = 48;
const SEASON = { start: [10, 20], end: [12, 20] }; // month, day — Pacific time, inclusive
const WINDOWS = [
  { id: '8AM–12PM', start: 8 },
  { id: '12PM–4PM', start: 12 },
];
const TYPES = ['Permanent', 'Seasonal'];
const PACKAGES = ['Front Only', 'Front & Sides'];
const PATCHABLE = ['status', 'reschedule_date', 'reschedule_time', 'notes2', 'original_date', 'original_time', 'payment_status', 'date', 'time'];

// A booking holds its rescheduled slot when one is set; cancelled bookings free their slot.
const ACTIVE = "COALESCE(status, '') <> 'Cancelled'";
const SLOT_DATE = "COALESCE(NULLIF(reschedule_date, ''), date)";
const SLOT_TIME = "COALESCE(NULLIF(reschedule_time, ''), time)";

/* ── Schema (memoized; one single-line statement per prepare().run(), never exec()) ── */
const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, date TEXT, time TEXT, service TEXT, name TEXT, phone TEXT, email TEXT, vehicle TEXT, address TEXT, notes TEXT, source TEXT, created_at TEXT, status TEXT, reschedule_date TEXT, reschedule_time TEXT, notes2 TEXT, original_date TEXT, original_time TEXT, payment_status TEXT)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date)',
];
let schemaPromise = null;
function ensureSchema(env) {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const sql of SCHEMA) await env.DB.prepare(sql).run();
    })().catch((e) => {
      console.error('ensureSchema failed', e && e.message);
      schemaPromise = null; // retry on the next request; never throws to the caller
    });
  }
  return schemaPromise;
}

/* ── Helpers ── */
function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
function json(data, status, cors) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors } });
}
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const pad = (n) => String(n).padStart(2, '0');

const laFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
function laParts(ts) {
  const o = {};
  for (const p of laFmt.formatToParts(new Date(ts))) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
function laToUtc(y, m, d, h) {
  const guess = Date.UTC(y, m - 1, d, h);
  const off = (ts) => { const p = laParts(ts); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - ts; };
  let ts = guess - off(guess);
  const o2 = off(ts);
  if (guess - o2 !== ts) ts = guess - o2;
  return ts;
}
function seasonYear() {
  const t = laParts(Date.now());
  const today = `${t.y}-${pad(t.m)}-${pad(t.d)}`;
  const endThis = `${t.y}-${pad(SEASON.end[0])}-${pad(SEASON.end[1])}`;
  return today > endThis ? t.y + 1 : t.y;
}
function seasonBounds() {
  const y = seasonYear();
  return { start: `${y}-${pad(SEASON.start[0])}-${pad(SEASON.start[1])}`, end: `${y}-${pad(SEASON.end[0])}-${pad(SEASON.end[1])}` };
}
function inSeason(date) {
  const { start, end } = seasonBounds();
  return date >= start && date <= end;
}
function windowOpen(date, win) {
  if (!win) return false;
  const [y, m, d] = date.split('-').map(Number);
  return laToUtc(y, m, d, win.start) >= Date.now() + LEAD_HOURS * 3600 * 1000;
}
function newId() {
  const t = laParts(Date.now());
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = crypto.getRandomValues(new Uint8Array(4));
  let s = '';
  for (const b of rnd) s += chars[b % chars.length];
  return `${PREFIX}${String(t.y).slice(2)}${pad(t.m)}${pad(t.d)}-${s}`;
}

async function stripe(env, method, path, form) {
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  let body;
  if (form) {
    const { __idem, ...fields } = form;
    if (__idem) headers['Idempotency-Key'] = __idem;
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(fields).toString();
  }
  const res = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers, body });
  const data = await res.json();
  if (!res.ok) throw new Error((data && data.error && data.error.message) || `Stripe ${res.status}`);
  return data;
}

/* ── Routes ── */
async function availability(url, env, cors) {
  const date = url.searchParams.get('date');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  if (date) {
    if (!isIsoDate(date)) return json({ error: 'Bad date.' }, 400, cors);
    const closed = WINDOWS.filter((w) => !inSeason(date) || !windowOpen(date, w)).map((w) => w.id);
    let taken = [];
    try {
      await ensureSchema(env);
      const r = await env.DB.prepare(`SELECT ${SLOT_TIME} AS t FROM bookings WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} = ?`).bind(SOURCE, date).all();
      taken = (r.results || []).map((x) => x.t);
    } catch (e) { console.error('availability(date)', e && e.message); }
    return json({ date, unavailable: [...new Set([...closed, ...taken])] }, 200, cors);
  }

  if (from && to && isIsoDate(from) && isIsoDate(to)) {
    let rows = [];
    try {
      await ensureSchema(env);
      const r = await env.DB.prepare(
        `SELECT ${SLOT_DATE} AS d, ${SLOT_TIME} AS t FROM bookings WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} >= ? AND ${SLOT_DATE} <= ?`,
      ).bind(SOURCE, from, to).all();
      rows = r.results || [];
    } catch (e) { console.error('availability(range)', e && e.message); }
    const byDate = {};
    for (const row of rows) (byDate[row.d] = byDate[row.d] || new Set()).add(row.t);
    const full = [];
    for (const [d, set] of Object.entries(byDate)) {
      const openLeft = WINDOWS.some((w) => !set.has(w.id) && windowOpen(d, w));
      if (!openLeft) full.push(d);
    }
    return json({ from, to, full: full.sort() }, 200, cors);
  }
  return json({ error: 'Pass ?date=YYYY-MM-DD or ?from=&to=' }, 400, cors);
}

// Never touches D1 — a database problem can't block a payment.
async function createPaymentIntent(request, env, cors) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured.' }, 503, cors);
  let b = {};
  try { b = await request.json(); } catch { /* empty */ }
  const ref = clip(b.ref, 60).replace(/[^A-Za-z0-9-]/g, '');
  const form = {
    amount: String(DEPOSIT_CENTS),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: 'RadiantEdge reservation deposit (applied to final invoice)',
    'metadata[source]': SOURCE,
    'metadata[ref]': ref,
  };
  if (ref) form.__idem = `${SOURCE}-pi-${ref}`;
  try {
    const pi = await stripe(env, 'POST', 'payment_intents', form);
    return json({ clientSecret: pi.client_secret, id: pi.id }, 200, cors);
  } catch (e) {
    return json({ error: 'Could not start the payment. Please try again.' }, 502, cors);
  }
}

async function createBooking(request, env, cors) {
  let b;
  try { b = await request.json(); } catch { return json({ error: 'Bad request.' }, 400, cors); }

  const wantsPaid = b.payment === 'paid';
  const piId = clip(b.piId, 80);
  const ref = clip(b.ref, 60).replace(/[^A-Za-z0-9-]/g, '');
  const type = clip(b.type, 20);
  const service = clip(b.service, 40);
  const date = clip(b.date, 10);
  const time = clip(b.time, 20);
  const name = clip(b.name, 120).trim();
  const phone = clip(b.phone, 30).replace(/\D/g, '');
  const email = clip(b.email, 160).trim();
  const address = clip(b.address, 240).trim();

  if (!TYPES.includes(type)) return json({ error: 'Choose a lighting type.' }, 400, cors);
  if (!PACKAGES.includes(service)) return json({ error: 'Choose a package.' }, 400, cors);
  if (!isIsoDate(date) || !inSeason(date)) return json({ error: 'Pick an install date inside the season.' }, 400, cors);
  if (!WINDOWS.some((w) => w.id === time)) return json({ error: 'Pick a time window.' }, 400, cors);
  if (!name) return json({ error: 'Enter your full name.' }, 400, cors);
  if (phone.length !== 10) return json({ error: 'Enter a 10-digit phone number.' }, 400, cors);
  if (!validEmail(email)) return json({ error: 'Enter a valid email address.' }, 400, cors);
  if (address.length < 6) return json({ error: 'Enter the service address.' }, 400, cors);
  if (wantsPaid && !/^pi_[A-Za-z0-9]+$/.test(piId)) return json({ error: 'Missing payment reference.' }, 400, cors);

  // Verify the deposit with Stripe before saving "Paid".
  if (wantsPaid) {
    if (!env.STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured.' }, 503, cors);
    let pi;
    try { pi = await stripe(env, 'GET', `payment_intents/${encodeURIComponent(piId)}`); } catch {
      return json({ error: 'We couldn’t verify your payment. Please call us.' }, 502, cors);
    }
    const okStatus = ['succeeded', 'processing', 'requires_capture'].includes(pi.status);
    const okAmount = Number(pi.amount) === DEPOSIT_CENTS && pi.currency === 'usd';
    const okSource = !pi.metadata || !pi.metadata.source || pi.metadata.source === SOURCE;
    if (!okStatus || !okAmount || !okSource) return json({ error: 'Payment not completed.' }, 402, cors);
  }

  await ensureSchema(env);

  // Idempotency: the same PaymentIntent or draft ref never creates two rows.
  const dupe = await env.DB.prepare(
    "SELECT id FROM bookings WHERE source = ? AND ((? <> '' AND notes LIKE ?) OR (? <> '' AND notes LIKE ?)) LIMIT 1",
  ).bind(SOURCE, piId, `%PI: ${piId}%`, ref, `%Ref: ${ref}%`).first();
  if (dupe && dupe.id) return json({ ok: true, id: dupe.id, duplicate: true }, 200, cors);

  const vehicleRaw = clip(b.vehicle, 200).trim();
  const vehicle = vehicleRaw.startsWith(type) ? vehicleRaw : [type, vehicleRaw].filter(Boolean).join(' · ');
  const addons = Array.isArray(b.addons) ? b.addons.map((a) => clip(a, 60)).filter(Boolean) : [];
  const estimate = clip(b.estimate, 60) || 'Online quoting';
  const lateOrClosed = !windowOpen(date, WINDOWS.find((w) => w.id === time));
  if (lateOrClosed && !wantsPaid) return json({ error: 'That window is no longer available. Please pick another.' }, 409, cors);

  const id = newId();
  const createdAt = new Date().toISOString();
  const paymentStatus = wantsPaid ? 'Paid' : 'Pay Later';
  const baseNotes = [
    `Type: ${type}`,
    `Add-ons: ${addons.length ? addons.join(', ') : 'None'}`,
    `Estimate: ${estimate}`,
    wantsPaid ? `Deposit: $${DEPOSIT_CENTS / 100} paid` : 'Deposit: pay at visit',
    piId ? `PI: ${piId}` : '',
    ref ? `Ref: ${ref}` : '',
  ].filter(Boolean);
  const cols = 'id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status';
  const values = (notes) => [id, date, time, service, name, phone, email, vehicle, address, notes, SOURCE, createdAt, 'Booked', null, null, null, null, null, paymentStatus];

  // Atomic insert only if the slot is still free.
  const guarded = await env.DB.prepare(
    `INSERT INTO bookings (${cols}) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} = ? AND ${SLOT_TIME} = ?)`,
  ).bind(...values(baseNotes.join(' | ')), SOURCE, date, time).run();
  const inserted = guarded && guarded.meta ? guarded.meta.changes > 0 : false;
  if (inserted && !lateOrClosed) return json({ ok: true, id, conflict: false }, 200, cors);

  if (!wantsPaid) return json({ error: 'That time window was just booked. Please pick another.' }, 409, cors);

  // A paid booking is never lost: save it and flag it for a call.
  const flag = lateOrClosed ? 'SLOT CONFLICT — window inside lead time, call to confirm' : 'SLOT CONFLICT — window already booked, call to confirm';
  if (inserted) {
    await env.DB.prepare('UPDATE bookings SET notes = ? WHERE id = ?').bind([...baseNotes, flag].join(' | '), id).run();
  } else {
    await env.DB.prepare(`INSERT INTO bookings (${cols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...values([...baseNotes, flag].join(' | '))).run();
  }
  return json({ ok: true, id, conflict: true }, 200, cors);
}

function adminDenied(request, env, cors) {
  if (!env.ADMIN_TOKEN) return json({ error: 'Admin routes are disabled. Set the ADMIN_TOKEN secret to enable them.' }, 403, cors);
  const auth = request.headers.get('Authorization') || '';
  if (auth !== `Bearer ${env.ADMIN_TOKEN}`) return json({ error: 'Unauthorized' }, 401, cors);
  return null;
}

async function listBookings(request, url, env, cors) {
  const denied = adminDenied(request, env, cors);
  if (denied) return denied;
  await ensureSchema(env);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  let sql = 'SELECT * FROM bookings WHERE source = ?';
  const args = [SOURCE];
  if (from && isIsoDate(from)) { sql += ' AND date >= ?'; args.push(from); }
  if (to && isIsoDate(to)) { sql += ' AND date <= ?'; args.push(to); }
  sql += ' ORDER BY date ASC, time ASC';
  const r = await env.DB.prepare(sql).bind(...args).all();
  return json({ bookings: r.results || [] }, 200, cors);
}

async function patchBooking(request, id, env, cors) {
  const denied = adminDenied(request, env, cors);
  if (denied) return denied;
  let b;
  try { b = await request.json(); } catch { return json({ error: 'Bad request.' }, 400, cors); }
  const sets = [];
  const args = [];
  for (const k of PATCHABLE) {
    if (Object.prototype.hasOwnProperty.call(b, k)) {
      if (k === 'payment_status' && b[k] !== null && !['Paid', 'Pay Later'].includes(b[k])) return json({ error: "payment_status must be 'Paid' or 'Pay Later'." }, 400, cors);
      sets.push(`${k} = ?`);
      args.push(b[k] === null ? null : clip(b[k], 2000));
    }
  }
  if (!sets.length) return json({ error: `Nothing to update. Patchable: ${PATCHABLE.join(', ')}` }, 400, cors);
  await ensureSchema(env);
  const r = await env.DB.prepare(`UPDATE bookings SET ${sets.join(', ')} WHERE id = ? AND source = ?`).bind(...args, id, SOURCE).run();
  if (!r.meta || !r.meta.changes) return json({ error: 'Not found.' }, 404, cors);
  const row = await env.DB.prepare('SELECT * FROM bookings WHERE id = ? AND source = ?').bind(id, SOURCE).first();
  return json({ ok: true, booking: row }, 200, cors);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api/availability' && request.method === 'GET') return await availability(url, env, cors);
      if (path === '/api/create-payment-intent' && request.method === 'POST') return await createPaymentIntent(request, env, cors);
      if (path === '/api/bookings' && request.method === 'POST') return await createBooking(request, env, cors);
      if (path === '/api/bookings' && request.method === 'GET') return await listBookings(request, url, env, cors);
      const m = path.match(/^\/api\/bookings\/([A-Za-z0-9-]+)$/);
      if (m && request.method === 'PATCH') return await patchBooking(request, m[1], env, cors);
      if (path === '' || path === '/api' || path === '/api/health') return json({ ok: true, source: SOURCE }, 200, cors);
      return json({ error: 'Not found.' }, 404, cors);
    } catch (e) {
      console.error('Unhandled', e && e.stack);
      return json({ error: 'Something went wrong. Please call us.' }, 500, cors);
    }
  },
};
