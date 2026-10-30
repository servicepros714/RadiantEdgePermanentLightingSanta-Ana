import { BUSINESS, CITIES } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';
import { Phone } from '../Icons.jsx';

export default function ServiceArea() {
  const ref = useReveal();
  const [home, ...rest] = CITIES;
  return (
    <section id="area" className="section area" ref={ref} aria-labelledby="area-title">
      <div className="container area__grid">
        <div className="area__copy" data-reveal>
          <p className="eyebrow">Service area</p>
          <h2 id="area-title" className="h-section sweep">Lighting up <em>{BUSINESS.city}</em> and the streets around it.</h2>
          <p className="lede">
            Our crews work out of {BUSINESS.city} and install across central Orange County. Don’t see your city? Call — if we can reach you during the season, we’ll book you.
          </p>
          <a href={BUSINESS.phoneHref} className="btn btn--charcoal"><Phone width={18} height={18} /> Ask about your street</a>
        </div>

        <div className="signs" data-reveal>
          <ul className="signs__list" aria-label="Cities we serve">
            <li className="sign sign--home">
              <span className="sign__name">{home}</span>
              <span className="sign__meta">Home base</span>
            </li>
            {rest.map((c, i) => (
              <li key={c} className="sign" style={{ '--r': `${(i % 3) - 1}deg`, '--d': `${i * 50}ms` }}>
                <span className="sign__name">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
