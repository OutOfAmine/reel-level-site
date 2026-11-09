// Recording mode. Open the site with ?demo (optionally &speed=1.5) and press the button: the page
// drives itself, stopping at each section, and a drawn cursor uses the real controls.
// scripts/record.mjs sets window.demoMouse / demoClick / demoDown / demoUp so hover and drag fire
// for real. By hand it falls back to DOM clicks.
// Needs: window.__lenis set by your smooth-scroll setup, and CSS for .demo-start and .demo-cursor.
import { useEffect, useState } from 'react'

const params = new URLSearchParams(window.location.search)
const ENABLED = params.has('demo')
const SPEED = Math.max(0.25, parseFloat(params.get('speed') || '1'))

const wait = (ms) => new Promise((r) => setTimeout(r, ms / SPEED))
const linear = (t) => t
const smooth = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const $ = (s) => document.querySelector(s)
const topOf = (el) => el.getBoundingClientRect().top + window.scrollY

function scrollTo(y, seconds, easing) {
  window.__lenis?.scrollTo(y, { duration: seconds / SPEED, easing, force: true })
  if (!window.__lenis) window.scrollTo(0, y)
  return wait(seconds * 1000)
}

const mouse = { x: window.innerWidth * 0.62, y: window.innerHeight * 0.7 }
let cursorEl = null

async function place(x, y) {
  mouse.x = x
  mouse.y = y
  if (cursorEl) cursorEl.style.transform = `translate(${x}px, ${y}px)`
  if (window.demoMouse) await window.demoMouse(x, y)
}

async function moveTo(el, ms = 700) {
  const r = el.getBoundingClientRect()
  const [x, y] = [r.left + r.width / 2, r.top + r.height / 2]
  const [x0, y0] = [mouse.x, mouse.y]
  const t0 = performance.now()
  for (;;) {
    const t = Math.min(1, (performance.now() - t0) / (ms / SPEED))
    await place(x0 + (x - x0) * smooth(t), y0 + (y - y0) * smooth(t))
    if (t === 1) break
    await new Promise(requestAnimationFrame)
  }
}

async function click(el, ms) {
  if (!el) return
  await moveTo(el, ms)
  if (window.demoClick) return window.demoClick(mouse.x, mouse.y)
  document.elementFromPoint(mouse.x, mouse.y)?.click()
}

// for anything that only responds to a real drag
export async function drag(el, dx, dy = 0) {
  await moveTo(el, 800)
  await window.demoDown?.()
  const [x0, y0] = [mouse.x, mouse.y]
  for (let k = 1; k <= 24; k++) {
    await place(x0 + (dx * k) / 24, y0 + (dy * k) / 24)
    await wait(22)
  }
  await window.demoUp?.()
}

// An example action. Scroll so its target is on screen first: a click below the fold fails silently.
async function exampleBooking() {
  await click($('.your-first-control'), 800)
  await wait(900)
}

// [selector, seconds of travel, action on arrival, seconds of stay, mode]
// mode 'through': play a scroll-scrubbed section at an even pace, start to finish
// mode 'center':  stop with the element centred in the viewport
const STEPS = [
  ['#first-section', 10, null, 1],
  ['#interactive-section', 4, exampleBooking, 1],
  ['.scrubbed-scene', 16, null, 1, 'through'],
  ['.offer-deck', 5, null, 4, 'center'],
  ['footer', 6, null, 3],
]

async function run() {
  document.documentElement.classList.add('is-demo')
  cursorEl = document.createElement('div')
  cursorEl.className = 'demo-cursor'
  cursorEl.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M4 2.5 L4 19.5 L8.6 15.3 L11.6 22 L14.6 20.7 L11.7 14.1 L18 14.1 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>'
  document.body.appendChild(cursorEl)
  await scrollTo(0, 0.01, linear)
  await place(mouse.x, mouse.y)
  await wait(2200)
  for (const [sel, sec, action, stay, mode] of STEPS) {
    const el = $(sel)
    if (!el) continue
    const vh = window.innerHeight
    if (mode === 'through') {
      if (Math.abs(window.scrollY - topOf(el)) > 4) await scrollTo(topOf(el), 1, smooth)
      await scrollTo(topOf(el) + el.offsetHeight - vh, sec, linear)
    } else {
      const top = mode === 'center' ? topOf(el) + el.offsetHeight / 2 - vh / 2 : topOf(el) - 70
      await scrollTo(Math.min(top, document.documentElement.scrollHeight - vh), sec, smooth)
      if (action) await action(el)
    }
    await wait(stay * 1000)
  }
  await wait(1500)
  cursorEl.remove()
  document.documentElement.classList.remove('is-demo')
}

export default function Demo() {
  const [state, setState] = useState('idle')
  useEffect(() => {
    if (!ENABLED) return
    const onKey = (e) => e.key === 'Escape' && window.location.reload()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  if (!ENABLED || state === 'running') return null
  return (
    <button
      className="demo-start"
      onClick={async () => {
        setState('running')
        await run()
        setState('done')
      }}
    >
      {state === 'done' ? 'Replay' : 'Start demo'}
    </button>
  )
}
