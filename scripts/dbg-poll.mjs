// متابعة حالة الشات الحالي (chrome على 9223 شغال)
const CDP_PORT = 9223
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
    setTimeout(() => pending.has(cur) && (pending.delete(cur), reject(new Error('timeout ' + method))), 90000)
  })
}
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true })
  ws.addEventListener('error', reject, { once: true })
})
const geminiMsgs = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) {
    pending.get(m.id).resolve(m.result)
    pending.delete(m.id)
  } else if (m.method === 'Runtime.consoleAPICalled') {
    const args = (m.params.args || []).map((a) => a.value ?? `[${a.type}]`).join(' ')
    if (/Gemini|error/i.test(args)) geminiMsgs.push(`${m.params.type}: ${args}`.slice(0, 200))
  }
})
const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json()
const page = targets.find((t) => t.type === 'page' && /5174|5173|5175/.test(t.url))
if (!page) {
  console.log('TARGETS:', targets.map((t) => t.url))
  process.exit(1)
}
const { sessionId } = await send('Target.attachToTarget', { targetId: page.id, flatten: true })
await send('Runtime.enable', {}, sessionId)
const evaluate = (expression) =>
  send('Runtime.evaluate', { expression, returnByValue: true }, sessionId).then((r) => r.result.value)

for (let i = 0; i < 5; i++) {
  await new Promise((r) => setTimeout(r, 20000))
  const state = await evaluate(`(() => {
    const els = [...document.querySelectorAll('div')];
    let longest = '';
    els.forEach(d => { const t = d.textContent || ''; if (t.length > longest.length && t.length < 30000) longest = t; });
    return JSON.stringify({ len: longest.length, typing: document.body.innerText.includes('بيكتب') });
  })()`)
  console.log(`T+${(i + 1) * 20}s:`, state)
  const done = JSON.parse(state)
  if (!done.typing && done.len > 2500) break
}
console.log('GEMINI-LOGS:', JSON.stringify(geminiMsgs.slice(-5)))
ws.close()
process.exit(0)
