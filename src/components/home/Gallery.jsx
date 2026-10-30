import { useState } from 'react';
import { GALLERY } from '../../config/site.js';
import { useReveal } from '../../lib/hooks.js';
import HouseScene, { LIGHT_COLORS } from '../HouseScene.jsx';

export default function Gallery() {
  const ref = useReveal();
  const [open, setOpen] = useState(GALLERY[1]?.id || GALLERY[0].id);

  return (
    <section id="gallery" className="section gallery" ref={ref} aria-labelledby="gallery-title">
      <div className="container">
        <div className="sec-head sec-head--split" data-reveal>
          <div>
            <p className="eyebrow eyebrow--gold">Gallery</p>
            <h2 id="gallery-title" className="h-section sweep">Night scenes, <em>edge to edge.</em></h2>
          </div>
          <p className="sec-head__aside">
            Tap a panel to open it. These are illustrated design previews — photos of our own installs go here as the season’s work is finished.
          </p>
        </div>

        <ul className="panels" data-reveal>
          {GALLERY.map((g, i) => {
            const isOpen = open === g.id;
            return (
              <li key={g.id} className={`panel${isOpen ? ' is-open' : ''}`}>
                <button type="button" className="panel__btn" aria-expanded={isOpen} aria-controls={`${g.id}-cap`}
                  onClick={() => setOpen(g.id)} onFocus={() => setOpen(g.id)}>
                  <span className="panel__media">
                    {g.photo ? (
                      <img src={g.photo} alt={`${g.title} — ${g.note}`} loading="lazy" />
                    ) : (
                      <HouseScene {...g.scene} fit="slice" title={`Design preview: ${LIGHT_COLORS[g.scene.color].label} — ${g.note}`} />
                    )}
                  </span>
                  <span className="panel__spine" aria-hidden="true">
                    <span className="panel__idx">0{i + 1}</span>
                    <span className="panel__spine-title">{g.title}</span>
                  </span>
                </button>
                <div className="panel__cap" id={`${g.id}-cap`}>
                  {!g.photo && <span className="panel__tag">Design preview</span>}
                  <h3 className="panel__title">{g.title}</h3>
                  <p className="panel__note">{g.note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
