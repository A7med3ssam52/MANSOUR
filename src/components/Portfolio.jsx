import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './icons'

const RESULTS = [
  'فقدان الوزن بصورة تدريجية ومستدامة.',
  'تحسين جودة واختيار الأطعمة.',
  'بناء عادات غذائية يمكن الاستمرار عليها.',
  'زيادة الوعي بالسلوكيات التي تؤثر في الوزن والصحة.',
  'الوصول إلى نظام غذائي يتناسب مع الحياة اليومية وليس العكس.',
]

// صور النتائج مرتبة من الأحجام المتقاربة: مربعات → عريضة → متوسطة → طويلة
const RESULT_IMAGES = [
  // مربعات 1080×1080 (قبل / بعد)
  ...[
    'Brown Customer before and after Instagram Post_20240613_184443_0000.png',
    'Brown Customer before and after Instagram Post_20240726_213804_0000.png',
    'Brown Customer before and after Instagram Post_20240727_152324_0000.png',
    'Brown Customer before and after Instagram Post_20240926_004424_0000.png',
    'Neutral Minimalist Modern Hair Beauty Salon Before After Instagram Post_20240503_182336_0000.png',
    'Neutral Minimalist Modern Hair Beauty Salon Before After Instagram Post_20240503_183434_0000.png',
    'Neutral Minimalist Modern Hair Beauty Salon Before After Instagram Post_20240520_152335_0000.png',
    'Neutral Minimalist Modern Hair Beauty Salon Before After Instagram Post_20240520_152427_0000.png',
    'Neutral Minimalist Modern Hair Beauty Salon Before After Instagram Post_20240520_153155_0000.png',
  ].map((f, i) => ({ src: `/${encodeURI(f)}`, label: `تحول ${i + 1}` })),
  // لقطات عريضة (مرتبة تصاعدياً بالارتفاع)
  ...[
    'Screenshot_٢٠٢٣٠٧١٦_١٩٠٩٥٧_Telegram.jpg',
    '٢٠٢٣٠٧١٦_١٩١٠١٧.jpg',
    'Screenshot_٢٠٢٦٠٧١٦_٢٣٣٤٥٥_WhatsApp.jpg',
    'Screenshot_٢٠٢٣٠٧١٦_١٩١٢٠٨_Telegram.jpg',
    'Screenshot_٢٠٢٤٠٣١٩_٠٠٤٠١٦_WhatsApp.jpg',
    'Screenshot_٢٠٢٦٠٧١٦_١٢١٤٤٨_WhatsApp.jpg',
    'Screenshot_٢٠٢٣٠٧١٦_١٩٢٠٤٧_WhatsApp.jpg',
    'Screenshot_٢٠٢٤٠٤٠٩_١٩١٣١٦_WhatsApp.jpg',
    'Screenshot_٢٠٢٣٠٧١٢_٢٣٤٨٥١_WhatsApp.jpg',
    'Screenshot_٢٠٢٤٠٣١٨_٢٣٢٢٤٧_WhatsApp.jpg',
  ].map((f, i) => ({ src: `/${encodeURI(f)}`, label: `رأي عميل ${i + 1}` })),
  // لقطات متوسطة
  ...[
    'Screenshot_٢٠٢٤٠٤٠٩_١٩١٣٢١_WhatsApp.jpg',
    'Screenshot_٢٠٢٦٠٧١٦_١٢١٥٢٧_WhatsApp.jpg',
    'Screenshot_٢٠٢٤٠٤١٥_١٨٣٧٠٨_WhatsApp.jpg',
    'Screenshot_٢٠٢٤٠٤١٠_٢١١٢٥١_WhatsApp.jpg',
  ].map((f, i) => ({ src: `/${encodeURI(f)}`, label: `رأي عميل ${i + 11}` })),
  // طويلة
  ...[
    'Screenshot_٢٠٢٤١٠١٢_٢١٣٩٣٠_WhatsApp.jpg',
    'Screenshot_٢٠٢٤١٠١٢_٢٢٠٠٤٠_WhatsApp.jpg',
  ].map((f, i) => ({ src: `/${encodeURI(f)}`, label: `رأي عميل ${i + 15}` })),
]

