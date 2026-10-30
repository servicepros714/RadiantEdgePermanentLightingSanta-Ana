import { BUSINESS, DEPOSIT, REVIEWS, TAKEDOWN } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';

/* Real reviews only (src/config/site.js → REVIEWS). Until real ones exist, this section says so plainly
   and lists service terms taken from the package details — no ratings or quotes are invented. */
const STANDARDS = [
  { k: 'Price first', v: 'Starting prices and online quoting up front; your final price is confirmed at the on-site visit before any work begins.' },
  { k: 'Deposit counts', v: `Your $${DEPOSIT} reservation deposit is applied to your final invoice — or choose to pay at the visit.` },
  { k: 'Looked after', v: `Seasonal installs include in-season maintenance and bulb replacement, then takedown in ${TAKEDOWN}.` },
];

export default function Reviews() {
  const ref = useReveal();
  const has = REVIEWS.length > 0;
  return (
    <section id="reviews" className="section reviews" ref={ref} aria-labelledby="reviews-title">
      <div className="container">
        <div className="sec-head" data-reveal>
          <p className="eyebrow">Reviews</p>
          <h2 id="reviews-title" className="h-section sweep">
            {has ? <>What {BUSINESS.city} <em>is saying.</em></> : <>Reviews are <em>on their way.</em></>}
          </h2>
        </div>

        {has ? (
          <ul className="quotes" data-reveal>
            {REVIEWS.map((r) => (
              <li key={r.name + r.text.slice(0, 12)} className="quote">
                <p className="quote__text">“{r.text}”</p>
                <p className="quote__by">{r.name}{r.city ? ` · ${r.city}` : ''}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="ticket" data-reveal>
            <div className="ticket__note">
              {/* TODO: add real Google reviews to REVIEWS in src/config/site.js — this panel disappears automatically. */}
              <p className="ticket__k">This season’s first installs</p>
              <p className="ticket__v">
                We only post reviews from real {BUSINESS.city}-area customers. Until they’re in, here’s what every booking includes:
              </p>
              {BUSINESS.googleReviewUrl && (
                <a className="ticket__link" href={BUSINESS.googleReviewUrl} target="_blank" rel="noreferrer">See us on Google</a>
              )}
            </div>
            <ol className="ticket__list">
              {STANDARDS.map((s, i) => (
                <li key={s.k}>
                  <span className="ticket__num">{i + 1}</span>
                  <span className="ticket__t">{s.k}</span>
                  <span className="ticket__d">{s.v}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
