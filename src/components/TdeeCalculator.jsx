import { useState } from 'react'
import Icon, { IconBadge } from './icons'
import { ACTIVITY_LEVELS, GOALS, calcAll, calcMacros, safeTargetCalories } from '../lib/tdee'
import { saveResult } from '../services/leads'

const inputCls =
  'min-h-[54px] w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-base font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function TdeeCalculator({ onCalculated }) {
  const [form, setForm] = useState({
    age: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
    bodyFatPct: '',
    activityId: 'moderate',
    goalId: 'maintain',
  })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    const age = Number(form.age)
    const heightCm = Number(form.heightCm)
    const weightKg = Number(form.weightKg)
    const bodyFatPct = form.bodyFatPct === '' ? null : Number(form.bodyFatPct)

    if (!(age >= 10 && age <= 100)) return setError('السن لازم يكون بين 10 و 100 سنة')
    if (!(heightCm >= 120 && heightCm <= 230)) return setError('الطول لازم يكون بين 120 و 230 سم')
    if (!(weightKg >= 30 && weightKg <= 300)) return setError('الوزن لازم يكون بين 30 و 300 كجم')
    if (bodyFatPct != null && !(bodyFatPct >= 3 && bodyFatPct <= 60)) {
      return setError('نسبة الدهون اختيارية، ولو كتبتها لازم تكون بين 3 و 60%')
    }
    setError('')

    const calc = calcAll({ weightKg, heightCm, age, gender: form.gender, bodyFatPct, activityId: form.activityId })
    // الهدف يُحسب من القيمة الدقيقة (بدون تقريب مزدوج) مع حد أدنى آمن للتنشيف
    const { target, capped, floor } = safeTargetCalories(
      calc.precise.tdee.mifflin,
      form.goalId,
      calc.precise.bmr.mifflin,
    )
    const macros = calcMacros(target, weightKg, form.goalId)
    const goalLabel = GOALS.find((g) => g.id === form.goalId)?.label ?? ''
    const activityLabel = ACTIVITY_LEVELS.find((a) => a.id === form.activityId)?.label ?? ''

    const result = {
      age,
      gender: form.gender,
      heightCm,
      weightKg,
      bodyFatPct,
      activityId: form.activityId,
      activityLabel,
      goalId: form.goalId,
      goalLabel,
      bmr: calc.bmr,
      tdeeMifflin: calc.tdee.mifflin,
      tdeeHarris: calc.tdee.harris,
      tdeeKatch: calc.tdee.katch,
      targetCalories: target,
      targetCapped: capped,
      targetFloor: floor,
      macros,
    }
    saveResult(result)
    onCalculated(result)
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm md:mx-auto md:w-full md:max-w-2xl md:p-6">
      <div className="flex items-center gap-3">
        <IconBadge name="calculator" />
        <div>
          <h2 className="text-lg font-extrabold text-brand-900">بيانات الجسم والنشاط</h2>
          <p className="text-[13px] font-semibold text-gray-500">
            نسبة الدهون اختيارية (مطلوبة فقط لمعادلة Katch-McArdle).
          </p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['male', 'ذكر', 'male'],
            ['female', 'أنثى', 'female'],
          ].map(([v, l, icon]) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm((f) => ({ ...f, gender: v }))}
              className={`flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border text-base font-extrabold transition active:scale-[0.98] ${
                form.gender === v
                  ? 'border-brand-600 bg-brand-600 text-white shadow'
                  : 'border-brand-200 bg-white text-brand-800'
              }`}
            >
              <Icon name={icon} className="h-5 w-5" />
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-brand-900">السن</span>
            <input type="number" value={form.age} onChange={set('age')} placeholder="28" inputMode="numeric" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-brand-900">الوزن (كجم)</span>
            <input type="number" value={form.weightKg} onChange={set('weightKg')} placeholder="80" inputMode="decimal" className={inputCls} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-brand-900">الطول (سم)</span>
            <input type="number" value={form.heightCm} onChange={set('heightCm')} placeholder="175" inputMode="numeric" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[13px] font-bold text-brand-900">الدهون % (اختياري)</span>
            <input type="number" value={form.bodyFatPct} onChange={set('bodyFatPct')} placeholder="22" inputMode="decimal" className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[13px] font-bold text-brand-900">مستوى النشاط</span>
          <select value={form.activityId} onChange={set('activityId')} className={inputCls}>
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className="mb-1 block text-[13px] font-bold text-brand-900">هدفك</span>
          <div className="grid gap-2">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, goalId: g.id }))}
                className={`min-h-[60px] rounded-2xl border p-3 text-right transition active:scale-[0.99] ${
                  form.goalId === g.id
                    ? 'border-brand-600 bg-brand-600 text-white shadow'
                    : 'border-brand-200 bg-white text-brand-900'
                }`}
              >
                <span className="flex items-center gap-1.5 text-[15px] font-extrabold">
                  {form.goalId === g.id && <Icon name="check" className="h-4 w-4" />}
                  {g.label}
                </span>
                <span className={`block text-xs font-semibold ${form.goalId === g.id ? 'text-white/85' : 'text-gray-500'}`}>
                  {g.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="rounded-2xl bg-red-50 p-3 text-[13px] font-bold text-red-700">{error}</p>
        )}
        <button
          type="submit"
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99]"
        >
          <Icon name="flame" className="h-5 w-5" />
          احسب سعراتي
        </button>
      </form>
    </div>
  )
}