function ResultsSlider() {
  const total = RESULT_IMAGES.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const touchX = useRef(null)

  const go = useCallback((n) => setIndex(((n % total) + total) % total), [total])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  // تشغيل تلقائي يقف مع التفاعل أو العرض الكامل
  useEffect(() => {
    if (paused || lightbox) return
    const id = setTimeout(next, 5000)
    return () => clearTimeout(id)
  }, [index, paused, lightbox, next])

  // كيبورد + قفل السكرول في العرض الكامل
  useEffect(() => {
    if (!lightbox) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') next()
      if (e.key === 'ArrowRight') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, next, prev])

  const cur = RESULT_IMAGES[index]

  return (
    <section className="mt-6 md:mt-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold text-brand-700">
          <Icon name="chart" className="h-4 w-4" />
          النتائج
        </span>
        <h2 className="mt-2 text-xl font-extrabold text-brand-900 md:text-2xl">تحولات وآراء عملائي</h2>
        <p className="mt-1 text-[13px] font-semibold text-gray-500">اسحب أو استخدم الأسهم — اضغط على الصورة للعرض الكامل</p>
      </div>

      {/* العارض الرئيسي */}
      <div
        className="relative mt-4 touch-pan-y select-none overflow-hidden rounded-[28px] bg-brand-950 shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX
          setPaused(true)
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touchX.current ?? 0)
          if (dx < -40) next()
          else if (dx > 40) prev()
        }}
      >
        {/* خلفية ضبابية من نفس الصورة */}
        <img key={`bg-${index}`} src={cur.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
        <div className="absolute inset-0 bg-black/25" />
        <button
          onClick={() => setLightbox(true)}
          className="relative block h-[420px] w-full cursor-zoom-in md:h-[540px]"
          aria-label={`عرض ${cur.label} بالحجم الكامل`}
        >
          <img
            key={index}
            src={cur.src}
            alt={cur.label}
            draggable={false}
            className="slide-fade absolute inset-0 h-full w-full object-contain p-3"
          />
        </button>

        {/* العدّاد */}
        <span className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-extrabold tabular-nums text-white backdrop-blur-sm">
          <span dir="ltr">{index + 1} / {total}</span>
        </span>
        <span className="absolute left-3 top-3 max-w-[45%] truncate rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          {cur.label}
        </span>

        {/* الأسهم */}
        <button
          onClick={prev}
          aria-label="السابق"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-lg transition active:scale-95"
        >
          <Icon name="arrow" className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="التالي"
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-lg transition active:scale-95"
        >
          <Icon name="arrow" className="h-5 w-5 rotate-180" />
        </button>

        {/* شريط التقدم + إيقاف مؤقت */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/55 to-transparent p-3">
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'تشغيل تلقائي' : 'إيقاف مؤقت'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-extrabold text-white backdrop-blur-sm"
          >
            {paused ? '▶' : '⏸'}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* المصغرات */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {RESULT_IMAGES.map((img, i) => (
          <button
            key={img.src}
            onClick={() => go(i)}
            aria-label={`صورة ${i + 1}`}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
              i === index ? 'border-brand-600 shadow' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img.src} alt="" loading="lazy" draggable={false} className="h-full w-full bg-brand-50 object-cover" />
          </button>
        ))}
      </div>

      {/* تحميل مسبق للجيران */}
      <img src={RESULT_IMAGES[(index + 1) % total].src} alt="" aria-hidden="true" className="hidden" />
      <img src={RESULT_IMAGES[(index - 1 + total) % total].src} alt="" aria-hidden="true" className="hidden" />

      {/* العرض الكامل */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 p-3" onClick={() => setLightbox(false)}>
          <div className="flex items-center justify-between text-white">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold tabular-nums">
              <span dir="ltr">{index + 1} / {total}</span> • {cur.label}
            </span>
            <button
              onClick={() => setLightbox(false)}
              aria-label="إغلاق"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg font-extrabold"
            >
              ✕
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img key={`lb-${index}`} src={cur.src} alt={cur.label} className="slide-fade max-h-full max-w-full rounded-2xl object-contain" />
            <button
              onClick={prev}
              aria-label="السابق"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <Icon name="arrow" className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="التالي"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <Icon name="arrow" className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function Portfolio() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 md:max-w-4xl md:px-8 md:py-10">
      {/* البطاقة التعريفية */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 p-6 text-center text-white shadow-lg md:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <img
          src="/mansour.jpg"
          alt="د. محمد منصور"
          className="relative mx-auto h-28 w-28 rounded-3xl object-cover shadow-xl ring-4 ring-white/40 md:h-36 md:w-36"
        />
        <h1 className="relative mt-4 text-2xl font-extrabold md:text-4xl">د. محمد منصور</h1>
        <p className="relative mt-1 inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-bold md:text-sm">
          أخصائي تغذية
        </p>
        <p className="relative mx-auto mt-4 max-w-2xl text-[13px] font-semibold leading-relaxed text-white/90 md:text-base">
          أعمل في مجال التغذية بهدف تقديم نهج علمي وعملي يساعد الأشخاص على بناء علاقة أكثر
          وعيًا واستدامة مع الطعام، بعيدًا عن الحميات القاسية والحلول المؤقتة.
        </p>
      </section>

      {/* التايم لاين */}
      <section className="relative mt-6 md:mt-8">
        <div aria-hidden="true" className="absolute bottom-4 right-[27px] top-4 w-0.5 bg-gradient-to-b from-brand-300 via-brand-200 to-brand-100" />

        <div className="space-y-4 md:space-y-5">
          {/* 1 */}
          <article className="relative flex gap-4">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
              <Icon name="user" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 rounded-3xl border border-brand-100 bg-white p-4 shadow-sm md:p-5">
              <span className="text-[11px] font-extrabold text-brand-500">01 • البداية</span>
              <h2 className="mt-1 text-base font-extrabold text-brand-900 md:text-lg">التقييم قبل الخطة</h2>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                أعتمد في عملي على التقييم الفردي، وفهم نمط الحياة والسلوك الغذائي، وتحليل
                الاحتياجات الغذائية، ثم تصميم خطط غذائية مرنة تتناسب مع أهداف كل شخص وحالته
                واحتياجاته اليومية.
              </p>
            </div>
          </article>

          {/* 2 */}
          <article className="relative flex gap-4">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
              <Icon name="target" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 rounded-3xl border border-brand-100 bg-white p-4 shadow-sm md:p-5">
              <span className="text-[11px] font-extrabold text-brand-500">02 • مع العملاء</span>
              <h2 className="mt-1 text-base font-extrabold text-brand-900 md:text-lg">نتائج حقيقية قابلة للاستمرار</h2>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                خلال تجربتي مع العملاء، كان التركيز الأساسي دائمًا على تحقيق نتائج حقيقية قابلة
                للاستمرار، سواء كان الهدف فقدان الوزن، تحسين العادات الغذائية، تنظيم الوجبات، أو
                الوصول إلى نمط حياة صحي أكثر توازنًا.
              </p>
            </div>
          </article>

          {/* 3 */}
          <article className="relative flex gap-4">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
              <Icon name="chart" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 rounded-3xl border border-brand-100 bg-white p-4 shadow-sm md:p-5">
              <span className="text-[11px] font-extrabold text-brand-500">03 • الفلسفة</span>
              <h2 className="mt-1 text-base font-extrabold text-brand-900 md:text-lg">نتائج تتجاوز الميزان</h2>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                أؤمن أن نجاح أي خطة غذائية لا يُقاس فقط بعدد الكيلوجرامات التي يفقدها الشخص،
                وإنما بقدرته على الاستمرار وتحسين سلوكه وعلاقته بالطعام. لذلك أعمل مع عملائي على
                تحقيق نتائج تشمل:
              </p>
              <ul className="mt-3 space-y-2">
                {RESULTS.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 rounded-2xl bg-brand-50 p-2.5 text-[12px] font-bold leading-relaxed text-brand-900 md:text-[13px]"
                  >
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                وقد ساعدتني هذه المنهجية في تحقيق نتائج ملموسة مع العديد من العملاء، مع اختلاف
                الأهداف والظروف والاحتياجات من شخص لآخر.
              </p>
            </div>
          </article>

          {/* 4 */}
          <article className="relative flex gap-4">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
              <Icon name="flame" className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1 rounded-3xl border border-brand-100 bg-white p-4 shadow-sm md:p-5">
              <span className="text-[11px] font-extrabold text-brand-500">04 • المنهج</span>
              <h2 className="mt-1 text-base font-extrabold text-brand-900 md:text-lg">منهجي في التغذية</h2>
              <p className="mt-2 text-[13px] font-extrabold leading-relaxed text-brand-800 md:text-sm">
                لا توجد حمية واحدة مناسبة للجميع.
              </p>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                كل شخص لديه نمط حياة، وتفضيلات غذائية، واحتياجات، وتحديات مختلفة؛ لذلك أتعامل مع
                التغذية باعتبارها عملية فردية تعتمد على فهم الشخص أولًا، ثم بناء الخطة المناسبة له.
              </p>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-600 md:text-sm">
                هدفي ليس فقط أن أخبرك ماذا تأكل، بل أن أساعدك على فهم لماذا تأكله، وكيف تختار
                الأفضل، وكيف تستمر.
              </p>
            </div>
          </article>

          {/* الاقتباس الختامي */}
          <article className="relative flex gap-4">
            <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-md">
              <Icon name="sparkles" className="h-6 w-6" />
            </span>
            <blockquote className="min-w-0 flex-1 rounded-3xl bg-brand-900 p-4 text-white shadow-md md:p-5">
              <p className="text-sm font-extrabold leading-relaxed md:text-base">
                "التغيير الحقيقي لا يبدأ من قائمة الممنوعات، بل من فهم أفضل لجسمك وعاداتك وطريقة
                تعاملك مع الطعام."
              </p>
              <footer className="mt-2 text-[11px] font-bold text-white/70">— د. محمد منصور</footer>
            </blockquote>
          </article>
        </div>
      </section>

      {/* CTA */}
      <ResultsSlider />

      <section className="mt-6 rounded-[28px] border border-brand-100 bg-white p-5 text-center shadow-sm md:mt-8 md:p-6">
        <h2 className="text-base font-extrabold text-brand-900 md:text-lg">جاهز تبدأ رحلتك؟</h2>
        <p className="mt-1 text-[13px] font-semibold text-gray-500">
          احسب سعراتك ووزعها على وجبات مصرية عملية مع منصور بوت
        </p>
        <Link
          to="/"
          className="mt-4 flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99]"
        >
          <Icon name="calculator" className="h-5 w-5" />
          احسب سعراتك الآن
        </Link>
      </section>
    </main>
  )
}
