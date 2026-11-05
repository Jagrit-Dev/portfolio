import { useEffect, useRef } from 'react'
import { Barbell, Bread, Coffee, Scales, Tooth, Wrench } from '@phosphor-icons/react'
import { niches } from './data'

// One small tag rides at the bottom-right of the mouse and swaps through the
// kinds of business this studio builds for. Mouse-only; hidden over windows and
// the loader, dimmed over text and the nav.
const KINDS = [
  { key: 'bakery', Icon: Bread },
  { key: 'dental', Icon: Tooth },
  { key: 'gym', Icon: Barbell },
  { key: 'law', Icon: Scales },
  { key: 'plumber', Icon: Wrench },
  { key: 'cafe', Icon: Coffee },
]
const SWAP_MS = 2400
const HIDE = '.win, .boot, .dock'
const DIM = '.st__inner, .nav, .rail'

export default function Tags() {
  const root = useRef(null)
  const follower = useRef(null)
  const pills = useRef([])

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let mx = -300
    let my = -300
    let x = mx
    let y = my
    let seen = false
    let raf
    let active = 0

    const move = (e) => {
      mx = e.clientX
      my = e.clientY
      if (!seen) {
        seen = true
        x = mx
        y = my
      }
      const r = root.current
      r.dataset.on = 'true'
      r.dataset.hidden = e.target.closest?.(HIDE) ? 'true' : 'false'
      r.dataset.dim = e.target.closest?.(DIM) ? 'true' : 'false'
    }
    const leave = () => root.current && (root.current.dataset.on = 'false')

    const tick = () => {
      const px = x
      x += (mx - x) * 0.2
      y += (my - y) * 0.2
      const tilt = Math.max(-8, Math.min(8, (x - px) * 0.9))
      // sits below and to the right of the pointer
      follower.current.style.transform = `translate3d(${x + 16}px, ${y + 20}px, 0) rotate(${tilt}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const show = (i) => pills.current.forEach((el, k) => el && (el.dataset.active = String(k === i)))
    show(0)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const swap = reduce
      ? null
      : setInterval(() => {
          active = (active + 1) % KINDS.length
          show(active)
        }, SWAP_MS)

    document.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(swap)
      document.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div className="tags" ref={root} data-on="false" data-hidden="false" data-dim="false" aria-hidden="true">
      <div className="tag3" ref={follower}>
        <div className="tag3__stack">
          {KINDS.map(({ key, Icon }, i) => {
            const n = niches[key]
            return (
              <span
                key={key}
                className="tag3__pill"
                ref={(el) => (pills.current[i] = el)}
                data-active={i === 0}
                style={{ '--soft': n.palette.soft, '--hue': n.palette.accent }}
              >
                <span className="tag3__icon">
                  <Icon weight="duotone" size={15} />
                </span>
                {n.label}
                <i className="tag3__ping" />
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
