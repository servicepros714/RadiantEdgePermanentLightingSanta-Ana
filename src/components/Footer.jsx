import { Link, useNavigate } from 'react-router-dom';
import { BUSINESS, CITIES, DEPOSIT } from '../config/site.js';
import { NAV_LINKS } from './Nav.jsx';
import { Phone, Arrow } from './Icons.jsx';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="foot__eave" aria-hidden="true">
        <span className="foot__slab" />
        <span className="foot__strip" />
        <span className="foot__downlights">
          {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
        </span>
      </div>

      <div className="container foot__body">
        <div className="foot__lead">
          <Link to="/" className="foot__logo" aria-label={`${BUSINESS.name} — home`}>
            <img src="/images/logo-480.webp" width="480" height="239" alt={`${BUSINESS.name} logo`} loading="lazy" />
          </Link>
          <p className="foot__statement">Clean lines of light for {BUSINESS.city} homes — permanent or just for the season.</p>
          <a href={BUSINESS.phoneHref} className="foot__phone"><Phone width={22} height={22} /> {BUSINESS.phoneDisplay}</a>
          <p className="foot__fine">Based in {BUSINESS.city}, {BUSINESS.region}. ${DEPOSIT} reservation deposit applied to your final invoice.</p>
        </div>

        <nav className="foot__cloud" aria-label="Footer">
          <p className="foot__label">Explore</p>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`/#${l.id}`} onClick={(e) => { e.preventDefault(); navigate(`/#${l.id}`); }}>{l.label}</a>
              </li>
            ))}
            <li><a href="/#reviews" onClick={(e) => { e.preventDefault(); navigate('/#reviews'); }}>Reviews</a></li>
            <li><Link to="/book" className="is-gold">Book online <Arrow width={15} height={15} /></Link></li>
          </ul>
        </nav>

        <div className="foot__signs">
          <p className="foot__label">Service area</p>
          <ul>
            {CITIES.slice(0, 8).map((c) => <li key={c}><span>{c}</span></li>)}
          </ul>
        </div>
      </div>

      <div className="foot__legal">
        <div className="container foot__legal-row">
          <span>© {year} {BUSINESS.name} {BUSINESS.city}</span>
          <span className="foot__legal-sep" aria-hidden="true" />
          <span>Prices are “starting at”; final price confirmed at the on-site visit.</span>
        </div>
      </div>
    </footer>
  );
}
