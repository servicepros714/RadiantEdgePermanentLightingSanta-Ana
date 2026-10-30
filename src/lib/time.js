import { SEASON, LEAD_HOURS, TIME_WINDOWS } from '../config/site.js';

const TZ = 'America/Los_Angeles';
const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

function partsAt(ts) {
  const o = {};
  for (const p of fmt.formatToParts(new Date(ts))) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}

/* UTC ms for a wall-clock time in California. */
export function laToUtc(y, m, d, h = 0) {
  const guess = Date.UTC(y, m - 1, d, h);
  const p = partsAt(guess);
  const offset = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - guess;
  let ts = guess - offset;
  const p2 = partsAt(ts);
  const offset2 = Date.UTC(p2.y, p2.m - 1, p2.d, p2.h, p2.mi, p2.s) - ts;
  if (offset2 !== offset) ts = guess - offset2;
  return ts;
}

export const pad = (n) => String(n).padStart(2, '0');
export const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
export const parseIso = (s) => { const [y, m, d] = s.split('-').map(Number); return { y, m, d }; };

export function laToday() {
  const p = partsAt(Date.now());
  return { y: p.y, m: p.m, d: p.d };
}

/* The season currently open for booking (rolls to next year after Dec 20). */
export function seasonRange() {
  const t = laToday();
  const endThis = iso(t.y, SEASON.end.month, SEASON.end.day);
  const y = iso(t.y, t.m, t.d) > endThis ? t.y + 1 : t.y;
  return { year: y, start: iso(y, SEASON.start.month, SEASON.start.day), end: iso(y, SEASON.end.month, SEASON.end.day) };
}

export function inSeason(date) {
  const { start, end } = seasonRange();
  return date >= start && date <= end;
}

export function windowOpen(date, win, now = Date.now()) {
  const { y, m, d } = parseIso(date);
  return laToUtc(y, m, d, win.start) >= now + LEAD_HOURS * 3600 * 1000;
}

export function dateHasOpenWindow(date) {
  return TIME_WINDOWS.some((w) => windowOpen(date, w));
}

/* All season dates as ISO strings. */
export function seasonDates() {
  const { start, end } = seasonRange();
  const out = [];
  const s = parseIso(start);
  let t = Date.UTC(s.y, s.m - 1, s.d);
  for (;;) {
    const dt = new Date(t);
    const v = iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    if (v > end) break;
    out.push(v);
    t += 86400000;
  }
  return out;
}

export function weekdayOf(date) {
  const { y, m, d } = parseIso(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const longFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
const shortFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const monFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const toUtcDate = (date) => { const { y, m, d } = parseIso(date); return new Date(Date.UTC(y, m - 1, d)); };
export const longDate = (date) => longFmt.format(toUtcDate(date));
export const shortDate = (date) => shortFmt.format(toUtcDate(date));
export const monthDay = (date) => monFmt.format(toUtcDate(date));

export function windowLabel(id) {
  const w = TIME_WINDOWS.find((x) => x.id === id);
  return w ? w.label : id;
}
