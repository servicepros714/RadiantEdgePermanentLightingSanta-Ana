import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS, DEPOSIT } from '../../config/site.js';
import HouseScene, { LIGHT_COLORS } from '../HouseScene.jsx';
import { Arrow, Phone, Sun } from '../Icons.jsx';
import { prefersReducedMotion } from '../../lib/hooks.js';

const SWATCH_ORDER = ['warm', 'gold', 'emerald', 'multi', 'candy', 'cool'];

export default function Hero() {
  const [color, setColor] = useState('gold');
  const [level, setLevel] = useState(90);
  const [sides, setSides] = useState(true);
  const chase = !prefersReducedMotion();

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container hero__copy">
        <p className="hero__kicker">
          <span className="hero__pulse" aria-hidden="true" />
          Permanent &amp; Christmas lighting · {BUSINESS.city}, {BUSINESS.region}
        </p>
        <h1 id="hero-title" className="hero__title">
          Give your roofline a <span className="hero__glow">radiant edge.</span>
        </h1>
        <div className="hero__row">
          <p className="hero__sub">
            Custom-designed roofline lighting — installed once and lit all year, or hung for the holidays and taken down after.
            Book your install date online in about two minutes.
          </p>
          <div className="hero__ctas">
            <Link to="/book" className="btn btn--gold btn--lg">Book your install <Arrow width={20} height={20} /></Link>
            <a href={BUSINESS.phoneHref} className="btn btn--ghost-light btn--lg"><Phone width={19} height={19} /> {BUSINESS.phoneDisplay}</a>
          </div>
        </div>
      </div>

      <div className="hero__stage">
        <HouseScene color={color} intensity={level / 100} coverage={sides ? 'front-sides' : 'front'} stories={2}
          variant="a" chase={chase} skyFade title={`Illustrated home with ${LIGHT_COLORS[color].label.toLowerCase()} roofline lighting`} />
        <span className="hero__tag">Design preview · illustration</span>

        <div className="dock" role="group" aria-label="Preview your roofline">
          <div className="dock__group">
            <span className="dock__label" id="dock-color">Color</span>
            <div className="dock__swatches" role="radiogroup" aria-labelledby="dock-color">
              {SWATCH_ORDER.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={color === k} title={LIGHT_COLORS[k].label}
                  aria-label={LIGHT_COLORS[k].label} className={`swatch swatch--${k}${color === k ? ' is-on' : ''}`}
                  onClick={() => setColor(k)} />
              ))}
            </div>
            <span className="dock__value" aria-live="polite">{LIGHT_COLORS[color].label}</span>
          </div>
          <div className="dock__group dock__group--dim">
            <label className="dock__label" htmlFor="dimmer"><Sun width={15} height={15} /> Dimmer</label>
            <input id="dimmer" type="range" min="0" max="100" step="5" value={level}
              onChange={(e) => setLevel(Number(e.target.value))} className="dimmer" style={{ '--v': `${level}%` }}
              aria-valuetext={level === 0 ? 'Off' : `${level}%`} />
          </div>
          <div className="dock__group">
            <span className="dock__label" id="dock-sides">Sides</span>
            <button type="button" role="switch" aria-checked={sides} aria-labelledby="dock-sides"
              className={`rocker${sides ? ' is-on' : ''}`} onClick={() => setSides((s) => !s)}>
              <span className="rocker__knob" />
            </button>
          </div>
        </div>
      </div>

      <p className="container hero__fine">
        ${DEPOSIT} reservation deposit holds your date and is applied to your final invoice — or pay at the visit.
      </p>
    </section>
  );
}
