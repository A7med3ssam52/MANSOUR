import Icon from './icons'

const FLOATING_FOODS = [
  { emoji: '🥑', style: { top: '8%', left: '6%' }, size: 'text-4xl md:text-5xl', anim: 'nutrition-float', duration: '6s', delay: '0s', opacity: 'opacity-30' },
  { emoji: '🥦', style: { top: '16%', left: '82%' }, size: 'text-3xl md:text-5xl', anim: 'nutrition-drift', duration: '8s', delay: '0.6s', opacity: 'opacity-25' },
  { emoji: '🍎', style: { top: '58%', left: '3%' }, size: 'text-3xl md:text-4xl', anim: 'nutrition-drift', duration: '9s', delay: '1.2s', opacity: 'opacity-20' },
  { emoji: '🥕', style: { top: '68%', left: '88%' }, size: 'text-3xl md:text-5xl', anim: 'nutrition-float', duration: '7s', delay: '0.3s', opacity: 'opacity-25' },
  { emoji: '🍋', style: { top: '38%', left: '12%' }, size: 'text-2xl md:text-3xl', anim: 'nutrition-float', duration: '5.5s', delay: '1.8s', opacity: 'opacity-20' },
  { emoji: '🥚', style: { top: '78%', left: '45%' }, size: 'text-2xl md:text-3xl', anim: 'nutrition-drift', duration: '10s', delay: '0.9s', opacity: 'opacity-20' },
  { emoji: '🍅', style: { top: '12%', left: '48%' }, size: 'text-2xl md:text-4xl', anim: 'nutrition-float', duration: '6.5s', delay: '2.1s', opacity: 'opacity-20' },
  { emoji: '🥗', style: { top: '44%', left: '90%' }, size: 'text-4xl md:text-6xl', anim: 'nutrition-float', duration: '7.5s', delay: '1.5s', opacity: 'opacity-20' },
  { emoji: '🌿', style: { top: '82%', left: '12%' }, size: 'text-2xl md:text-3xl', anim: 'nutrition-drift', duration: '8.5s', delay: '2.4s', opacity: 'opacity-25' },
  { emoji: '🥛', style: { top: '30%', left: '68%' }, size: 'text-2xl md:text-3xl', anim: 'nutrition-float', duration: '6.8s', delay: '0.2s', opacity: 'opacity-15' },
  { emoji: '🍊', style: { top: '72%', left: '68%' }, size: 'text-2xl md:text-3xl', anim: 'nutrition-drift', duration: '7.2s', delay: '2.8s', opacity: 'opacity-15' },
  { emoji: '💪', style: { top: '55%', left: '55%' }, size: 'text-xl md:text-2xl', anim: 'nutrition-float', duration: '5s', delay: '1s', opacity: 'opacity-10' },
]

export default function Hero({ onStart }) {
  return (
    <section className="full-screen relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 text-white md:min-h-0">
      {/* توهجات خضراء خفيفة */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="nutrition-glow absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="nutrition-glow absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-3xl" style={{ animationDelay: '2s' }} />
        {/* شبكة خفيفة */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* أشكال التغذية المتحركة */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
        {FLOATING_FOODS.map((f, i) => (
          <span
            key={i}
            className={`absolute ${f.size} ${f.anim} ${f.opacity} drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]`}
            style={{
              ...f.style,
              animationDuration: f.duration,
              animationDelay: f.delay,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="full-screen relative z-10 flex flex-col justify-center px-5 pb-28 pt-7 md:mx-auto md:grid md:min-h-0 md:max-w-6xl md:grid-cols-2 md:items-center md:gap-10 md:px-8 md:py-16">
        <div>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold md:text-sm">
            ابدأ النهاردة… جسمك يستاهل 💪
          </span>
          <h1 className="mt-3 text-[28px] font-extrabold leading-[1.35] drop-shadow-lg md:text-5xl md:leading-[1.3]">
            احسب سعراتك بدقة
            <br />
            ووزعها على وجبات مع منصور بوت
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-relaxed text-white/85 md:text-base">
            ثلاث معادلات عالمية بدقة عالية، هدف مبسط (ثبات / تنشيف /
            زيادة)، وبعدها الشات يوزع لك السعرات على وجبات مصرية عملية.
          </p>
          <button
            onClick={onStart}
            className="mt-5 min-h-[54px] w-full rounded-2xl bg-white text-base font-extrabold text-brand-700 shadow-lg active:scale-[0.99] md:mt-6 md:w-auto md:px-10"
          >
            احسب سعراتك الآن
          </button>
          <div className="mt-3 grid max-w-md grid-cols-3 gap-2 text-center">
            {[
              ['3', 'معادلات عالمية'],
              ['3', 'أهداف مبسطة'],
              ['بوت', 'توزيع وجبات'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-2.5">
                <div className="text-xl font-extrabold">{n}</div>
                <div className="text-[11px] font-semibold text-white/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-[28px] bg-white p-5 text-brand-900 shadow-2xl md:mt-0 md:p-6">
          <h2 className="text-base font-extrabold md:text-xl">إزاي هتمشي؟ (4 خطوات)</h2>
          <ol className="mt-3 space-y-2 text-[13px] font-bold md:text-sm">
            {[
              ['user', 'سجّل اسمك ورقم تليفونك'],
              ['calculator', 'دخّل بيانات جسمك ونشاطك'],
              ['chart', 'شوف نتيجتك والماكروز'],
              ['bot', 'وزّع يومك مع منصور بوت'],
            ].map(([icon, s]) => (
              <li key={s} className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon name={icon} className="h-4 w-4" />
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-[11px] font-semibold leading-relaxed text-amber-800 md:text-xs">
            تنبيه: النتائج إرشادية عامة وليست بديلاً عن متابعة طبية، خصوصاً للحامل
            والمرضع وأصحاب الأمراض المزمنة.
          </p>
        </div>
      </div>
    </section>
  )
}
