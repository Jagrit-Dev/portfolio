import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight, X } from '@phosphor-icons/react'
import SiteMock from './SiteMock'
import Terminal from './Terminal'
import { niches, projects } from './data'

const isPhone = () => window.matchMedia('(max-width: 767px)').matches

function Win({ win, onClose, onFocus, title, kicker, actions, children }) {
  const el = useRef(null)

  const beginDrag = (clientX, clientY) => {
    if (isPhone()) return
    const node = el.current
    const offX = clientX - node.offsetLeft
    const offY = clientY - node.offsetTop
    document.body.classList.add('is-dragging')
    const move = (e) => {
      const x = Math.min(Math.max(e.clientX - offX, -node.offsetWidth + 120), window.innerWidth - 80)
      const y = Math.min(Math.max(e.clientY - offY, 64), window.innerHeight - 48)
      node.style.left = x + 'px'
      node.style.top = y + 'px'
    }
    const up = () => {
      document.body.classList.remove('is-dragging')
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  useLayoutEffect(() => {
    const node = el.current
    const w = Math.min(920, window.innerWidth * 0.9)
    const h = Math.min(win.kind === 'terminal' ? 440 : 620, window.innerHeight * 0.78)
    node.style.width = w + 'px'
    node.style.height = h + 'px'
    if (win.drag) {
      // pulled out of the scene: the title bar lands under the pointer
      node.style.left = win.drag.x - w / 2 + 'px'
      node.style.top = Math.max(72, win.drag.y - 22) + 'px'
      beginDrag(win.drag.x, win.drag.y)
    } else {
      const step = (win.slot % 6) * 30
      node.style.left = Math.max(12, (window.innerWidth - w) / 2 + step - 60) + 'px'
      node.style.top = Math.max(72, (window.innerHeight - h) / 2 + step - 20) + 'px'
      if (win.origin && !isPhone()) {
        // grow out of the exact spot that was clicked
        node.style.transformOrigin = `${win.origin.x - node.offsetLeft}px ${win.origin.y - node.offsetTop}px`
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={el}
      className={`win win--${win.kind}${win.origin && !win.drag ? ' win--from-origin' : ''}${win.closing ? ' win--closing' : ''}`}
      style={{ zIndex: win.z }}
      onPointerDown={() => onFocus(win.id)}
      role="dialog"
      aria-label={title}
    >
      <div
        className="win__bar"
        onPointerDown={(e) => {
          if (e.target.closest('button,a')) return
          e.preventDefault()
          beginDrag(e.clientX, e.clientY)
        }}
      >
        <strong className="win__title">{title}</strong>
        {kicker && <span className="win__kicker">{kicker}</span>}
        <div className="win__actions">
          {actions}
          <button className="icon-btn" onClick={() => onClose(win.id)} aria-label={`Close ${title}`}>
            <X weight="bold" size={16} />
          </button>
        </div>
      </div>
      <div className="win__body">{children}</div>
    </div>
  )
}

function ProjectBody({ project }) {
  return (
    <div className="proj">
      <div
        className="proj__stage"
        style={project.mock.shot ? { background: `url(${project.mock.shot}) top / cover` } : undefined}
      >
        {project.embed && project.url ? (
          <iframe src={project.url} title={project.name} loading="lazy" />
        ) : project.mock.shot && project.url ? (
          // sites that refuse to be framed: the screenshot links out instead
          <a className="proj__shot" href={project.url} target="_blank" rel="noreferrer" aria-label={`Visit ${project.name}`} />
        ) : (
          <SiteMock niche={project.mock.niche} business={project.mock.business} />
        )}
      </div>
      <div className="proj__meta">
        <p>{project.blurb}</p>
        <ul className="chips">
          {project.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {!project.url && <span className="proj__note">Sample preview. The live build goes here.</span>}
      </div>
    </div>
  )
}

export default function Windows({ wins, onClose, onFocus, terminalApi }) {
  return wins.map((w) => {
    if (w.kind === 'project') {
      const p = projects.find((x) => x.id === w.ref)
      return (
        <Win
          key={w.id}
          win={w}
          onClose={onClose}
          onFocus={onFocus}
          title={p.name}
          kicker={p.type}
          actions={
            p.url && (
              <a className="icon-btn" href={p.url} target="_blank" rel="noreferrer" aria-label={`Visit ${p.name}`}>
                <ArrowUpRight weight="bold" size={16} />
              </a>
            )
          }
        >
          <ProjectBody project={p} />
        </Win>
      )
    }
    if (w.kind === 'demo') {
      const n = niches[w.niche]
      return (
        <Win key={w.id} win={w} onClose={onClose} onFocus={onFocus} title={w.business || n.brand} kicker="Live demo">
          <div className="proj__stage proj__stage--solo">
            <SiteMock niche={w.niche} business={w.business} layout={w.layout} accent={w.accent} />
          </div>
        </Win>
      )
    }
    return (
      <Win key={w.id} win={w} onClose={onClose} onFocus={onFocus} title="Terminal" kicker="Type help">
        <Terminal api={terminalApi} seed={w.seed} />
      </Win>
    )
  })
}
