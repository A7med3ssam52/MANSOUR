import { useEffect, useRef, useState } from 'react'
import Icon from './icons'
import { buildInitialPrompt, distributeMeals, sendMessage } from '../services/ai'

// عرض خفيف للـ Markdown (عناوين، عريض، قوائم) بدون مكتبات
function inlineRich(text, keyPrefix) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((p, i) =>
      p.startsWith('**') && p.endsWith('**') && p.length > 4 ? (
        <b key={`${keyPrefix}-b${i}`}>{p.slice(2, -2)}</b>
      ) : (
        <span key={`${keyPrefix}-s${i}`}>{p}</span>
      ),
    )
}

function RichText({ text }) {
  const lines = String(text).split('\n')
  const blocks = []
  let list = []
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pr-5">
          {list}
        </ul>,
      )
      list = []
    }
  }
  lines.forEach((line, i) => {
    const t = line.trim()
    if (/^#{1,4}\s/.test(t)) {
      flushList()
      blocks.push(
        <div key={`h-${i}`} className="pt-1 text-[15px] font-extrabold">
          {inlineRich(t.replace(/^#+\s*/, ''), `h${i}`)}
        </div>,
      )
    } else if (/^([*•-]|\d+[.)])\s/.test(t)) {
      list.push(<li key={`li-${i}`}>{inlineRich(t.replace(/^([*•-]|\d+[.)])\s*/, ''), `li${i}`)}</li>)
    } else if (t === '') {
      flushList()
    } else if (/^---+$/.test(t)) {
      flushList()
      blocks.push(<hr key={`hr-${i}`} className="my-1 border-brand-200" />)
    } else {
      flushList()
      blocks.push(<p key={`p-${i}`}>{inlineRich(t, `p${i}`)}</p>)
    }
  })
  flushList()
  return <div className="space-y-1.5">{blocks}</div>
}

// اقتراحات ذكية حسب سياق المحادثة — الموضوع اللي العميل سأل عنه يختفي ويحل محله جديد
const SUGGESTION_TOPICS = [
  { q: 'بديل أرخص', icon: 'coins', match: /بديل|أرخص|رخيص|تكلفة|ميزانية/ },
  { q: 'زود البروتين', icon: 'protein', match: /بروتين|عضل/ },
  { q: 'بدون بيض', icon: 'ban', match: /بيض/ },
  { q: 'بدون لبن', icon: 'ban', match: /لبن|زبادي|جبنة|قريش|رايب/ },
  { q: 'وجبة قبل التمرين', icon: 'activity', match: /تمرين|جيم/ },
  { q: 'سناك سريع', icon: 'sparkles', match: /سناك/ },
  { q: 'اشرب ميه قد إيه', icon: 'flame', match: /ميه|ماء|مياه|شرب/ },
]

function getSuggestions(messages) {
  const asked = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.text)
    .join('\n')
  return SUGGESTION_TOPICS.filter((t) => !t.match.test(asked)).slice(0, 3)
}

