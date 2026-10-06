import { writeFileSync } from 'node:fs'

// فحص layout الموبايل عبر Chrome DevTools Protocol (Node فقط بدون مكتبات)
// الاستخدام: node scripts/dbg-mobile.mjs
const CDP_PORT = 9222
const OUT = 'C:/Users/admin/AppData/Local/Temp/opencode/mobile-cdp.png'

let id = 0
const pending = new Map()
const { webSocketDebuggerUrl } = await (
  await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)
).json()
const ws = new WebSocket(webSocketDebuggerUrl)
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const cur = ++id
    pending.set(cur, { resolve, reject })
    const msg = { id: cur, method, params }
    if (sessionId) msg.sessionId = sessionId
    ws.send(JSON.stringify(msg))
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout ' + method))), 20000)
  })
}
const loadPromise = new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
let loadFiredResolve
const loadFired = new Promise((r) => (loadFiredResolve = r))
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) {
    pending.get(m.id).resolve(m.result)
    pending.delete(m.id)
  } else if (m.method === 'Page.loadEventFired') {
    loadFiredResolve()
  }
})

await loadPromise
const { targetId } = await send('Target.createTarget', { url: 'http://localhost:5173/' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Emulation.setDeviceMetricsOverride', {
  width: 390, height: 844, deviceScaleFactor: 2, mobile: true,
}, sessionId)
await send('Page.enable', {}, sessionId)
await send('Page.navigate', { url: 'http://localhost:5173/' }, sessionId)
await loadFired
await new Promise((r) => setTimeout(r, 2500))
const evalRes = await send('Runtime.evaluate', {
  expression: `(() => { const bad = [...document.querySelectorAll('body *')].filter(e => e.scrollWidth - e.clientWidth > 5).slice(0,12).map(e => ({tag:e.tagName, cls:String(e.className).slice(0,90), sw:e.scrollWidth, cw:e.clientWidth})); return JSON.stringify({innerW: window.innerWidth, docSW: document.documentElement.scrollWidth, bodySW: document.body.scrollWidth, n: bad.length, bad}); })()`,
  returnByValue: true,
}, sessionId)
console.log('METRICS:', evalRes.result.value)
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
console.log('saved', OUT)
ws.close()
process.exit(0)
