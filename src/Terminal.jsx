import { useEffect, useRef, useState } from 'react'
import { demoNiches, niches, profile, projects } from './data'

const HELP = [
  ['ls', 'list my projects'],
  ['open <name>', 'open a project window'],
  ['niches', 'list demo niches'],
  ['demo <niche> [business]', 'build a live demo site'],
  ['hire jagrit', 'start a project with me'],
  ['goto <place>', 'jump: home, demo, contact'],
  ['theme', 'swap the accent colour'],
  ['tidy', 'arrange open windows'],
  ['closeall', 'close all windows'],
  ['clear', 'clear this screen'],
]

const HIRE_STEPS = [
  ['name', 'Your name?'],
  ['business', 'Business name and what you do?'],
  ['need', 'What do you need? (new site, redesign, web app, other)'],
  ['email', 'Best email to reach you?'],
]

// `seed` is a command to run as soon as the terminal opens (the contact station
// uses it to start the hire flow straight away).
export default function Terminal({ api, seed }) {
  const [lines, setLines] = useState([
    { k: 'out', t: 'Hi. I am Jagrit. Type help to see what I can do.' },
  ])
  const [value, setValue] = useState('')
  const wizard = useRef(null)
  const history = useRef({ list: [], i: 0 })
  const input = useRef(null)
  const body = useRef(null)

  useEffect(() => {
    input.current?.focus()
  }, [])
  useEffect(() => {
    body.current.scrollTop = body.current.scrollHeight
  }, [lines])

  const print = (...rows) => setLines((l) => [...l, ...rows.map((r) => (typeof r === 'string' ? { k: 'out', t: r } : r))])

  const finishHire = (answers) => {
    const subject = `Website project: ${answers.business}`
    const text = `Name: ${answers.name}\nBusiness: ${answers.business}\nNeed: ${answers.need}\nReply to: ${answers.email}`
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
    print({ k: 'ok', t: 'Got it. Your mail app will open with everything filled in. Just hit send.' })
    window.location.href = href
  }

  const run = (raw) => {
    const cmdline = raw.trim()
    print({ k: 'in', t: cmdline })
    if (!cmdline) return

    if (wizard.current) {
      const w = wizard.current
      if (/^(cancel|exit)$/i.test(cmdline)) {
        wizard.current = null
        return print('Cancelled. No hard feelings.')
      }
      w.answers[HIRE_STEPS[w.step][0]] = cmdline
      w.step += 1
      if (w.step < HIRE_STEPS.length) return print({ k: 'ask', t: HIRE_STEPS[w.step][1] })
      wizard.current = null
      return finishHire(w.answers)
    }

    const [cmd, ...rest] = cmdline.split(/\s+/)
    const arg = rest.join(' ')
    switch (cmd.toLowerCase()) {
      case 'help':
        return print(...HELP.map(([c, d]) => ({ k: 'out', t: `${c.padEnd(26)}${d}` })))
      case 'ls':
        return print(...projects.map((p) => ({ k: 'out', t: `${p.id.padEnd(18)}${p.type}` })))
      case 'open': {
        const q = arg.toLowerCase()
        const p = projects.find((x) => x.id.startsWith(q) || x.name.toLowerCase().includes(q))
        if (!q || !p) return print({ k: 'err', t: 'No project by that name. Try ls.' })
        api.openProject(p.id)
        return print({ k: 'ok', t: `Opening ${p.name}.` })
      }
      case 'niches':
        return print(...demoNiches.map((n) => ({ k: 'out', t: `${n.key.padEnd(12)}${n.label}` })))
      case 'demo': {
        const [key, ...biz] = rest
        if (!key || !niches[key] || niches[key].hidden)
          return print({ k: 'err', t: 'Usage: demo <niche> [business name]. See niches.' })
        api.openDemo(key, biz.join(' '))
        return print({ k: 'ok', t: `Built a ${niches[key].label.toLowerCase()} site${biz.length ? ' for ' + biz.join(' ') : ''}.` })
      }
      case 'hire':
        wizard.current = { step: 0, answers: {} }
        return print(
          { k: 'out', t: 'Great. Four quick questions (type cancel to stop).' },
          { k: 'ask', t: HIRE_STEPS[0][1] },
        )
      case 'goto':
        if (!['home', 'demo', 'contact'].includes(arg.toLowerCase()))
          return print({ k: 'err', t: 'Try: goto home, goto demo or goto contact.' })
        api.goTo(arg.toLowerCase())
        return print({ k: 'ok', t: 'On our way.' })
      case 'theme':
        return print({ k: 'ok', t: `Accent is now ${api.cycleTheme()}.` })
      case 'tidy':
        api.tidy()
        return print({ k: 'ok', t: 'Tidied.' })
      case 'closeall':
        api.closeAll()
        return
      case 'clear':
        return setLines([])
      default:
        return print({ k: 'err', t: `Unknown command: ${cmd}. Type help.` })
    }
  }

  useEffect(() => {
    if (seed) run(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onKeyDown = (e) => {
    const h = history.current
    if (e.key === 'Enter') {
      if (value.trim()) h.list.push(value)
      h.i = h.list.length
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      h.i = Math.max(0, h.i - 1)
      setValue(h.list[h.i] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      h.i = Math.min(h.list.length, h.i + 1)
      setValue(h.list[h.i] || '')
    }
  }

  return (
    <div className="term" onClick={() => input.current?.focus()}>
      <div className="term__out" ref={body} aria-live="polite">
        {lines.map((l, i) => (
          <div key={i} className={`term__line term__line--${l.k}`}>
            {l.k === 'in' && <span className="term__prompt">&gt;</span>}
            {l.t}
          </div>
        ))}
      </div>
      <label className="term__row">
        <span className="term__prompt">&gt;</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command"
          placeholder={wizard.current ? 'type your answer' : 'try: hire jagrit'}
        />
      </label>
    </div>
  )
}
