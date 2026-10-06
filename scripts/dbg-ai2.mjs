// فحص حي للشات مع التقاط رسائل الكونسول
import { writeFileSync } from 'node:fs'

const CDP_PORT = 9223
const OUT = 'C:/Users/admin/AppData/Local/Temp/opencode/tab-ai-live.png'

let id = 0
const pending = new Map()
const consoleMsgs = []
const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json()
const ws = new WebSocket(webSocketDebuggerUrl)
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const cur = ++id
    pending.set(cur, { resolve, reject })
    const msg = { id: cur, method, params }
    if (sessionId) msg.sessionId = sessionId
    ws.send(JSON.stringify(msg))
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout ' + method))), 90000)
  })
}
const opened = new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
let loadResolve
let loadFired = new Promise((r) => (loadResolve = r))
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) {
    pending.get(m.id).resolve(m.result)
    pending.delete(m.id)
  } else if (m.method === 'Page.loadEventFired') {
    loadResolve()
    loadFired = new Promise((r) => (loadResolve = r))
  } else if (m.method === 'Runtime.consoleAPICalled') {
    const args = (m.params.args || []).map((a) => a.value ?? `[${a.type}]`).join(' ')
    consoleMsgs.push(`${m.params.type}: ${args}`.slice(0, 300))
  }
})
const evaluate = (sessionId, expression) =>
  send('Runtime.evaluate', { expression, returnByValue: true }, sessionId).then((r) => r.result.value)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await opened
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId)
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Page.navigate', { url: 'http://localhost:5174/' }, sessionId)
await loadFired
await sleep(2000)

await evaluate(sessionId, `(() => {
  localStorage.setItem('mm_lead', JSON.stringify({id:'local-test',name:'أحمد',phone:'01012345678',createdAt:new Date().toISOString(),cloud:false}));
  localStorage.setItem('mm_result', JSON.stringify({age:28,gender:'male',heightCm:175,weightKg:80,bodyFatPct:20,activityId:'moderate',activityLabel:'نشاط متوسط',goalId:'cut',goalLabel:'تنشيف',bmr:{mifflin:1759,harris:1841,katch:1752},tdeeMifflin:2726,tdeeHarris:2853,tdeeKatch:2716,targetCalories:2226,macros:{proteinG:176,fatG:67,carbsG:230},savedAt:new Date().toISOString()}));
  location.reload();
  return 'seeded';
})()`)
await loadFired
await sleep(2000)
await evaluate(sessionId, `(() => { document.querySelectorAll('nav button')[3].click(); return 'ai-tab'; })()`)
await sleep(800)
await evaluate(sessionId, `(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('ابدأ التوزيع')); if(b){b.click();return 'started';} return 'missing'; })()`)
await sleep(30000)
const state = await evaluate(sessionId, `(() => {
  const box = document.querySelectorAll('div');
  let longest = '';
  box.forEach(d => { const t = d.textContent || ''; if (t.length > longest.length && t.length < 20000) longest = t; });
  return JSON.stringify({ len: longest.length, head: longest.slice(0, 150) });
})()`)
console.log('REPLY-STATE:', state)
console.log('CONSOLE:', JSON.stringify(consoleMsgs.slice(-8), null, 1))
const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
writeFileSync(OUT, Buffer.from(shot.data, 'base64'))
console.log('saved', OUT)
ws.close()
process.exit(0)
