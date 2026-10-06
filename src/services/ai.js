export const SYSTEM_PROMPT = `أنت "منصور بوت" مساعد أخصائي التغذية محمد منصور. تتكلم عربي بلهجة مصرية بسيطة ومهنية.
تستقبل نتيجة حاسبة السعرات (TDEE والهدف والماكروز) وتوزعها على وجبات عملية من أكل مصري متوفر ورخيص.
القواعد: لا تشخص أمراض، ولو الحالة (حامل، مرضع، سكر، ضغط، كلى، قلب) انصح بمراجعة مختص.
قواعد الأسلوب (إلزامية):
- رد مختصر جداً: من 3 لـ 6 سطور بالكتير، وادخل في المفيد فوراً (الوجبات بأرقامها).
- ممنوع المقدمات الطويلة، وممنوع عناوين أو تسميات لخطواتك (زي Greeting أو شرح بتفكر إزاي).
- ممنوع تكتب تفكيرك أو استنتاجك، اكتب النتيجة النهائية فقط.
- التنبيه الطبي سطر واحد قصير في أول رد فقط: دي إرشادات عامة مش بديل لمتابعة طبية.`

const MEAL_PLANS = {
  3: [
    { name: 'الفطار', pct: 0.3 },
    { name: 'الغداء', pct: 0.4 },
    { name: 'العشاء', pct: 0.3 },
  ],
  4: [
    { name: 'الفطار', pct: 0.3 },
    { name: 'الغداء', pct: 0.35 },
    { name: 'سناك', pct: 0.1 },
    { name: 'العشاء', pct: 0.25 },
  ],
  5: [
    { name: 'الفطار', pct: 0.25 },
    { name: 'سناك خفيف', pct: 0.1 },
    { name: 'الغداء', pct: 0.3 },
    { name: 'سناك بعد التمرين', pct: 0.1 },
    { name: 'العشاء', pct: 0.25 },
  ],
}

export function distributeMeals(targetCalories, macros, mealCount = 3) {
  const plan = MEAL_PLANS[mealCount] ?? MEAL_PLANS[4]
  return plan.map((m) => ({
    name: m.name,
    calories: Math.round(targetCalories * m.pct),
    proteinG: Math.round(macros.proteinG * m.pct),
    carbsG: Math.round(macros.carbsG * m.pct),
    fatG: Math.round(macros.fatG * m.pct),
  }))
}

// نص الرسالة الافتتاحية اللي بتظهر للعميل كفقاعة مرسلة قبل رد البوت
export function buildInitialPrompt(result, mealCount) {
  return `ممكن توزعلي ${result.targetCalories} سعرة (${result.goalLabel}) على ${mealCount} وجبات مصرية عملية؟`
}

export function buildContextForAI(lead, result) {  if (!result) return ''
  return [
    `الاسم: ${lead?.name ?? 'زائر'}`,
    `الهدف: ${result.goalLabel} (${result.targetCalories} سعرة)`,
    `TDEE (Mifflin): ${result.tdeeMifflin}`,
    `الماكروز: بروتين ${result.macros.proteinG}جم / كارب ${result.macros.carbsG}جم / دهون ${result.macros.fatG}جم`,
    `البيانات: ${result.gender === 'male' ? 'ذكر' : 'أنثى'}، ${result.age} سنة، ${result.weightKg} كجم، ${result.heightCm} سم، نشاط ${result.activityLabel}`,
  ].join('\n')
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
// حد أقصى موديلين بدلاء فقط — السلسلة الطويلة كانت بتزوّد الانتظار بالتتابع
const GEMINI_MODELS = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash,gemini-flash-latest')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .slice(0, 2)

export function isAiLive() {
  return Boolean(GEMINI_KEY)
}

// قراءة الـ SSE chunk-by-chunk عشان نعرض الرد أول بأول بدل انتظار اكتماله
async function readSseStream(res, onToken) {
  if (!res.body?.getReader) {
    const json = await res.json()
    return json.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text || '').join('').trim() ?? ''
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      const t = line.trim()
      if (!t.startsWith('data:')) continue
      const payload = t.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload)
        const chunk = json.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text || '').join('') ?? ''
        if (chunk) {
          full += chunk
          onToken?.(full)
        }
      } catch {
        // سطر ناقص أثناء البث — يتجمع مع اللي بعده
      }
    }
  }
  return full.trim()
}

