// سكرينشوت سريع لتبويب الشات الحالي (chrome على 9223)
import { writeFileSync } from 'node:fs'
let id = 0
const pending = new Map()
const { webSocketDebuggerUrl } = await (await fetch('http://127.0.0.1:9223/json/version')).json()
const ws = new WebSocket(webSocketDebuggerUrl)
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const cur = ++id
    pending.set(cur, { resolve, reject })
    const msg = { id: cur, method, params }
    if (sessionId) msg.sessionId = sessionId
    ws.send(JSON.stringify(msg))
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout'))), 30000)
  })
}
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) {
    pending.get(m.id).resolve(m.result)
    pending.delete(m.id)
  }
})
const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json()
const page = targets.find((t) => t.type === 'page' && /5174|5173|5175/.test(t.url))
const { sessionId } = await send('Target.attachToTarget', { targetId: page.id, flatten: true })
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId)
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
writeFileSync('C:/Users/admin/AppData/Local/Temp/opencode/tab-ai-live.png', Buffer.from(shot.data, 'base64'))
console.log('saved')
ws.close()
process.exit(0)
