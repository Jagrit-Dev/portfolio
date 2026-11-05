import { Barbell, Bread, Coffee, Receipt, Scales, ShieldCheck, Tooth, Wrench } from '@phosphor-icons/react'
import { niches } from './data'

const ART = { bakery: Bread, dental: Tooth, gym: Barbell, law: Scales, plumber: Wrench, cafe: Coffee, portal: ShieldCheck, ledger: Receipt }

// A real, working mini website rendered from a niche config.
// Container units (cqw) let it scale to any window or frame size.
// `layout` and `accent` optionally override the niche defaults (the demo station uses them).
export default function SiteMock({ niche = 'bakery', business, layout, accent }) {
  const n = niches[niche] || niches.bakery
  const name = (business || '').trim() || n.brand
  const lay = layout || n.layout
  const style = {
    '--m-bg': n.palette.bg,
    '--m-ink': n.palette.ink,
    '--m-accent': accent || n.palette.accent,
    '--m-soft': accent ? `color-mix(in srgb, ${accent} 16%, ${n.palette.bg})` : n.palette.soft,
    '--m-font': n.font,
  }
  const Art = ART[niche] || Bread

  return (
    <div className={`mock mock--${lay}`} style={style}>
      <div className="mock__page">
        <header className="mock__nav">
          <strong className="mock__brand">{name}</strong>
          <nav>
            {n.links.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </nav>
          <span className="mock__btn mock__btn--sm">{n.cta}</span>
        </header>

        <section className="mock__hero" key={niche + name + lay}>
          <div className="mock__copy">
            <h3>{n.headline}</h3>
            <p>{n.sub}</p>
            <span className="mock__btn">{n.cta}</span>
          </div>
          <div className="mock__photo" aria-hidden="true">
            <div className="mock__art">
              <i className="mock__ring mock__ring--a" />
              <i className="mock__ring mock__ring--b" />
              <Art weight="duotone" />
            </div>
          </div>
        </section>

        <section className="mock__services">
          {n.services.map(([t, d], i) => (
            <article key={t} style={{ '--i': i }}>
              <h4>{t}</h4>
              <p>{d}</p>
            </article>
          ))}
        </section>

        <footer className="mock__foot">
          <span>{name}</span>
          <span>Open daily, find us on the high street</span>
        </footer>
      </div>
    </div>
  )
}
