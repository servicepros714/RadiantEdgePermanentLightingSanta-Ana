import { useState } from 'react';
import { BUSINESS, FAQ } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';
import { Phone } from '../Icons.jsx';

export default function Faq() {
  const ref = useReveal();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section faq" ref={ref} aria-labelledby="faq-title">
      <div className="container faq__grid">
        <div className="faq__intro" data-reveal>
          <p className="eyebrow eyebrow--gold">FAQ</p>
          <h2 id="faq-title" className="h-section sweep">Ask us <em>anything.</em></h2>
          <p className="lede">Tap a question for the answer. Something else on your mind? We’re a call away.</p>
          <a href={BUSINESS.phoneHref} className="btn btn--ghost-light"><Phone width={18} height={18} /> {BUSINESS.phoneDisplay}</a>
        </div>

        <ul className="chat" data-reveal>
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className={`chat__item${isOpen ? ' is-open' : ''}`}>
                <h3 className="chat__q">
                  <button type="button" aria-expanded={isOpen} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span>{f.q}</span>
                    <span className="chat__plus" aria-hidden="true" />
                  </button>
                </h3>
                <div className="chat__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!isOpen}>
                  <img className="chat__avatar" src="/images/mark-160.webp" width="40" height="46" alt="" aria-hidden="true" loading="lazy" />
                  <p className="chat__bubble">{f.a}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
