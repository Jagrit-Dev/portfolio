import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CalendarBlank, CaretLeft, CaretRight, SpeakerHigh, SpeakerSlash, TerminalWindow } from '@phosphor-icons/react'
import { sound } from './sound'
import { STATIONS } from './stations'
const Scene = lazy(() => import('./Scene'))
import Overlays from './Overlays'
import Tags from './Tags'
import Dock from './Dock'
import Windows from './Windows'
import { findProspect, profile, projects } from './data'

// Nav links: `at` lists the stations each one covers, so it stays lit across them.
const NAV_LINKS = [
  { label: 'Work', target: 'work', at: [1, 2, 3] },
  { label: 'Live demo', target: 'demo', at: [4] },
  { label: 'Contact', target: 'contact', at: [5] },
]

// Loading screen with a real progress bar. The number eases toward the target
// by writing straight to the DOM, so it never re-renders per frame.
function Boot({ progress, label, done }) {
  const num = useRef(null)
  const shown = useRef(0)
  useEffect(() => {
    let raf
    const tick = () => {
      shown.current += (progress - shown.current) * 0.12
      if (Math.abs(progress - shown.current) < 0.2) shown.current = progress
      if (num.current) num.current.textContent = Math.round(shown.current)
      if (shown.current !== progress) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  return (
    <div className="boot" data-done={done} aria-hidden={done}>
      <div className="boot__card" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Loading">
        <div className="boot__mark">
          <span className="boot__dots">
            <i />
            <i />
          </span>
          {profile.name}
        </div>
        <div className="boot__bar">
          <i style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <div className="boot__meta">
          <span>{label}</span>
          <span>
            <b ref={num}>0</b>%
          </span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const prospect = useMemo(findProspect, [])
  const [wins, setWins] = useState([])
  const [demo, setDemo] = useState({
    niche: prospect?.niche || 'bakery',
    business: prospect?.business || '',
    layout: prospect?.layout || null,
    accent: prospect?.accent || null,
  })
  const z = useRef(100)
  const slot = useRef(0)
  const railRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [peek, setPeek] = useState(false)
  // which station is in view; the island's label and actions follow it
  const [station, setStation] = useState(0)
  // touch has no hover, so a tap on the island's label opens and closes it
  const [islandOpen, setIslandOpen] = useState(false)
  const islandRef = useRef(null)
  useEffect(() => {
    if (!islandOpen) return
    const away = (e) => !islandRef.current?.contains(e.target) && setIslandOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [islandOpen])
  useEffect(() => setIslandOpen(false), [station])
  // a soft sound as the island opens and closes; the guard stops hover, focus and tap from doubling up
  const islandHot = useRef(false)
  const islandSound = useCallback((open) => {
    if (open === islandHot.current) return
    islandHot.current = open
    if (open) sound.expand()
    else sound.collapse()
  }, [])
  useEffect(() => {
    if (islandOpen) islandSound(true) // touch: opened by tapping the name
  }, [islandOpen, islandSound])
  const stationName = (i) => (i === 0 ? profile.name : STATIONS[i]?.label || '')
  const onProject = station >= 1 && station <= 3
  const stationProject = onProject ? projects.find((p) => p.id === STATIONS[station].project) : null
  const [boot, setBoot] = useState({ value: 6, label: 'Starting' })
  const bootStart = useRef(performance.now())
  // progress only ever moves forward
  const bump = useCallback((value, label) => setBoot((b) => (value > b.value ? { value, label } : b)), [])
  const finishBoot = useCallback(() => {
    bump(100, 'Ready')
    const wait = Math.max(500, 1100 - (performance.now() - bootStart.current))
    setTimeout(() => setReady(true), wait)
  }, [bump])
  // hero text waits (hidden) while loading, then plays its entrance once the loader lifts
  useLayoutEffect(() => {
    document.documentElement.dataset.boot = 'loading'
  }, [])
  useEffect(() => {
    if (!ready) return
    document.documentElement.dataset.boot = 'done'
    // the taskbar shows itself once, briefly, so people learn it is there
    const show = setTimeout(() => setPeek(true), 1800)
    const hide = setTimeout(() => setPeek(false), 4800)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [ready])
  useEffect(() => {
    bump(22, 'Loading fonts')
    document.fonts?.ready.then(() => bump(44, 'Loading the 3D engine'))
    import('./Scene').then(() => bump(66, 'Building the scene'))
  }, [bump])
  const scrollerRef = useRef(null)
  const scroll = useRef({ offset: 0, target: 0, teaseAt: 0 }).current
  if (import.meta.env.DEV) window.__scroll = scroll // handy for poking at motion in the console
  // the camera's one-off nudge toward the next device only plays until the first scroll
  const hasScrolled = useRef(false)
  const onScroll = (e) => {
    const el = e.currentTarget
    scroll.target = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)
    if (!hasScrolled.current && el.scrollTop > 4) {
      hasScrolled.current = true
      scroll.teaseAt = 0
    }
  }
  useEffect(() => {
    if (!ready) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // after a few idle seconds, the camera drifts toward the next device and eases back
    const tease = setTimeout(() => {
      if (!hasScrolled.current && !reduce) scroll.teaseAt = performance.now()
    }, 8200)
    return () => clearTimeout(tease)
  }, [ready, scroll])

  const open = useCallback((spec, drag, origin) => {
    z.current += 1
    const zi = z.current
    sound.open()
    setWins((ws) => {
      if (ws.some((w) => w.id === spec.id)) return ws.map((w) => (w.id === spec.id ? { ...w, z: zi, closing: false } : w))
      return [...ws, { ...spec, z: zi, slot: slot.current++, drag: drag || null, origin: origin || null }]
    })
  }, [])
  const openProject = useCallback(
    (p, drag, origin) => open({ id: 'p:' + p.id, kind: 'project', ref: p.id }, drag, origin),
    [open],
  )
  const openProjectById = useCallback((id) => open({ id: 'p:' + id, kind: 'project', ref: id }), [open])
  const openDemo = useCallback(
    (niche, business, layout, accent) =>
      open({
        id: `d:${niche}:${business.trim()}:${layout || ''}:${accent || ''}`,
        kind: 'demo',
        niche,
        business: business.trim(),
        layout: layout || null,
        accent: accent || null,
      }),
    [open],
  )
  const openTerminal = useCallback(() => open({ id: 'terminal', kind: 'terminal' }), [open])
  // from the contact station: open the terminal already asking the first hire question
  const openHire = useCallback(() => open({ id: 'terminal', kind: 'terminal', seed: 'hire jagrit' }), [open])
  // closing plays a short exit animation before the window is removed
  const close = useCallback((id) => {
    sound.close()
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, closing: true } : w)))
    setTimeout(() => setWins((ws) => ws.filter((w) => w.id !== id || !w.closing)), 260)
  }, [])

  // One wheel flick moves exactly one station. Trackpad inertia is swallowed
  // until the wheel goes quiet. Touch and keyboard use CSS scroll-snap instead.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let locked = false
    let lockedAt = 0
    let quiet
    const onWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaY) < 1) return
      e.preventDefault()
      clearTimeout(quiet)
      quiet = setTimeout(() => {
        // unlock only after the gesture has really finished
        if (performance.now() - lockedAt > 650) locked = false
        else quiet = setTimeout(() => (locked = false), 650 - (performance.now() - lockedAt))
      }, 140)
      if (locked) return
      const vh = el.clientHeight
      const now = Math.round(el.scrollTop / vh)
      const next = Math.min(STATIONS.length - 1, Math.max(0, now + (e.deltaY > 0 ? 1 : -1)))
      if (next === now) return
      locked = true
      lockedAt = performance.now()
      el.scrollTo({ top: next * vh, behavior: reduce ? 'auto' : 'smooth' })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      clearTimeout(quiet)
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  // sound: off by default, remembered once switched on
  const [soundOn, setSoundOn] = useState(sound.enabled)
  const toggleSound = () => {
    sound.set(!sound.enabled)
    setSoundOn(sound.enabled)
  }
  useEffect(() => {
    const UI = '.btn, .chip, .isl__link, .isl__step, .isl__mark, .isl__label, .icon-btn, .rail button, .tag'
    // the island's name and mark get no hover tick: entering them plays the expand sound instead
    const HOVER_UI = UI.replace('.isl__mark, .isl__label, ', '')
    const onOver = (e) => {
      const t = e.target.closest?.(HOVER_UI)
      if (t && !t.contains(e.relatedTarget)) sound.hover()
    }
    const onClick = (e) => {
      const t = e.target.closest?.(UI)
      if (t && !t.hasAttribute('data-sound-toggle')) sound.click()
    }
    document.addEventListener('pointerover', onOver)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick)
    }
  }, [])

  // the stage softly recedes while any window is open
  useEffect(() => {
    document.body.dataset.windows = String(wins.some((w) => !w.closing))
  }, [wins])
  const focus = useCallback((id) => {
    z.current += 1
    const zi = z.current
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: zi } : w)))
  }, [])

  const goTo = (target) => {
    const i = typeof target === 'number' ? target : target === 'work' ? 1 : STATIONS.findIndex((s) => s.key === target)
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: (Math.max(0, i) / (STATIONS.length - 1)) * (el.scrollHeight - el.clientHeight), behavior: 'smooth' })
  }

  const terminalApi = useMemo(
    () => ({
      openProject: openProjectById,
      openDemo,
      closeAll: () => setWins([]),
      tidy: () =>
        document.querySelectorAll('.win').forEach((el, i) => {
          el.style.left = 24 + i * 44 + 'px'
          el.style.top = 84 + i * 40 + 'px'
        }),
      goTo: (name) => goTo(name === 'home' ? 0 : name),
      cycleTheme: () => {
        const themes = ['vermilion', 'cobalt', 'forest']
        const cur = themes.indexOf(document.documentElement.dataset.theme || 'vermilion')
        const next = themes[(cur + 1) % themes.length]
        document.documentElement.dataset.theme = next
        return next
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openProjectById, openDemo],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input,textarea,select,[contenteditable]')) return
      if (e.key === '`' || e.key === '/') {
        e.preventDefault()
        openTerminal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openTerminal])

  useEffect(() => {
    if (!prospect) return
    const t = setTimeout(() => openDemo(prospect.niche, prospect.business, prospect.layout, prospect.accent), 2200)
    return () => clearTimeout(t)
  }, [prospect, openDemo])

  return (
    <>
      <header className="nav">
        <div
          className="isl"
          ref={islandRef}
          data-open={islandOpen}
          data-station={station}
          onPointerEnter={(e) => e.pointerType === 'mouse' && islandSound(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && islandSound(false)}
          onFocus={(e) => e.target.matches(':focus-visible') && islandSound(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && islandSound(false)}
        >
          <div className="isl__core">
            <button className="isl__mark" onClick={() => goTo(0)} aria-label="Back to the start">
              <i />
            </button>

            {onProject && (
              <button className="isl__step" onClick={() => goTo(station - 1)} aria-label={`Previous: ${stationName(station - 1)}`}>
                <CaretLeft weight="bold" size={14} />
              </button>
            )}
            <button className="isl__label" onClick={() => setIslandOpen((o) => !o)} aria-expanded={islandOpen}>
              {/* keyed, so the name swaps with a small slide whenever the station changes */}
              <span key={station}>{stationName(station)}</span>
            </button>
            {onProject && (
              <button className="isl__step" onClick={() => goTo(station + 1)} aria-label={`Next: ${stationName(station + 1)}`}>
                <CaretRight weight="bold" size={14} />
              </button>
            )}
            <i className="isl__ring" aria-hidden="true" />
          </div>

          <div className="isl__more">
            <div className="isl__more-in">
              <nav className="isl__links" aria-label="Sections">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.target}
                    className="isl__link"
                    data-active={l.at.includes(station)}
                    aria-current={l.at.includes(station) ? 'true' : undefined}
                    onClick={() => goTo(l.target)}
                  >
                    {l.label}
                  </button>
                ))}
              </nav>

              <div className="isl__tools">
                <button
                  className="icon-btn"
                  data-sound-toggle
                  title={soundOn ? 'Sound on' : 'Sound off'}
                  onClick={toggleSound}
                  aria-pressed={soundOn}
                  aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'}
                >
                  {soundOn ? <SpeakerHigh weight="regular" size={18} /> : <SpeakerSlash weight="regular" size={18} />}
                </button>
                <button className="icon-btn" title="Terminal ( / )" onClick={openTerminal} aria-label="Open terminal">
                  <TerminalWindow weight="regular" size={18} />
                </button>
              </div>

              {/* the one action that makes sense on this station */}
              {stationProject && (
                <button
                  className="btn btn--sm btn--glass"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    openProject(stationProject, null, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
                  }}
                >
                  Open project
                </button>
              )}
              {station === 4 && (
                <a className="btn btn--sm" href={profile.booking} target="_blank" rel="noreferrer">
                  <CalendarBlank weight="regular" size={18} />
                  Book a call
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <Tags />
      <Dock peek={peek} scrollerRef={scrollerRef} />      <Boot progress={boot.value} label={boot.label} done={ready} />

      <div className="canvas-wrap" data-ready={ready}>
        <Suspense fallback={null}>
          <Scene
            scroll={scroll}
            scrollerRef={scrollerRef}
            demo={demo}
            onOpenProject={openProject}
            onOpenTerminal={openHire}
            railRef={railRef}
            onStation={setStation}
            onProgress={bump}
            onReady={finishBoot}
          />
        </Suspense>
      </div>

      <div className="scroller" ref={scrollerRef} onScroll={onScroll}>
        {/* one full-height snap point per station */}
        {STATIONS.map((s) => (
          <div className="snap" key={s.key} />
        ))}
        <Overlays
          demo={demo}
          setDemo={setDemo}
          prospect={prospect}
          onOpenProject={openProject}
          onOpenDemo={openDemo}
          onOpenTerminal={openHire}
          goTo={goTo}
        />
      </div>

      <nav className="rail" ref={railRef} aria-label="Stations">
        <i className="rail__line" />
        {STATIONS.map((s, i) => (
          <button key={s.key} data-active={i === 0} onClick={() => goTo(i)} aria-label={s.label}>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      <Windows wins={wins} onClose={close} onFocus={focus} terminalApi={terminalApi} />
    </>
  )
}
