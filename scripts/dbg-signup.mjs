// اختبار حي كامل: تسجيل ليد ثم حساب ثم قراءة الشارة (chrome على 9223 + dev على 5174)
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
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout ' + method))), 90000)
  })
}
const opened = new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
const warns = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) {
    pending.get(m.id).resolve(m.result)
    pending.delete(m.id)
  } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'warning') {
    warns.push(m.params.args.map((a) => a.value ?? '').join(' ').slice(0, 200))
  }
})
const evaluate = (sessionId, expression) =>
  send('Runtime.evaluate', { expression, returnByValue: true }, sessionId).then((r) => r.result?.value)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let loadResolve
let loadFired = new Promise((r) => (loadResolve = r))
function armReload(ws2) {
  ws2.addEventListener('message', (ev) => {
    const m = JSON.parse(String(ev.data))
    if (m.method === 'Page.loadEventFired') {
      loadResolve()
      loadFired = new Promise((r) => (loadResolve = r))
    }
  })
}
armReload(ws)

await opened
const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }, sessionId)
await send('Page.enable', {}, sessionId)
await send('Runtime.enable', {}, sessionId)
await send('Page.navigate', { url: 'http://localhost:5174/' }, sessionId)
await loadFired
await sleep(2000)
await evaluate(sessionId, `localStorage.clear(); location.reload();`)
await loadFired
await sleep(2000)

// روح لتبويب الحاسبة (LeadGate)
await evaluate(sessionId, `document.querySelectorAll('nav button')[1].click()`)
await sleep(800)
// املأ الاسم والتليفون
await evaluate(sessionId, `(() => {
  const setVal = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(el.__proto__, 'value');
    d.set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll('input')];
  setVal(inputs[0], 'أحمد اختبار');
  setVal(inputs[1], '01012345678');
  return inputs.length;
})()`)
await sleep(400)
await evaluate(sessionId, `(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('ابدأ الحساب')); b.click(); return 'submitted'; })()`)
await sleep(4000)
const badge = await evaluate(sessionId, `(() => {
  const t = document.body.innerText;
  if (t.includes('محفوظ سحابياً')) return 'CLOUD';
  if (t.includes('وضع محلي')) return 'LOCAL';
  return 'UNKNOWN';
})()`)
console.log('BADGE-AFTER-SIGNUP:', badge)

// املأ الحاسبة: السن، الوزن، الطول
await evaluate(sessionId, `(() => {
  const setVal = (el, v) => {
    const d = Object.getOwnPropertyDescriptor(el.__proto__, 'value');
    d.set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const nums = [...document.querySelectorAll('input[type=number]')];
  setVal(nums[0], '28'); setVal(nums[1], '80'); setVal(nums[2], '175');
  const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('احسب سعراتي'));
  b.click();
  return 'calculated:' + nums.length;
})()`)
await sleep(6000)
const resultShown = await evaluate(sessionId, `document.body.innerText.includes('2226') || document.body.innerText.includes('سعرة / يوم') ? 'RESULT-OK' : 'RESULT-MISSING'`)
console.log('RESULT:', resultShown)
console.log('WARNINGS:', JSON.stringify(warns.filter((w) => /Supabase|supabase/i.test(w)).slice(-4)))
ws.close()
process.exit(0)
