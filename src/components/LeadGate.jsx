import { useState } from 'react'
import Icon, { IconBadge } from './icons'
import { saveLead, validateEgyptianPhone } from '../services/leads'

const inputCls =
  'min-h-[54px] w-full rounded-2xl border border-brand-200 bg-white px-4 py-3 text-base font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export default function LeadGate({ initial, onDone }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (saving) return
    if (name.trim().length < 2) {
      setError('اكتب اسمك (حرفين على الأقل)')
      return
    }
    const phoneError = validateEgyptianPhone(phone)
    if (phoneError) {
      setError(phoneError)
      return
    }
    setError('')
    setSaving(true)
    try {
      onDone(await saveLead({ name, phone }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm md:mx-auto md:w-full md:max-w-2xl md:p-6">
      <div className="flex items-center gap-3">
        <IconBadge name="user" />
        <div>
          <h2 className="text-lg font-extrabold text-brand-900">بيانات التواصل</h2>
          <p className="text-[13px] font-semibold text-gray-500">سجّل عشان نبدأ حساب سعراتك</p>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-relaxed text-gray-500">
        بنطلب الاسم ورقم التليفون عشان المتابعة بعدين. حالياً بتتحفظ على جهازك فقط.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-brand-900">الاسم</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: محمد منصور"
            autoComplete="name"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-brand-900">رقم التليفون</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className={`${inputCls} text-left`}
          />
        </label>
        {error && (
          <p className="rounded-2xl bg-red-50 p-3 text-[13px] font-bold text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99] disabled:opacity-60 md:col-span-2"
        >
          {saving ? 'جاري الحفظ...' : 'ابدأ الحساب'}
          {!saving && <Icon name="arrow" className="h-5 w-5" />}
        </button>
      </form>
    </div>
  )
}