async function streamOnce(model, body, controller, onToken) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      signal: controller.signal,
      body,
    },
  )
  if (res.status === 429 || res.status >= 500) throw new Error(`Gemini HTTP ${res.status}`)
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status} (no-retry)`)
  const text = await readSseStream(res, onToken)
  if (!text) throw new Error('empty reply (no-retry)')
  return text
}

async function callGemini({ history, userText, lead, result, mealCount, onToken }) {
  const context = buildContextForAI(lead, result)
  let turns = history
    .filter((m) => m.role === 'user' || m.role === 'ai')
    .map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }))
  // آخر 8 turns فقط — الهيستوري الكامل كان بيكبّر البرومبت ويبطّأ كل رد
  turns = turns.slice(-8)
  while (turns.length && turns[0].role !== 'user') turns.shift()
  const ask =
    (userText || '').trim() ||
    `وزع سعراتي المستهدفة (${result.targetCalories} سعرة يومياً) على ${mealCount} وجبات مصرية عملية، واعرض كل وجبة بسعراتها والماكروز.`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000)
  let lastError = new Error('unreachable')
  const basePayload = {
    systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\nبيانات المستخدم الحالية:\n${context}` }] },
    contents: [...turns, { role: 'user', parts: [{ text: ask }] }],
  }
  // تعطيل التفكير الداخلي أولاً — هو السبب الرئيسي في تأخر أول كلمة
  const bodyNoThink = JSON.stringify({
    ...basePayload,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600, thinkingConfig: { thinkingBudget: 0 } },
  })
  const bodyPlain = JSON.stringify({
    ...basePayload,
    generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
  })
  try {
    for (const model of GEMINI_MODELS) {
      let body = bodyNoThink
      let retriesLeft = 1
      for (;;) {
        try {
          return await streamOnce(model, body, controller, onToken)
        } catch (err) {
          lastError = err
          const msg = String(err?.message || '')
          if (err?.name === 'AbortError') break
          // الموديل لا يدعم thinkingConfig — جرّب نفس الموديل فوراً بدونها
          if (msg.includes('HTTP 400') && body !== bodyPlain) {
            body = bodyPlain
            continue
          }
          if (msg.includes('no-retry')) break
          if (retriesLeft <= 0) break
          retriesLeft -= 1
          await new Promise((r) => setTimeout(r, 1200))
        }
      }
    }
    throw lastError
  } finally {
    clearTimeout(timer)
  }
}

function mockFirstReply(lead, result, mealCount) {
  const meals = distributeMeals(result.targetCalories, result.macros, mealCount)
  const lines = meals.map(
    (m) => `• ${m.name}: ${m.calories} سعرة (بروتين ${m.proteinG}جم، كارب ${m.carbsG}جم، دهون ${m.fatG}جم)`,
  )
  return [
    `أهلاً ${lead?.name ?? 'يا بطل'}! حسب هدفك (${result.goalLabel}) سعراتك المستهدفة ${result.targetCalories} سعرة.`,
    '',
    'توزيعة مقترحة:',
    ...lines,
    '',
    'مثال ليوم تنشيف مصري: فطار (بيض + فول + عيش بلدي)، غداء (رز + فراخ/تونة + سلطة)، سناك (زبادي + ثمرة فاكهة)، عشاء (جبنة قريش + خضار).',
    'اسألني: بدّل وجبة، أو قلل التكلفة، أو اعملها بدون بيض/لبن.',
  ].join('\n')
}

