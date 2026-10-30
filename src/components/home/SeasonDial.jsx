import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TIME_WINDOWS, LEAD_HOURS } from '../../config/site.js';
import { getFullDates, apiConfigured } from '../../lib/api.js';
import { seasonRange, seasonDates, dateHasOpenWindow, laToday, iso, monthDay, shortDate } from '../../lib/time.js';
import { useReveal } from '../../lib/hooks.js';
import { Arrow } from '../Icons.jsx';

const CX = 140;
const CY = 140;
const R = 108;
const polar = (a) => [CX + R * Math.cos(a), CY + R * Math.sin(a)];
function arc(a0, a1) {
  const [x0, y0] = polar(a0);
  const [x1, y1] = polar(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const STATUS_LABEL = { past: 'Passed', full: 'Full', filling: 'Filling', open: 'Open' };

export default function SeasonDial() {
  const ref = useReveal();
  const [full, setFull] = useState([]);
  const [live, setLive] = useState(false);
  const range = seasonRange();

  useEffect(() => {
    if (!apiConfigured()) return;
    let off = false;
    getFullDates(range.start, range.end)
      .then((d) => { if (!off) { setFull(d.full || []); setLive(true); } })
      .catch(() => {});
    return () => { off = true; };
  }, [range.start, range.end]);

  const { weeks, earliest, daysLeft, todayFrac } = useMemo(() => {
    const dates = seasonDates();
    const fullSet = new Set(full);
    const wk = [];
    for (let i = 0; i < dates.length; i += 7) {
      const chunk = dates.slice(i, i + 7);
      const closed = chunk.filter((d) => !dateHasOpenWindow(d)).length;
      const booked = chunk.filter((d) => dateHasOpenWindow(d) && fullSet.has(d)).length;
      const open = chunk.length - closed - booked;
      let status = 'open';
      if (closed === chunk.length) status = 'past';
      else if (open === 0) status = 'full';
      else if (booked >= (chunk.length - closed) / 2) status = 'filling';
      wk.push({ from: chunk[0], to: chunk[chunk.length - 1], status, open });
    }
    const first = dates.find((d) => dateHasOpenWindow(d) && !fullSet.has(d)) || '';
    const t = laToday();
    const today = iso(t.y, t.m, t.d);
    const left = dates.filter((d) => d >= today).length;
    const idx = dates.indexOf(today);
    return {
      weeks: wk,
      earliest: first,
      daysLeft: left,
      todayFrac: idx >= 0 ? idx / (dates.length - 1) : today < dates[0] ? 0 : 1,
    };
  }, [full]);

  const gap = 0.045;
  const startA = -Math.PI / 2;
  const span = (Math.PI * 2) / weeks.length;
  const [tx, ty] = polar(startA + todayFrac * Math.PI * 2);

  return (
    <section id="season" className="section season" ref={ref} aria-labelledby="season-title">
      <div className="container season__grid">
        <div className="dial" data-reveal>
          <svg viewBox="0 0 280 280" className="dial__svg" role="img"
            aria-label={`Install season ${monthDay(range.start)} to ${monthDay(range.end)}, shown week by week.`}>
            <circle cx={CX} cy={CY} r={R} className="dial__track" />
            {weeks.map((w, i) => (
              <path key={w.from} d={arc(startA + i * span + gap / 2, startA + (i + 1) * span - gap / 2)} className={`dial__seg dial__seg--${w.status}`}>
                <title>{`${monthDay(w.from)} – ${monthDay(w.to)}: ${STATUS_LABEL[w.status]}`}</title>
              </path>
            ))}
            <circle cx={tx} cy={ty} r="8" className="dial__today" />
            <circle cx={CX} cy={CY} r="78" className="dial__face" />
          </svg>
          <div className="dial__center">
            <span className="dial__k">Earliest open</span>
            <span className="dial__date">{earliest ? shortDate(earliest) : 'Season full'}</span>
            <span className="dial__k">{earliest ? `${TIME_WINDOWS.length} windows a day` : 'Call to join the waitlist'}</span>
          </div>
        </div>

        <div className="season__copy" data-reveal>
          <p className="eyebrow">Install season · {range.year}</p>
          <h2 id="season-title" className="h-section sweep">Nine weeks of installs. <em>First come, first lit.</em></h2>
          <p className="lede">
            We install every day from {monthDay(range.start)} to {monthDay(range.end)}. Each week on the dial shows how much is still open
            {live ? ' — live from our booking calendar.' : '.'} Book early to get the date you want before the December rush.
          </p>
          <ul className="legend" aria-label="Dial legend">
            <li><i className="legend__dot legend__dot--open" /> Open</li>
            <li><i className="legend__dot legend__dot--filling" /> Filling</li>
            <li><i className="legend__dot legend__dot--full" /> Full</li>
            <li><i className="legend__dot legend__dot--past" /> Passed</li>
            <li><i className="legend__dot legend__dot--today" /> Today</li>
          </ul>
          <dl className="season__stats">
            <div><dt>Days left in the season</dt><dd>{daysLeft}</dd></div>
            <div><dt>Install windows a day</dt><dd>{TIME_WINDOWS.length}</dd></div>
            <div><dt>Book at least</dt><dd>{LEAD_HOURS}<small>hrs ahead</small></dd></div>
          </dl>
          <Link to="/book" className="btn btn--emerald">Pick your date <Arrow width={18} height={18} /></Link>
        </div>
      </div>
    </section>
  );
}
