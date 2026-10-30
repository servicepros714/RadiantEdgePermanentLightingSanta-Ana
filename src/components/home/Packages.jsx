import { Link } from 'react-router-dom';
import { PACKAGES, LIGHTING_TYPES, DEPOSIT, TWO_STORY_PERCENT } from '../../config/site.js';
import { priceLabel, addonPriceLabel, visibleAddons } from '../../lib/pricing.js';
import { useDraft } from '../../lib/draft.jsx';
import { useReveal } from '../../lib/hooks.js';
import { PlanDiagram } from '../HouseScene.jsx';
import { ADDON_ICONS, Arrow, Check, Stack } from '../Icons.jsx';

export default function Packages() {
  const ref = useReveal();
  const { draft, update } = useDraft();
  const type = draft.type || 'Permanent';
  const addons = visibleAddons(type);

  const setType = (t) => update((d) => ({
    type: t,
    addons: t === 'Permanent' ? d.addons.filter((id) => id !== 'storage') : d.addons,
  }));
  const toggleAddon = (id) => update((d) => ({
    addons: d.addons.includes(id) ? d.addons.filter((x) => x !== id) : [...d.addons, id],
  }));

  return (
    <section id="packages" className="section packages" ref={ref} aria-labelledby="packages-title">
      <div className="container">
        <div className="sec-head sec-head--split" data-reveal>
          <div>
            <p className="eyebrow">Packages</p>
            <h2 id="packages-title" className="h-section sweep">Choose your <em>coverage.</em></h2>
          </div>
          <div className="seg" role="radiogroup" aria-label="Lighting type">
            {LIGHTING_TYPES.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={type === t.id}
                className={`seg__opt${type === t.id ? ' is-on' : ''}`} onClick={() => setType(t.id)}>
                <span className="seg__name">{t.name}</span>
                <span className="seg__tag">{t.tagline}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="packages__blurb" data-reveal aria-live="polite">{LIGHTING_TYPES.find((t) => t.id === type).blurb}</p>

        <div className="sheets">
          {PACKAGES.map((p, i) => (
            <article key={p.id} className="sheet" data-reveal style={{ '--d': `${i * 90}ms` }}>
              <header className="sheet__head">
                <span className="sheet__code">{p.code}-{type === 'Permanent' ? 'P' : 'S'}</span>
                <span className="sheet__kind">{type} lighting</span>
              </header>
              <div className="sheet__plan">
                <PlanDiagram coverage={p.coverage} />
              </div>
              <div className="sheet__body">
                <h3 className="sheet__name">{p.id}</h3>
                <p className="sheet__summary">{p.summary}</p>
                <p className="sheet__price">
                  <span className="sheet__price-k">{type === 'Permanent' || p.price == null ? 'Price' : 'Starting at'}</span>
                  <span className="sheet__price-v">{type === 'Permanent' ? 'Online quoting' : priceLabel(p.price).replace('Starting at ', '')}</span>
                </p>
                <ul className="sheet__list">
                  {p.features[type].map((f) => (
                    <li key={f}><Check width={17} height={17} /> {f}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="board" data-reveal>
          <div className="board__head">
            <h3 className="board__title">Add-on switchboard</h3>
            <p className="board__sub">Flip on what you’d like — your picks carry over to booking.</p>
          </div>
          <ul className="board__grid">
            <li>
              <button type="button" role="switch" aria-checked={draft.stories === 2}
                className={`plate${draft.stories === 2 ? ' is-on' : ''}`}
                onClick={() => update((d) => ({ stories: d.stories === 2 ? 1 : 2 }))}>
                <span className="plate__switch" aria-hidden="true"><span /></span>
                <span className="plate__icon" aria-hidden="true"><Stack /></span>
                <span className="plate__name">Two-story home</span>
                <span className="plate__price">+{TWO_STORY_PERCENT}% of package price</span>
              </button>
            </li>
            {addons.map((a) => {
              const Icon = ADDON_ICONS[a.icon];
              const on = draft.addons.includes(a.id);
              return (
                <li key={a.id}>
                  <button type="button" role="switch" aria-checked={on} className={`plate${on ? ' is-on' : ''}`} onClick={() => toggleAddon(a.id)}>
                    <span className="plate__switch" aria-hidden="true"><span /></span>
                    <span className="plate__icon" aria-hidden="true"><Icon /></span>
                    <span className="plate__name">{a.name}</span>
                    <span className="plate__price">{addonPriceLabel(a)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="packages__cta" data-reveal>
          <Link to="/book" className="btn btn--gold btn--lg" onClick={() => { if (!draft.type) update({ type }); }}>
            Book Now <Arrow width={20} height={20} />
          </Link>
          <p className="packages__fine">
            Prices shown are “starting at”; your final price is confirmed at the on-site visit. A ${DEPOSIT} reservation deposit holds your date and is applied to your final invoice.
          </p>
        </div>
      </div>
    </section>
  );
}
