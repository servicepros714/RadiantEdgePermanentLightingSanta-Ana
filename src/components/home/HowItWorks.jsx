import { STEPS } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';

export default function HowItWorks() {
  const ref = useReveal();
  return (
    <section id="how" className="section how" ref={ref} aria-labelledby="how-title">
      <div className="container">
        <div className="sec-head" data-reveal>
          <p className="eyebrow eyebrow--gold">How it works</p>
          <h2 id="how-title" className="h-section sweep">Four steps from <em>booked to lit.</em></h2>
        </div>
      </div>

      <div className="how__eave" aria-hidden="true">
        <span className="how__slab" />
        <span className="how__strip" />
      </div>

      <div className="container">
        <ol className="how__row" data-reveal>
          {STEPS.map((s, i) => (
            <li key={s.id} className="how__step" style={{ '--i': i }}>
              <span className="how__cone" aria-hidden="true" />
              <span className="how__fixture" aria-hidden="true" />
              <span className="how__num">0{i + 1}</span>
              <h3 className="how__title">{s.title}</h3>
              <p className="how__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
