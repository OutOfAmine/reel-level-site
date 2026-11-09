#!/usr/bin/env node
// Films a site's demo mode from the real screen: Chrome in kiosk mode, ffmpeg grabbing the display
// until the demo ends. Don't touch the machine during the take: anything on screen gets filmed.
// usage: node record.mjs "<url with ?demo>" <out.mp4> [fps=60] [width=1920] [height=1080]
import puppeteer from 'puppeteer-core'
import ffmpegPath from 'ffmpeg-static'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'

const [url, out, fps = '60', width = '1920', height = '1080'] = process.argv.slice(2)
if (!url || !out) {
  console.error('usage: node record.mjs "<url?demo>" <out.mp4> [fps] [width] [height]')
  process.exit(1)
}

const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p))
if (!chrome) throw new Error('Chrome not found. Set CHROME_PATH.')

const size = `${width}x${height}`
const grab = {
  win32: ['-f', 'gdigrab', '-framerate', fps, '-draw_mouse', '0', '-offset_x', '0', '-offset_y', '0', '-video_size', size, '-i', 'desktop'],
  linux: ['-f', 'x11grab', '-framerate', fps, '-draw_mouse', '0', '-video_size', size, '-i', process.env.DISPLAY || ':0'],
  darwin: ['-f', 'avfoundation', '-framerate', fps, '-capture_cursor', '0', '-i', process.env.SCREEN_INDEX || '1:none'],
}[process.platform]
if (!grab) throw new Error(`Unsupported platform: ${process.platform}`)

const file = resolve(out)
mkdirSync(dirname(file), { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: false,
  defaultViewport: null,
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--kiosk', '--window-position=0,0', `--window-size=${width},${height}`, '--disable-infobars', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${tmpdir()}/reel-level-site-rec`],
})
const [page] = await browser.pages()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(url, { waitUntil: 'load', timeout: 90000 })

// the demo's drawn cursor drives the real mouse, so :hover and pointer events fire for real
await page.exposeFunction('demoMouse', (x, y) => page.mouse.move(x, y))
await page.exposeFunction('demoClick', (x, y) => page.mouse.click(x, y))
await page.exposeFunction('demoDown', () => page.mouse.down())
await page.exposeFunction('demoUp', () => page.mouse.up())
await page.bringToFront()
await wait(9000) // videos, fonts and images settle

await page.click('.demo-start') // clicked before filming starts, so the button is never in the take
await page.mouse.move(+width - 1, +height - 1)
const started = Date.now()
const ff = spawn(ffmpegPath, ['-y', ...grab, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '14', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'ignore', 'ignore'] })
while (await page.evaluate(() => document.documentElement.classList.contains('is-demo')).catch(() => false)) await wait(500)
ff.stdin.write('q')
await new Promise((r) => ff.on('close', r))
await browser.close()
console.log(JSON.stringify({ file, seconds: Math.round((Date.now() - started) / 1000), errors }))
