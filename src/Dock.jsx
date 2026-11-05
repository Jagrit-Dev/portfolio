import { useRef, useState } from 'react'
import { SOCIALS } from './socials'

// An auto-hiding taskbar for the social links. Nothing is drawn until the pointer
// reaches the bottom edge (or keyboard focus lands on it); then the icons rise in,
// and slide-over magnification lifts the icon under the pointer and, more softly,
// its neighbours. It has no background of its own, like a taskbar with the bar removed.
export default function Dock({ peek, scrollerRef }) {
  const [hover, setHover] = useState(false)
  const items = useRef([])

  // the strip sits above the page, so pass wheel scrolling through to the stage
  const pass = (e) => {
    scrollerRef.current?.dispatchEvent(new WheelEvent('wheel', { deltaY: e.deltaY, deltaX: e.deltaX, cancelable: true }))
  }

  // magnification: each icon's lift follows its distance from the pointer.
  // Written straight to CSS variables, so sliding across never re-renders React.
  const magnify = (e) => {
    items.current.forEach((el) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const d = Math.abs(e.clientX - (r.left + r.width / 2))
      el.style.setProperty('--mag', Math.exp(-((d / 54) ** 2)).toFixed(3))
    })
  }
  const settle = () => items.current.forEach((el) => el?.style.setProperty('--mag', '0'))

  return (
    <>
      {/* shared gradient for the Instagram mark (kept outside the dock so it also works on touch layouts) */}
      <svg className="gradient-defs" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FEDA75" />
            <stop offset="0.3" stopColor="#FA7E1E" />
            <stop offset="0.6" stopColor="#D62976" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      </svg>

      <footer
        className="dock"
        data-open={hover || peek}
        onWheel={pass}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => {
          setHover(false)
          settle()
        }}
        onFocus={(e) => e.target.matches(':focus-visible') && setHover(true)}
        onBlur={() => setHover(false)}
      >
        <nav className="dock__row" aria-label="Social links" onPointerMove={magnify}>
          {SOCIALS.map(({ key, label, href, Icon, color }, i) => (
            <a
              key={key}
              ref={(el) => (items.current[i] = el)}
              className="dock__item"
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              data-key={key}
              data-label={label}
              style={{ '--c': color, '--i': i }}
            >
              <Icon weight="fill" size={20} />
              <i className="dock__dot" />
            </a>
          ))}
        </nav>
      </footer>
    </>
  )
}
