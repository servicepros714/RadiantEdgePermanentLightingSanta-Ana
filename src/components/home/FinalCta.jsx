import { Link } from 'react-router-dom';
import { BUSINESS, DEPOSIT } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';
import { Arrow, Phone } from '../Icons.jsx';

export default function FinalCta() {
  const ref = useReveal();
  return (
    <section className="cta" ref={ref} data-reveal aria-labelledby="cta-title">
      <div className="cta__eave" aria-hidden="true">
        <span className="cta__slab" />
        <span className="cta__strip" />
      </div>
      <div className="container cta__inner">
        <p className="eyebrow eyebrow--gold">Ready when you are</p>
        <h2 id="cta-title" className="cta__title">Switch on a <em>sharper</em> home this season.</h2>
        <p className="cta__sub">Pick your coverage, date and time window online. ${DEPOSIT} holds your spot and goes toward your invoice.</p>
        <div className="cta__btns">
          <Link to="/book" className="btn btn--gold btn--lg">Book your install <Arrow width={20} height={20} /></Link>
          <a href={BUSINESS.phoneHref} className="btn btn--ghost-light btn--lg"><Phone width={19} height={19} /> Call {BUSINESS.phoneDisplay}</a>
        </div>
      </div>
    </section>
  );
}
