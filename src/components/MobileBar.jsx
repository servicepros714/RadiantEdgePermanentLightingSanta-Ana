import { Link, useLocation } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import { useScrolledPast, useInert } from '../lib/hooks.js';
import { Phone, Arrow } from './Icons.jsx';

const HIDDEN = ['/book', '/checkout', '/confirmation'];

export default function MobileBar() {
  const { pathname } = useLocation();
  const past = useScrolledPast(pathname === '/' ? 'top' : null);
  const ref = useInert(!past);
  if (HIDDEN.includes(pathname)) return null;
  return (
    <div ref={ref} className={`mbar${past ? ' is-shown' : ''}`} aria-hidden={!past}>
      <div className="actionbar">
        <a href={BUSINESS.phoneHref} className="btn btn--charcoal"><Phone width={18} height={18} /> Call Now</a>
        <Link to="/book" className="btn btn--gold">Book Online <Arrow width={18} height={18} /></Link>
      </div>
    </div>
  );
}
