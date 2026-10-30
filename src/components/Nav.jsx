import { useEffect, useRef, useState } from 'react';
import { useInert } from '../lib/hooks.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import { Phone, Menu, Close, Arrow } from './Icons.jsx';

export const NAV_LINKS = [
  { id: 'season', label: 'Season' },
  { id: 'how', label: 'How it works' },
  { id: 'packages', label: 'Packages' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'area', label: 'Service area' },
  { id: 'faq', label: 'FAQ' },
];

function useActiveSection(enabled) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return undefined;
    const els = ['top', ...NAV_LINKS.map((l) => l.id), 'reviews'].map((id) => document.getElementById(id)).filter(Boolean);
    const ids = NAV_LINKS.map((l) => l.id);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(ids.includes(e.target.id) ? e.target.id : ''); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const home = pathname === '/';
  const active = useActiveSection(home);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const drawerRef = useInert(!open);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', open);
    if (!open) return undefined;
    const first = panelRef.current?.querySelector('a, button');
    first?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/#${id}`);
  };

  return (
    <>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}`}>
        <Link to="/" className="nav__brand" aria-label={`${BUSINESS.name} ${BUSINESS.city} — home`}>
          <img src="/images/logo-480.webp" width="480" height="239" alt={`${BUSINESS.name} logo`} />
        </Link>
        <nav className="nav__links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`/#${l.id}`} onClick={go(l.id)} className={`nav__link${active === l.id ? ' is-active' : ''}`}
              aria-current={active === l.id ? 'true' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="nav__phone" href={BUSINESS.phoneHref}>
          <Phone width={17} height={17} /> <span>{BUSINESS.phoneDisplay}</span>
        </a>
        <Link to="/book" className="nav__book">
          <span>Book Online</span> <Arrow width={18} height={18} />
        </Link>
        <button ref={toggleRef} type="button" className="nav__toggle" aria-expanded={open} aria-controls="drawer"
          aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <Close width={22} height={22} /> : <Menu width={22} height={22} />}
        </button>
        <span className="nav__led" aria-hidden="true" />
      </header>

      <div ref={drawerRef} className={`drawer${open ? ' is-open' : ''}`} id="drawer" aria-hidden={!open}>
        <button type="button" className="drawer__scrim" tabIndex={-1} aria-label="Close menu" onClick={() => setOpen(false)} />
        <div className="drawer__panel" ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <span className="drawer__title">Menu</span>
            <button type="button" className="drawer__close" onClick={() => setOpen(false)} aria-label="Close menu">
              <Close width={22} height={22} />
            </button>
          </div>
          <nav className="drawer__tiles" aria-label="Mobile">
            {NAV_LINKS.map((l, i) => (
              <a key={l.id} href={`/#${l.id}`} onClick={go(l.id)} className="drawer__tile">
                <span className="drawer__dot" aria-hidden="true" style={{ '--i': i }} />
                {l.label}
              </a>
            ))}
          </nav>
          <p className="drawer__note">Installs Oct 20 – Dec 20 · {BUSINESS.city} &amp; nearby</p>
          <div className="actionbar actionbar--drawer">
            <a href={BUSINESS.phoneHref} className="btn btn--charcoal"><Phone width={18} height={18} /> Call Now</a>
            <Link to="/book" className="btn btn--gold">Book Online <Arrow width={18} height={18} /></Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* Focused bar for /book and /checkout. */
export function FocusBar({ backTo = '/', backLabel = 'Home' }) {
  return (
    <header className="fbar">
      <Link to={backTo} className="fbar__back"><span aria-hidden="true">←</span> {backLabel}</Link>
      <Link to="/" className="fbar__brand" aria-label={`${BUSINESS.name} — home`}>
        <img src="/images/logo-480.webp" width="480" height="239" alt={`${BUSINESS.name} logo`} />
      </Link>
      <a href={BUSINESS.phoneHref} className="fbar__call"><Phone width={17} height={17} /> <span>Call</span></a>
      <span className="nav__led" aria-hidden="true" />
    </header>
  );
}