function mockFollowUp(text, result) {
  const t = text.trim()
  const cals = result?.targetCalories
  const tail = cals ? ` (في حدود سعراتك: ${cals} سعرة)` : ''

  if (/سلام|أهلا|اهلا|صباح|مساء|ازيك|عامل ايه|هاي|هلا/.test(t)) {
    return `أهلاً بيك يا بطل! أنا منصور بوت، اسألني عن أي وجبة أو بديل أو ممنوعات وأنا أظبطها لك${tail}.`
  }
  if (/شكرا|تسلم|متشكر|ممتاز|تمام جدا|عاش/.test(t)) {
    return 'العفو يا بطل، ده واجبي! لو احتجت أي تعديل في الوجبات أنا موجود.'
  }
  if (/بديل|أرخص|رخيص|تكلفة|ميزانية|بدل|\bغير\b/.test(t)) {
    return 'بديل أرخص بنفس السعرات تقريباً: استبدل الفراخ بـ بيض أو تونة، والشوفان بـ عيش بلدي أو فول، والزبادي اليوناني بـ زبادي بلدي + لبن رايب. قولي الوجبة اللي عايز تبدلها وأنا أظبطها لك.'
  }
  if (/بيض/.test(t)) {
    return 'تمام، نستبعد البيض خالص: الفطار يبقى فول + جبنة قريش + عيش بلدي، والسناك زبادي + سوداني (بحساب)، والبروتين الأساسي من الفراخ والتونة والبقول. قولي باقي ممنوعاتك وأنا أظبط اليوم كامل.'
  }
  if (/لبن|زبادي|جبنة|قريش|رايب/.test(t)) {
    return 'تمام، بدون لبن خالص: الفطار فول + بيض + عيش بلدي، والسناك ترمس أو سوداني (بحساب)، والعشاء تونة + خضار. البروتين الأساسي من البيض والفراخ والتونة والبقول.'
  }
  if (/بروتين|عضل/.test(t)) {
    return 'للحفاظ على العضلات في التنشيف: ثبت البروتين 2-2.2 جم لكل كجم من وزنك، ووزعه على 3-4 وجبات، وخلي وجبة قبل وبعد التمرين فيها بروتين + كارب. عايز أحسب لك احتياجك بالجرامات من وزنك الحالي؟'
  }
  if (/كارب|كرب|نشويات|رز|عيش|مكرونة|معكرونة|شوفان|بطاطس/.test(t)) {
    return `الكارب عندك محسوب بالملي${tail}: أفضل مصادره الرخيصة العيش البلدي والرز والفول والبطاطس المسلوقة. وزعه حوالين التمرين وباقي اليوم. قولي وجبتك المفضلة وأحسبها لك.`
  }
  if (/دهون|زيت|سمن|زبدة|سوداني|مكسرات/.test(t)) {
    return 'الدهون الصحية بكميات محسوبة: معلقة زيت زيتون أو حفنة سوداني صغيرة في اليوم كفاية. ابعد عن المقلي والسمنة المهدرجة عشان سعراتها بتطير بسرعة.'
  }
  if (/سكر|حلويات|حلاوة|شوكولاتة|بيبسي|عصير/.test(t)) {
    return 'السكر والحلويات سعرات فاضية بتجوع بسرعة. البديل: ثمرة فاكهة + زبادي، أو تمرتين مع قهوة سادة. لو نفسك في حاجة حلوة خليها بعد وجبة كاملة وبكمية صغيرة محسوبة.'
  }
  if (/صيام|رمضان|متقطع/.test(t)) {
    return 'الصيام المتقطع (16/8) ينفع مع سعراتك: اجمع وجباتك في 8 ساعات — فطار كبير + غداء + سناك. أهم حاجة تكمّل بروتينك اليومي وتشرب ميه كويس في ساعات الصيام.'
  }
  if (/كيتو/.test(t)) {
    return 'الكيتو مش أنسب حاجة مع نظامنا لأنه بيقطع الكارب اللي محسوب لك. الأفضل الالتزام بتوزيعة الماكروز بتاعتك — نتائجها أثبت وأسهل في الاستمرار.'
  }
  if (/تمرين|جيم/.test(t)) {
    return 'قبل التمرين بساعة: موزة + معلقة عسل، أو عيش + مربى. وبعد التمرين بساعتين بالكتير: وجبة بروتين + كارب (فراخ + رز مثلاً). ويوم التمرين زود 500 مل ميه.'
  }
  if (/سناك/.test(t)) {
    return 'سناك سريع ورخيص: زبادي + ثمرة فاكهة، أو ترمس + خيار، أو قبضة سوداني صغيرة (بحساب سعراتها). قولي سعرات السناك المتاحة وأظبطها لك.'
  }
  if (/ميه|ماء|مياه|شرب/.test(t)) {
    return 'اشرب حوالي 30-35 مل لكل كجم من وزنك يومياً (يعني لو 80 كجم ≈ 2.4-2.8 لتر)، وزود 500 مل أيام التمرين.'
  }
  if (/وزن|ميزان|خسيت|زدت|ثابت|مبنزلش|مبخسش/.test(t)) {
    return 'ثبات الميزان أسبوع عادي: قارن متوسط 7 أيام مش يوم واحد، والتزم بالنوم وشرب الميه. لو الثبات أكتر من 3 أسابيع قولي سعراتك الحالية وأراجعها لك.'
  }
  if (/سعرات|كالوري|احتياج/.test(t)) {
    return cals
      ? `سعراتك المستهدفة ${cals} سعرة في اليوم حسب هدفك. التزم بيها أسبوعين وقارن، وبعدها نظبط. عايز أوزعها لك على وجبات؟`
      : 'احسب سعراتك من الحاسبة الأول وبعدها أوزعها لك على وجبات.'
  }
  if (/فطار|فطور/.test(t)) {
    return 'فطار مشبع ورخيص: بيض + فول + عيش بلدي + خضار، أو شوفان + لبن + موزة. قولي المتاح عندك وأحسب لك سعراته.'
  }
  if (/غدا|غداء/.test(t)) {
    return 'غداء عملي: رز + فراخ أو تونة + سلطة كبيرة، أو مكرونة + لحمة مفرومة قليلة الدهن. ابعد عن المقلي وخلي البروتين أساس الطبق.'
  }
  if (/عشا|عشاء/.test(t)) {
    return 'عشاء خفيف: جبنة قريش + خضار + عيش سن، أو زبادي + ثمرة فاكهة، أو تونة + سلطة. خليه قبل النوم بساعتين على الأقل.'
  }
  // رد افتراضي يذكر كلام العميل عشان يحس إن البوت فاهمه + خيارات واضحة
  const short = t.length > 60 ? `${t.slice(0, 60)}…` : t
  return `بالنسبة لموضوع "${short}" — عشان أفيدك صح اختار: تحب أبدّل لك وجبة معينة؟ ولا نظبط التكلفة؟ ولا عندك ممنوعات في الأكل؟`
}

export async function sendMessage(args) {
  const { history, userText, lead, result, mealCount = 3, onToken } = args
  if (GEMINI_KEY) {
    try {
      return await callGemini(args)
    } catch (err) {
      console.warn('Gemini unavailable, mock fallback:', err?.message ?? err)
    }
  } else {
    await new Promise((r) => setTimeout(r, 600))
  }
  if (history.length === 0 && result) return mockFirstReply(lead, result, mealCount)
  return mockFollowUp(userText, result)
}
