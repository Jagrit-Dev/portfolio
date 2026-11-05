import { useState } from 'react'
import { ArrowRight, ArrowUpRight, ArrowsOut, CalendarBlank, Check, Copy, LinkSimple, Shuffle, TerminalWindow } from '@phosphor-icons/react'
import { ACCENTS, LAYOUTS, demoNiches, niches, profile, projects } from './data'
import { SOCIALS } from './socials'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'yourbusiness'

// A headline word that rises out of a mask (see .w in the stylesheet).
function Word({ i, children }) {
  return (
    <span className="w" aria-hidden="true" style={{ '--i': i }}>
      <span>{children}</span>
    </span>
  )
}

function Section({ i, side, kind, children }) {
  return (
    <section className={`st st--${side}${kind ? ` st--${kind}` : ''}`} data-i={i}>
      <div className="st__inner">{children}</div>
    </section>
  )
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// The email address as a mail link, with a one-tap copy and a small confirmation.
function EmailCopy({ email }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard can be blocked; the mail link still works */
    }
  }
  return (
    <div className="mail-row">
      <a className="mail" href={`mailto:${email}`}>
        {email}
      </a>
      <button className="mail-copy" onClick={copy} aria-label={copied ? 'Email copied' : 'Copy email address'} data-copied={copied}>
        {copied ? <Check weight="bold" size={14} /> : <Copy weight="bold" size={14} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}

// Style layout, accent colour, shuffle, shareable link and pop-out for the demo slab.
function DemoControls({ demo, setDemo, onOpenDemo }) {
  const [copied, setCopied] = useState(false)
  const layout = demo.layout || niches[demo.niche].layout

  const shuffle = () => {
    const next = pick(demoNiches.filter((n) => n.key !== demo.niche)).key
    setDemo({ ...demo, niche: next, layout: pick(LAYOUTS).key, accent: pick(ACCENTS) })
  }
  const copyLink = async () => {
    const q = new URLSearchParams({ demo: demo.niche })
    if (demo.business.trim()) q.set('name', demo.business.trim())
    if (demo.layout) q.set('layout', demo.layout)
    if (demo.accent) q.set('accent', demo.accent.slice(1))
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/?${q}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard can be blocked; nothing to do */
    }
  }

  return (
    <>
      <div className="demo-opts">
        <fieldset className="field opt-layout">
          <legend>Style</legend>
          <div className="seg" role="group" aria-label="Layout style">
            {LAYOUTS.map((l) => (
              <button
                key={l.key}
                type="button"
                aria-pressed={layout === l.key}
                onClick={() => setDemo({ ...demo, layout: l.key })}
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>Accent</legend>
          <div className="swatches" role="group" aria-label="Accent colour">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                className="swatch"
                style={{ '--c': c }}
                aria-label={`Accent ${c}`}
                aria-pressed={demo.accent === c}
                onClick={() => setDemo({ ...demo, accent: demo.accent === c ? null : c })}
              />
            ))}
          </div>
        </fieldset>
      </div>
      <div className="row">
        <button className="btn btn--glass" onClick={shuffle}>
          <Shuffle weight="bold" size={18} />
          Surprise me
        </button>
        <button className="btn btn--glass" onClick={copyLink}>
          {copied ? <Check weight="bold" size={18} /> : <LinkSimple weight="bold" size={18} />}
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <button className="btn btn--glass" onClick={() => onOpenDemo(demo.niche, demo.business, demo.layout, demo.accent)}>
          <ArrowsOut weight="bold" size={18} />
          Pop it out
        </button>
      </div>
    </>
  )
}

export default function Overlays({ demo, setDemo, prospect, onOpenProject, onOpenTerminal, onOpenDemo, goTo }) {
  const shown = demo.business.trim() || niches[demo.niche].brand
  return (
    <div className="overlays">
      <Section i={0} side="left">
        {prospect?.business && (
          <p className="tagline enter" style={{ '--d': 0.1 }}>
            Built for {prospect.business}
          </p>
        )}
        <h1 aria-label="Websites worth touching.">
          <Word i={0}>Websites</Word>{' '}
          <em>
            <Word i={1}>worth</Word> <Word i={2}>touching.</Word>
          </em>
        </h1>
        <p className="lede enter" style={{ '--d': 0.62 }}>
          Premium websites and web apps for businesses that care how they look, and how they feel.
        </p>
        <div className="row enter" style={{ '--d': 0.78 }}>
          <a className="btn" href={profile.booking} target="_blank" rel="noreferrer">
            <CalendarBlank weight="bold" size={20} />
            Book a call
          </a>
          <button className="btn btn--glass" onClick={() => goTo(4)}>
            Try the live demo
            <ArrowRight weight="bold" size={18} />
          </button>
        </div>
      </Section>

      {projects.slice(1).map((p, k) => {
        const i = k + 1
        return (
          <Section key={p.id} i={i} side={i % 2 === 0 ? 'left' : 'right'}>
            <p className="meta">{p.type}</p>
            <h2>{p.name}</h2>
            <p className="lede">{p.blurb}</p>
            <ul className="chips">
              {p.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="row">
              <button
                className="btn"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  onOpenProject(p, null, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
                }}
              >
                Open project
                <ArrowUpRight weight="bold" size={18} />
              </button>
            </div>
            <p className="hint">Or pull the device off the stage.</p>
          </Section>
        )
      })}

      <Section i={4} side="left" kind="demo">
        <h2>See your business on the screen.</h2>
        <p className="lede">Pick your trade and type your name. The site rebuilds itself, live.</p>
        <label className="field">
          <span>Business name</span>
          <input
            value={demo.business}
            onChange={(e) => setDemo({ ...demo, business: e.target.value })}
            placeholder={niches[demo.niche].brand}
            maxLength={36}
          />
        </label>
        <fieldset className="field">
          <legend>Your trade</legend>
          <div className="chips chips--pick">
            {demoNiches.map((n) => (
              <button
                key={n.key}
                type="button"
                className="chip"
                aria-pressed={demo.niche === n.key}
                onClick={() => setDemo({ ...demo, niche: n.key })}
              >
                {n.label}
              </button>
            ))}
          </div>
        </fieldset>
        <DemoControls demo={demo} setDemo={setDemo} onOpenDemo={onOpenDemo} />
        <span className="url">{`https://${slug(shown)}.com`}</span>
      </Section>

      <Section i={5} side="right">
        <h2>Let&apos;s build yours.</h2>
        <p className="lede">Tell me about your business and I will come back with a plan and a quote.</p>
        <div className="row">
          <a className="btn" href={profile.booking} target="_blank" rel="noreferrer">
            <CalendarBlank weight="bold" size={20} />
            Book a call
          </a>
          <button className="btn btn--glass" onClick={onOpenTerminal}>
            <TerminalWindow weight="bold" size={20} />
            Use the terminal
          </button>
        </div>
        <EmailCopy email={profile.email} />
        <p className="credit">Designed and built by {profile.name}</p>
        {/* touch screens have no hover, so the socials sit here instead of the taskbar */}
        <div className="socials">
          {SOCIALS.map(({ key, label, href, Icon, color }) => (
            <a key={key} href={href} target="_blank" rel="noreferrer" aria-label={label} data-key={key} style={{ "--c": color }}>
              <Icon weight="fill" size={20} />
            </a>
          ))}
        </div>
      </Section>
    </div>
  )
}
