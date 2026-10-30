import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIGHTING_TYPES, PACKAGES, TIME_WINDOWS, TWO_STORY_PERCENT, DEPOSIT } from '../config/site.js';
import { useDraft } from '../lib/draft.jsx';
import { estimate, priceLabel, addonPriceLabel, visibleAddons, addonNames } from '../lib/pricing.js';
import { seasonRange, seasonDates, dateHasOpenWindow, windowOpen, parseIso, longDate, shortDate, laToday, iso, windowLabel } from '../lib/time.js';
import { getFullDates, getDay, apiConfigured } from '../lib/api.js';
import HouseScene, { PlanDiagram } from '../components/HouseScene.jsx';
import { ADDON_ICONS, Arrow, Back, Check, ChevronL, ChevronR, Chevron } from '../components/Icons.jsx';

const STEPS = [
  { key: 'type', label: 'Type', title: 'Permanent or seasonal?', sub: 'Permanent stays up year-round. Seasonal goes up for the holidays and comes down after.' },
  { key: 'pkg', label: 'Package', title: 'Which rooflines should we light?', sub: 'Pick your coverage. Prices are “starting at” — final price is confirmed at the on-site visit.' },
  { key: 'home', label: 'Home', title: 'Tell us about your home', sub: 'Choose the height of the home, then any add-ons you’d like.' },
  { key: 'date', label: 'Date', title: 'Pick your install date', sub: 'Installs run every day of the season, Pacific time.' },
  { key: 'time', label: 'Time', title: 'Choose a time window', sub: 'Our crew arrives within the window you pick.' },
  { key: 'info', label: 'Info', title: 'Where are we installing?', sub: 'We’ll use these details to confirm your install.' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const digits = (s) => String(s || '').replace(/\D/g, '');
function fmtPhone(v) {
  const d = digits(v).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());

function validate(step, d) {
  switch (STEPS[step].key) {
    case 'type': return d.type ? null : { msg: 'Choose a lighting type — Permanent or Seasonal.', focus: 'type-0' };
    case 'pkg': return d.pkg ? null : { msg: 'Choose a package — Front Only or Front & Sides.', focus: 'pkg-0' };
    case 'home': return d.stories ? null : { msg: 'Choose your home height — 1-Story or 2-Story.', focus: 'stories-1' };
    case 'date': return d.date ? null : { msg: 'Pick an install date.', focus: 'calendar' };
    case 'time': return d.time ? null : { msg: 'Pick a time window.', focus: 'window' };
    case 'info':
      if (!d.name.trim()) return { msg: 'Enter your full name.', focus: 'f-name' };
      if (digits(d.phone).length !== 10) return { msg: 'Enter a 10-digit phone number.', focus: 'f-phone' };
      if (!validEmail(d.email)) return { msg: 'Enter a valid email address.', focus: 'f-email' };
      if (d.address.trim().length < 6) return { msg: 'Enter the service address.', focus: 'f-address' };
      return null;
    default: return null;
  }
}

function focusTarget(id) {
  requestAnimationFrame(() => {
    let el = document.getElementById(id);
    if (id === 'calendar') el = document.querySelector('.cal__day:not(:disabled)') || document.querySelector('.cal');
    if (id === 'window') el = document.querySelector('.win input:not(:disabled)');
    if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  });
}

/* ── Step bodies ─────────────────────────────────────── */

function Choice({ id, name, type = 'radio', checked, onChange, disabled, children, className = '' }) {
  return (
    <label className={`choice${checked ? ' is-on' : ''}${disabled ? ' is-off' : ''} ${className}`} htmlFor={id}>
      <input id={id} type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="choice__input" />
      <span className={`choice__box choice__box--${type}`} aria-hidden="true"><Check width={14} height={14} /></span>
      <span className="choice__body">{children}</span>
    </label>
  );
}

function StepType({ d, update }) {
  return (
    <fieldset className="choices">
      <legend className="sr-only">Lighting type</legend>
      {LIGHTING_TYPES.map((t, i) => (
        <Choice key={t.id} id={`type-${i}`} name="type" checked={d.type === t.id}
          onChange={() => update((x) => ({ type: t.id, addons: t.id === 'Permanent' ? x.addons.filter((a) => a !== 'storage') : x.addons }))}>
          <span className="choice__title">{t.name}</span>
          <span className="choice__tag">{t.tagline}</span>
          <span className="choice__text">{t.blurb}</span>
        </Choice>
      ))}
    </fieldset>
  );
}

function StepPkg({ d, update }) {
  const type = d.type || 'Seasonal';
  return (
    <fieldset className="choices">
      <legend className="sr-only">Package</legend>
      {PACKAGES.map((p, i) => (
        <Choice key={p.id} id={`pkg-${i}`} name="pkg" checked={d.pkg === p.id} onChange={() => update({ pkg: p.id })} className="choice--pkg">
          <span className="choice__split">
            <span>
              <span className="choice__title">{p.id}</span>
              <span className="choice__tag">{type === 'Permanent' ? 'Online quoting' : priceLabel(p.price)}</span>
              <span className="choice__text">{p.summary}</span>
            </span>
            <PlanDiagram coverage={p.coverage} className="choice__plan" />
          </span>
          <ul className="choice__feats">
            {p.features[type].map((f) => <li key={f}>{f}</li>)}
          </ul>
        </Choice>
      ))}
    </fieldset>
  );
}

function StepHome({ d, update }) {
  const addons = visibleAddons(d.type);
  return (
    <>
      <fieldset className="choices choices--two">
        <legend className="field-legend">Home height</legend>
        {[1, 2].map((n) => (
          <Choice key={n} id={`stories-${n}`} name="stories" checked={d.stories === n} onChange={() => update({ stories: n })}>
            <span className="choice__title">{n}-Story</span>
            <span className="choice__tag">{n === 1 ? 'Included' : `+${TWO_STORY_PERCENT}% of package price`}</span>
          </Choice>
        ))}
      </fieldset>
      <fieldset className="choices choices--addons">
        <legend className="field-legend">Add-ons <span>(optional)</span></legend>
        {addons.map((a) => {
          const Icon = ADDON_ICONS[a.icon];
          const on = d.addons.includes(a.id);
          return (
            <Choice key={a.id} id={`addon-${a.id}`} type="checkbox" name="addons" checked={on}
              onChange={() => update((x) => ({ addons: on ? x.addons.filter((y) => y !== a.id) : [...x.addons, a.id] }))}>
              <span className="choice__row">
                <span className="choice__icon" aria-hidden="true"><Icon width={20} height={20} /></span>
                <span className="choice__title">{a.name}</span>
                <span className="choice__price">{addonPriceLabel(a)}</span>
              </span>
            </Choice>
          );
        })}
      </fieldset>
    </>
  );
}

function StepDate({ d, update, full }) {
  const { start, end } = seasonRange();
  const t = laToday();
  const today = iso(t.y, t.m, t.d);
  const months = useMemo(() => {
    const set = [];
    seasonDates().forEach((x) => { const k = x.slice(0, 7); if (!set.includes(k)) set.push(k); });
    return set.filter((k) => `${k}-31` >= today);
  }, [today]);
  const initial = d.date ? d.date.slice(0, 7) : months.find((m) => seasonDates().some((x) => x.startsWith(m) && dateHasOpenWindow(x) && !full.has(x))) || months[0];
  const [month, setMonth] = useState(initial);
  const mi = Math.max(0, months.indexOf(month));
  const { y, m } = parseIso(`${month}-01`);
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const nDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let dd = 1; dd <= nDays; dd++) cells.push(iso(y, m, dd));

  return (
    <div className="cal" tabIndex={-1} id="calendar" aria-label="Install date">
      <div className="cal__head">
        <button type="button" className="cal__nav" onClick={() => setMonth(months[mi - 1])} disabled={mi === 0} aria-label="Previous month"><ChevronL /></button>
        <p className="cal__month" aria-live="polite">{MONTHS[m - 1]} {y}</p>
        <button type="button" className="cal__nav" onClick={() => setMonth(months[mi + 1])} disabled={mi >= months.length - 1} aria-label="Next month"><ChevronR /></button>
      </div>
      <div className="cal__dow" aria-hidden="true">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x, i) => <span key={i}>{x}</span>)}</div>
      <div className="cal__grid" role="group" aria-label={`${MONTHS[m - 1]} ${y}`}>
        {cells.map((c, i) => {
          if (!c) return <span key={`b${i}`} />;
          const inS = c >= start && c <= end;
          const isFull = full.has(c);
          const ok = inS && dateHasOpenWindow(c) && !isFull;
          const sel = d.date === c;
          return (
            <button key={c} type="button" className={`cal__day${sel ? ' is-sel' : ''}${isFull && inS && dateHasOpenWindow(c) ? ' is-full' : ''}${c === today ? ' is-today' : ''}`}
              disabled={!ok} aria-pressed={sel} aria-label={`${longDate(c)}${!ok ? (isFull ? ', full' : ', unavailable') : ''}`}
              onClick={() => update({ date: c, time: d.date === c ? d.time : '' })}>
              {Number(c.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="cal__key"><span className="cal__key-sel" /> Selected <span className="cal__key-full" /> Full <span className="cal__key-off" /> Unavailable</p>
    </div>
  );
}

function StepTime({ d, update }) {
  const [taken, setTaken] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!apiConfigured()) { setTaken([]); return undefined; }
    let off = false;
    setTaken(null);
    getDay(d.date).then((r) => { if (!off) setTaken(r.unavailable || []); })
      .catch(() => { if (!off) { setTaken([]); setErr('Live availability couldn’t load — we’ll double-check your window when you book.'); } });
    return () => { off = true; };
  }, [d.date]);

  useEffect(() => {
    if (taken && d.time && (taken.includes(d.time) || !windowOpen(d.date, TIME_WINDOWS.find((w) => w.id === d.time)))) update({ time: '' });
  }, [taken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <fieldset className="wins">
      <legend className="field-legend">{longDate(d.date)}</legend>
      {taken === null && <p className="note">Checking open windows…</p>}
      {TIME_WINDOWS.map((w, i) => {
        const ok = taken !== null && !taken.includes(w.id) && windowOpen(d.date, w);
        return (
          <label key={w.id} className={`win${d.time === w.id ? ' is-on' : ''}${!ok ? ' is-off' : ''}`} htmlFor={`win-${i}`}>
            <input id={`win-${i}`} type="radio" name="time" checked={d.time === w.id} disabled={!ok} onChange={() => update({ time: w.id })} className="choice__input" />
            <span className="choice__box choice__box--radio" aria-hidden="true"><Check width={14} height={14} /></span>
            <span className="win__part">{w.part}</span>
            <span className="win__label">{w.label}</span>
            <span className="win__state">{taken === null ? '…' : ok ? 'Open' : 'Unavailable'}</span>
          </label>
        );
      })}
      {err && <p className="note">{err}</p>}
    </fieldset>
  );
}

function Field({ id, label, error, ...rest }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      <input id={id} className="field__input" aria-invalid={error ? 'true' : undefined} {...rest} />
    </div>
  );
}

function StepInfo({ d, update, errField }) {
  return (
    <div className="fields">
      <Field id="f-name" label="Full Name" autoComplete="name" value={d.name} error={errField === 'f-name'}
        onChange={(e) => update({ name: e.target.value })} />
      <Field id="f-phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} error={errField === 'f-phone'}
        onChange={(e) => update({ phone: fmtPhone(e.target.value) })} placeholder="(714) 555-0123" />
      <Field id="f-email" label="Email" type="email" autoComplete="email" value={d.email} error={errField === 'f-email'}
        onChange={(e) => update({ email: e.target.value })} />
      <Field id="f-address" label="Service Address" autoComplete="street-address" value={d.address} error={errField === 'f-address'}
        onChange={(e) => update({ address: e.target.value })} placeholder="Street, city, ZIP" />
    </div>
  );
}

/* ── Preview panel ───────────────────────────────────── */

function Preview({ d, open, setOpen }) {
  const pkg = PACKAGES.find((p) => p.id === d.pkg);
  const rows = [
    ['Type', d.type],
    ['Package', d.pkg],
    ['Home', d.stories ? `${d.stories}-Story` : ''],
    ['Add-ons', addonNames(d.addons).join(', ') || (d.stories ? 'None' : '')],
    ['Date', d.date ? shortDate(d.date) : ''],
    ['Window', d.time ? windowLabel(d.time) : ''],
  ];
  return (
    <aside className={`preview${open ? ' is-open' : ''}`} aria-label="Live preview of your install">
      <button type="button" className="preview__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="preview__toggle-k">Your install</span>
        <span className="preview__toggle-v">{estimate(d)}</span>
        <Chevron width={18} height={18} />
      </button>
      <div className="preview__body">
        <div className="preview__scene">
          <HouseScene color={d.type === 'Permanent' ? 'gold' : 'warm'} intensity={d.pkg ? 1 : 0.18}
            coverage={pkg ? pkg.coverage : 'front-sides'} stories={d.stories || 1} addons={d.addons} variant="b"
            title="Live preview of your selections" />
          <span className="preview__tag">Live preview</span>
        </div>
        <dl className="preview__list">
          {rows.map(([k, v]) => (
            <div key={k} className={v ? '' : 'is-empty'}><dt>{k}</dt><dd>{v || '—'}</dd></div>
          ))}
        </dl>
        <p className="preview__est"><span>Estimate</span><span>{estimate(d)}</span></p>
        <p className="preview__fine">${DEPOSIT} deposit at checkout, applied to your final invoice.</p>
      </div>
    </aside>
  );
}

/* ── Page ────────────────────────────────────────────── */

export default function Book() {
  const navigate = useNavigate();
  const { draft: d, update } = useDraft();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [full, setFull] = useState(new Set());
  const [pvOpen, setPvOpen] = useState(false);
  const errRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); setError(null); }, [step]);

  useEffect(() => {
    if (!apiConfigured()) return;
    const { start, end } = seasonRange();
    getFullDates(start, end).then((r) => setFull(new Set(r.full || []))).catch(() => {});
  }, []);

  // Clear the error once the step's requirement is met.
  useEffect(() => {
    if (!error) return;
    const v = validate(step, d);
    if (!v || v.focus !== error.focus) setError(null);
  }, [d]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    const v = validate(step, d);
    if (v) { setError(v); focusTarget(v.focus); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
    else navigate('/checkout');
  };
  const back = () => (step > 0 ? setStep(step - 1) : navigate('/'));

  const S = STEPS[step];
  const body = {
    type: <StepType d={d} update={update} />,
    pkg: <StepPkg d={d} update={update} />,
    home: <StepHome d={d} update={update} />,
    date: <StepDate d={d} update={update} full={full} />,
    time: d.date ? <StepTime d={d} update={update} /> : null,
    info: <StepInfo d={d} update={update} errField={error?.focus} />,
  }[S.key];

  return (
    <main className="book" id="main">
      <div className="strip" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        <div className="container strip__inner">
          <p className="strip__count">Step {step + 1} <span>of {STEPS.length}</span></p>
          <ol className="strip__segs">
            {STEPS.map((s, i) => (
              <li key={s.key} className={`strip__seg${i < step ? ' is-done' : ''}${i === step ? ' is-now' : ''}`}>
                <button type="button" disabled={i >= step} onClick={() => setStep(i)}
                  aria-current={i === step ? 'step' : undefined} aria-label={`${s.label}${i < step ? ' (done — go back)' : ''}`}>
                  <span className="strip__led" aria-hidden="true" />
                  <span className="strip__label">{s.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="container book__grid">
        <section className="qcard" aria-labelledby="q-title">
          <p className="qcard__k">{S.label}</p>
          <h1 id="q-title" className="qcard__title">{S.title}</h1>
          <p className="qcard__sub">{S.sub}</p>
          {error && (
            <p className="formerr" role="alert" ref={errRef}>{error.msg}</p>
          )}
          <div className="qcard__body">{body}</div>
          <div className="book__actions">
            <button type="button" className="btn btn--line" onClick={back}><Back width={18} height={18} /> Back</button>
            <button type="button" className="btn btn--gold" onClick={next}>
              {step === STEPS.length - 1 ? 'Continue to checkout' : 'Continue'} <Arrow width={18} height={18} />
            </button>
          </div>
        </section>
        <Preview d={d} open={pvOpen} setOpen={setPvOpen} />
      </div>
    </main>
  );
}
