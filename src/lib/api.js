const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

export const apiConfigured = () => Boolean(BASE) && !BASE.includes('REPLACE_ME');

async function req(path, opts = {}) {
  if (!apiConfigured()) throw new Error('Booking API is not configured yet.');
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* { full: ['2026-11-03', …] } — dates with no window left. */
export const getFullDates = (from, to) => req(`/api/availability?from=${from}&to=${to}`);
/* { unavailable: ['8AM–12PM'] } */
export const getDay = (date) => req(`/api/availability?date=${date}`);
export const createPaymentIntent = (ref) => req('/api/create-payment-intent', { method: 'POST', body: JSON.stringify({ ref }) });
export const createBooking = (body) => req('/api/bookings', { method: 'POST', body: JSON.stringify(body) });
