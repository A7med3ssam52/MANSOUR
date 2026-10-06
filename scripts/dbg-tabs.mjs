// فحص كل تبويبات الموبايل (390px) مع بيانات مزروعة مسبقاً
// الاستخدام: node scripts/dbg-tabs.mjs
import { writeFileSync } from 'node:fs'

const CDP_PORT = 9222
const OUT_DIR = 'C:/Users/admin/AppData/Local/Temp/opencode'

let id = 0
const pending = new Map()
const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)).json()
const ws = new WebSocket(webSocketDebuggerUrl)
function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const cur = ++id
    pending.set(cur, { resolve, reject })
    const msg = { id: cur, method, params }
    if (sessionId) msg.sessionId = sessionId
    ws.send(JSON.stringify(msg))
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout ' + method))), 25000)
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
await send('Page.navigate', { url: 'http://localhost:5173/' }, sessionId)
await loadFired
await sleep(1500)

// زرع بيانات ليد + نتيجة ثم إعادة تحميل
await evaluate(sessionId, `(() => {
  localStorage.setItem('mm_lead', JSON.stringify({name:'أحمد',phone:'01012345678',createdAt:new Date().toISOString()}));
  localStorage.setItem('mm_result', JSON.stringify({age:28,gender:'male',heightCm:175,weightKg:80,bodyFatPct:20,activityId:'moderate',activityLabel:'نشاط متوسط (رياضة 3-5 أيام)',goalId:'cut',goalLabel:'تنشيف (خسارة ~0.5 كجم/أسبوع)',bmr:{mifflin:1759,harris:1841,katch:1752},tdeeMifflin:2726,tdeeHarris:2853,tdeeKatch:2716,targetCalories:2226,macros:{proteinG:176,fatG:67,carbsG:230},savedAt:new Date().toISOString()}));
  location.reload();
  return 'seeded';
})()`)
await loadFired
await sleep(2000)

async function shotTab(btnIndex, name, extra) {
  await evaluate(sessionId, `(() => { document.querySelectorAll('nav button')[${btnIndex}].click(); window.scrollTo(0,0); return 'ok'; })()`)
  await sleep(1200)
  if (extra) {
    await evaluate(sessionId, extra)
    await sleep(2500)
  }
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId)
  writeFileSync(`${OUT_DIR}/tab-${name}.png`, Buffer.from(shot.data, 'base64'))
  const metrics = await evaluate(sessionId, `JSON.stringify({docSW: document.documentElement.scrollWidth, innerW: window.innerWidth})`)
  console.log(name, metrics)
}

await shotTab(1, 'calc')
await shotTab(2, 'result')
await shotTab(3, 'ai-start')
await shotTab(3, 'ai-chat', `(() => { const btns=[...document.querySelectorAll('button')]; const b=btns.find(x=>x.textContent.includes('ابدأ التوزيع')); if(b){b.click();return 'started';} return 'already'; })()`)
ws.close()
process.exit(0)
