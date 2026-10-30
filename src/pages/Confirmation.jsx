import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS, DEPOSIT, TAKEDOWN } from '../config/site.js';
import { readConfirmation, useDraft } from '../lib/draft.jsx';
import { longDate, windowLabel } from '../lib/time.js';
import HouseScene from '../components/HouseScene.jsx';
import { Phone } from '../components/Icons.jsx';

export default function Confirmation() {
  const { reset } = useDraft();
  const [c] = useState(readConfirmation);

  useEffect(() => { window.scrollTo(0, 0); if (c) reset(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) {
    return (
      <main className="confirm" id="main">
        <div className="container confirm__card">
          <h1 className="confirm__title">No booking to show</h1>
          <p className="lede">Start a new booking, or call us and we’ll help.</p>
          <div className="confirm__btns">
            <Link to="/book" className="btn btn--gold">Book online</Link>
            <a href={BUSINESS.phoneHref} className="btn btn--line"><Phone width={18} height={18} /> {BUSINESS.phoneDisplay}</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="confirm" id="main">
      <div className="container confirm__grid">
        <div className="confirm__card">
          <p className="eyebrow">Booking received</p>
          <h1 className="confirm__title">You’re on the schedule, {c.name.split(' ')[0]}.</h1>
          <p className="confirm__id">Booking ID <strong>{c.id}</strong></p>
          {c.conflict && (
            <p className="formerr" role="status">
              Your deposit went through, but that window filled at the same moment. We’ll call you to confirm your install time — no need to rebook.
            </p>
          )}
          <dl className="confirm__list">
            <div><dt>Install</dt><dd>{longDate(c.date)} · {windowLabel(c.time)}</dd></div>
            <div><dt>Home</dt><dd>{c.vehicle}</dd></div>
            <div><dt>Address</dt><dd>{c.address}</dd></div>
            <div><dt>Deposit</dt><dd>{c.payment === 'Paid' ? `$${DEPOSIT} paid — applied to your final invoice` : 'Pay at the visit'}</dd></div>
          </dl>
          <h2 className="confirm__next">What happens next</h2>
          <ol className="confirm__steps">
            <li>We’ll contact you at {c.email} to confirm your install details.</li>
            <li>At the on-site visit we confirm the design and your final price before any work starts.</li>
            <li>{c.type === 'Permanent' ? 'Your permanent lighting is installed and stays up year-round.' : `We install, maintain through the season, and take down in ${TAKEDOWN}.`}</li>
          </ol>
          <div className="confirm__btns">
            <Link to="/" className="btn btn--emerald">Back to home</Link>
            <a href={BUSINESS.phoneHref} className="btn btn--line"><Phone width={18} height={18} /> {BUSINESS.phoneDisplay}</a>
          </div>
        </div>
        <div className="confirm__art" aria-hidden="true">
          <HouseScene color={c.type === 'Permanent' ? 'gold' : 'warm'} coverage={c.pkg === 'Front Only' ? 'front' : 'front-sides'}
            stories={c.vehicle.includes('2-Story') ? 2 : 1} variant="b" chase />
        </div>
      </div>
    </main>
  );
}
