#!/usr/bin/env node
// Visual audit: scrolls a whole page, screenshots every step, builds contact sheets, reports errors.
// usage: node audit.mjs <url> <outdir> [stepPx=720] [width=1920] [height=1080]
import puppeteer from 'puppeteer-core'
import ffmpegPath from 'ffmpeg-static'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'

const [url, out, step = '720', width = '1920', height = '1080'] = process.argv.slice(2)
if (!url || !out) {
  console.error('usage: node audit.mjs <url> <outdir> [stepPx] [width] [height]')
  process.exit(1)
}

export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]
  const hit = candidates.find((p) => p && existsSync(p))
  if (!hit) throw new Error('Chrome not found. Set CHROME_PATH.')
  return hit
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const W = +width
const H = +height
mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: 'new',
  defaultViewport: { width: W, height: H },
  args: ['--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
const errors = new Set()
page.on('pageerror', (e) => errors.add(e.message))
page.on('response', (r) => {
  if (r.status() >= 400) errors.add(`${r.status()} ${r.url()}`)
})
await page.goto(url, { waitUntil: 'load', timeout: 90000 })

// preloaders and lazy layout: wait until the page height has stopped changing
let total = 0
for (let stable = 0, k = 0; stable < 4 && k < 60; k++) {
  await wait(1000)
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  stable = h === total && h > H ? stable + 1 : 0
  total = h
}
await wait(2000)
let shots = 0
for (let y = 0; y < total - H + +step; y += +step) {
  const target = Math.min(y, total - H)
  await page.evaluate((v) => (window.__lenis ? window.__lenis.scrollTo(v, { immediate: true, force: true }) : window.scrollTo(0, v)), target)
  await wait(900)
  await page.screenshot({ path: `${out}/${String(shots++).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 75 })
}
await browser.close()

execFileSync(ffmpegPath, ['-v', 'error', '-y', '-start_number', '0', '-i', `${out}/%03d.jpg`, '-vf', 'scale=480:-1,tile=4x6:padding=4', '-q:v', '4', `${out}/sheet_%d.jpg`])
console.log(JSON.stringify({ pageHeight: total, shots, sheets: `${out}/sheet_*.jpg`, errors: [...errors].slice(0, 30) }, null, 1))