export default function MansourAI({ lead, result }) {  const [mealCount, setMealCount] = useState(3)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const boxRef = useRef(null)

  // الكشف التدريجي: أي رد (بث أو بديل) يظهر حرف بحرف لحد ما يخلص
  const [typed, setTyped] = useState({ index: -1, chars: 0 })
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const loadingRef = useRef(loading)
  loadingRef.current = loading
  const typedRef = useRef(typed)
  typedRef.current = typed

  useEffect(() => {
    const id = setInterval(() => {
      const { index, chars } = typedRef.current
      if (index < 0) return
      const full = messagesRef.current[index]?.text ?? ''
      if (!full) return
      if (chars >= full.length) {
        if (!loadingRef.current) setTyped({ index: -1, chars: 0 })
        return
      }
      setTyped({ index, chars: Math.min(full.length, chars + 5) })
    }, 45)
    return () => clearInterval(id)
  }, [])

  const meals = result ? distributeMeals(result.targetCalories, result.macros, mealCount) : []
  const suggestions = getSuggestions(messages)

  function scrollDown() {
    requestAnimationFrame(() => {
      boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  async function start() {
    if (!result || loading) return
    setLoading(true)
    try {
      // فقاعة المستخدم أولاً — العميل يشوف الرسالة اللي رايحة للبوت
      const next = [{ role: 'user', text: buildInitialPrompt(result, mealCount) }]
      setMessages([...next, { role: 'ai', text: '' }])
      setTyped({ index: next.length, chars: 0 })
      const reply = await sendMessage({
        history: [],
        userText: '',
        lead,
        result,
        mealCount,
        onToken: (t) => {
          setMessages([...next, { role: 'ai', text: t }])
          scrollDown()
        },
      })
      setMessages([...next, { role: 'ai', text: reply }])
      scrollDown()
    } finally {
      setLoading(false)
    }
  }

  async function ask(text) {
    const q = (text ?? input).trim()
    if (!q || loading || !result) return
    const next = [...messages, { role: 'user', text: q }]
    setMessages(next)
    setTyped({ index: next.length, chars: 0 })
    setInput('')
    setLoading(true)
    scrollDown()
    try {
      let lastScroll = 0
      const reply = await sendMessage({
        history: next,
        userText: q,
        lead,
        result,
        mealCount,
        onToken: (t) => {
          setMessages([...next, { role: 'ai', text: t }])
          const now = Date.now()
          if (now - lastScroll > 500) {
            lastScroll = now
            scrollDown()
          }
        },
      })
      setMessages([...next, { role: 'ai', text: reply }])
      scrollDown()
    } finally {
      setLoading(false)
    }
  }

  if (!result) return null

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
      <div className="bg-brand-900 p-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Icon name="bot" className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-base font-extrabold">منصور بوت</h2>
              <p className="mt-0.5 text-[11px] font-semibold text-white/75">
                مساعدك لتوزيع وجباتك
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setMealCount(n)}
                className={`min-h-[36px] rounded-full px-3 text-xs font-extrabold ${mealCount === n ? 'bg-white text-brand-800' : 'text-white/80'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="p-4">
          <p className="text-[13px] font-semibold leading-relaxed text-gray-600">
            جاهز أوزع لك <b className="text-brand-800">{result.targetCalories} سعرة</b> ({result.goalLabel}) على {mealCount} وجبات:
          </p>
          <div className="mt-3 grid gap-2">
            {meals.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-2xl bg-brand-50 p-3">
                <span className="text-sm font-extrabold text-brand-900">{m.name}</span>
                <span className="text-sm font-extrabold tabular-nums text-brand-700">{m.calories} سعرة</span>
              </div>
            ))}
          </div>
          <button
            onClick={start}
            disabled={loading}
            className="mt-3 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99] disabled:opacity-50"
          >
            <Icon name="sparkles" className="h-5 w-5" />
            {loading ? 'ثواني...' : 'ابدأ التوزيع مع منصور بوت'}
          </button>
        </div>
      ) : (
        <>
          <div ref={boxRef} className="chat-scroll h-[52dvh] min-h-[320px] space-y-2 overflow-y-auto bg-brand-50/50 p-3 md:h-[420px]">
            {messages.map((m, i) => {
              const isTyping = m.role === 'ai' && typed.index === i && (typed.chars < m.text.length || loading)
              const visible = m.role === 'ai' && typed.index === i ? m.text.slice(0, typed.chars) : m.text
              return (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 text-[13px] font-semibold leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white shadow'
                        : 'border border-brand-100 bg-white text-gray-800 shadow'
                    }`}
                  >
                    {m.role === 'ai' ? (
                      visible ? (
                        <>
                          <RichText text={visible} />
                          {isTyping && <span className="typing-caret" aria-hidden="true" />}
                        </>
                      ) : (
                        <span className="typing-dots" aria-label="جاري الكتابة">
                          <span />
                          <span />
                          <span />
                        </span>
                      )
                    ) : (
                      <span className="whitespace-pre-line">{m.text}</span>
                    )}
                  </div>
                </div>
              )
            })}
            {loading && <p className="text-center text-[11px] font-bold text-brand-600">منصور بوت بيكتب...</p>}
          </div>
          {suggestions.length > 0 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-brand-100 p-3 pb-1">
              {suggestions.map(({ q, icon }) => (
                <button
                  key={q}
                  onClick={() => ask(q)}
                  className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-brand-200 px-4 text-xs font-bold text-brand-700"
                >
                  <Icon name={icon} className="h-4 w-4" />
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask()
            }}
            className="flex gap-2 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اسأل عن وجباتك..."
              className="min-h-[52px] flex-1 rounded-2xl border border-brand-200 px-4 text-base font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white disabled:opacity-50"
              aria-label="إرسال"
            >
              <Icon name="send" className="h-5 w-5 -scale-x-100" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}
