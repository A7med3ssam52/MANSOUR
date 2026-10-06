import Icon, { IconBadge } from './icons'

export default function Results({ result, onDistribute }) {
  if (!result) return null
  const cards = [
    { name: 'Mifflin-St Jeor', badge: 'الأساسية', bmr: result.bmr.mifflin, tdee: result.tdeeMifflin, main: true },
    { name: 'Harris-Benedict', bmr: result.bmr.harris, tdee: result.tdeeHarris },
    {
      name: 'Katch-McArdle',
      bmr: result.bmr.katch ?? '—',
      tdee: result.tdeeKatch ?? '—',
      note: result.tdeeKatch == null ? 'اكتب نسبة الدهون لعرضها' : null,
    },
  ]

  function copy() {
    const text = `نتيجتي مع محمد منصور: هدف ${result.goalLabel} = ${result.targetCalories} سعرة (TDEE ${result.tdeeMifflin}) - بروتين ${result.macros.proteinG}جم / كارب ${result.macros.carbsG}جم / دهون ${result.macros.fatG}جم`
    navigator.clipboard?.writeText(text)
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <IconBadge name="chart" />
        <h2 className="text-lg font-extrabold text-brand-900">نتيجتك</h2>
      </div>
      <div className="mt-3 rounded-3xl bg-gradient-to-b from-brand-600 to-brand-700 p-5 text-center text-white shadow">
        <div className="text-[13px] font-bold text-white/85">{result.goalLabel}</div>
        <div className="mt-1 text-5xl font-extrabold tabular-nums">{result.targetCalories}</div>
        <div className="text-[13px] font-bold">سعرة / يوم</div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[
          ['بروتين', `${result.macros.proteinG} جم`, 'protein'],
          ['كارب', `${result.macros.carbsG} جم`, 'carbs'],
          ['دهون', `${result.macros.fatG} جم`, 'fat'],
        ].map(([l, v, icon]) => (
          <div key={l} className="rounded-2xl bg-brand-50 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-brand-700">
              <Icon name={icon} className="h-4 w-4" />
              {l}
            </div>
            <div className="mt-0.5 text-lg font-extrabold tabular-nums text-brand-900">{v}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-4 text-sm font-extrabold text-brand-900">مقارنة المعادلات</h3>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {cards.map((r) => (
          <div
            key={r.name}
            className={`rounded-2xl border p-3 ${
              r.main ? 'border-brand-600 bg-brand-50' : 'border-gray-100 bg-gray-50/60'
            }`}
          >
            <div className={`flex items-center gap-2 text-[13px] font-extrabold ${r.main ? 'text-brand-800' : 'text-gray-700'}`}>
              {r.name}
              {r.badge && (
                <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  {r.badge}
                </span>
              )}
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white p-2">
                <div className="text-[10px] font-bold text-gray-400">BMR راحة</div>
                <div className="text-base font-extrabold tabular-nums text-brand-900">{r.bmr}</div>
              </div>
              <div className="rounded-xl bg-white p-2">
                <div className="text-[10px] font-bold text-gray-400">TDEE نشاط</div>
                <div className="text-base font-extrabold tabular-nums text-brand-900">{r.tdee}</div>
              </div>
            </div>
            {r.note && <div className="mt-1 text-[11px] font-semibold text-gray-400">{r.note}</div>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-semibold text-gray-400">
        النشاط: {result.activityLabel} • الهدف محسوب من Mifflin-St Jeor
      </p>

      <button
        onClick={onDistribute}
        className="mt-3 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99]"
      >
        <Icon name="bot" className="h-5 w-5" />
        وزّع سعراتي مع منصور بوت
      </button>
      <button
        onClick={copy}
        className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-brand-200 text-sm font-extrabold text-brand-700"
      >
        <Icon name="copy" className="h-4 w-4" />
        نسخ النتيجة
      </button>
    </div>
  )
}
