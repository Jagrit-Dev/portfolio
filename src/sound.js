// Tiny synthesized UI sounds (Web Audio, no files). Off by default.
// The audio context is only created after a user gesture.
const KEY = 'jm-sound'
let ctx = null
let master = null
let enabled = false
let lastHover = 0

try {
  enabled = localStorage.getItem(KEY) === 'on'
} catch {
  /* storage can be blocked; sound simply starts off */
}

function ensure() {
  if (ctx) return ctx.state === 'suspended' ? (ctx.resume(), ctx) : ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  return ctx
}

// one short enveloped tone
function tone({ f0, f1 = f0, dur = 0.06, vol = 0.05, type = 'sine', delay = 0 }) {
  const c = ensure()
  if (!c || !enabled) return
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f0, t)
  o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export const sound = {
  get enabled() {
    return enabled
  },
  set(on) {
    enabled = on
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {
      /* ignore */
    }
    if (on) {
      ensure()
      tone({ f0: 660, f1: 990, dur: 0.1, vol: 0.05 })
    }
  },
  // soft, barely-there tick when a device or control is hovered
  hover() {
    const now = performance.now()
    if (now - lastHover < 140) return
    lastHover = now
    tone({ f0: 1500, f1: 1100, dur: 0.035, vol: 0.018 })
  },
  // a quiet key-press "thock"
  click() {
    tone({ f0: 240, f1: 110, dur: 0.07, vol: 0.07, type: 'triangle' })
    tone({ f0: 1800, f1: 900, dur: 0.02, vol: 0.02, delay: 0.002 })
  },
  // the island opening: a soft two-note bloom, quieter than a window opening
  expand() {
    tone({ f0: 440, f1: 660, dur: 0.12, vol: 0.026 })
    tone({ f0: 660, f1: 990, dur: 0.14, vol: 0.014, delay: 0.045 })
  },
  collapse() {
    tone({ f0: 620, f1: 420, dur: 0.09, vol: 0.016 })
  },
  open() {
    tone({ f0: 360, f1: 720, dur: 0.16, vol: 0.045 })
    tone({ f0: 540, f1: 1080, dur: 0.18, vol: 0.025, delay: 0.04 })
  },
  close() {
    tone({ f0: 520, f1: 260, dur: 0.12, vol: 0.04 })
  },
}
