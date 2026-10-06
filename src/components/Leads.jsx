import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './icons'
import { isCloudEnabled, supabase } from '../services/supabaseClient'

// بصمة SHA-256 لكلمة سر المنطقة الخاصة (الباسورد نفسه مش محفوظ في الكود)
const PASS_HASH = 'da36c3fe403e17e1ee675095bfa660636efd0ed1c02c77fc6feb890fcd4bb3cf'

async function checkPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('') === PASS_HASH
}

function maskPhone(phone) {
  const p = String(phone ?? '')
  if (p.length < 7) return p
  return `${p.slice(0, 3)}****${p.slice(-3)}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return '—'
  }
}

function ProfileCard({ person }) {
  const [showPhone, setShowPhone] = useState(false)
  const initial = (person.name ?? '?').trim().charAt(0) || '?'
  return (
    <article className="rounded-3xl border border-brand-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-brand-700 to-brand-600 text-xl font-extrabold text-white shadow">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-extrabold text-brand-900">{person.name}</h2>
          <button
            onClick={() => setShowPhone((s) => !s)}
            dir="ltr"
            className="mt-0.5 flex items-center gap-1.5 text-[13px] font-bold tabular-nums text-gray-500"
            aria-label={showPhone ? 'إخفاء الرقم' : 'إظهار الرقم'}
          >
            {showPhone ? person.phone : maskPhone(person.phone)}
            <Icon name={showPhone ? 'ban' : 'phone'} className="h-3.5 w-3.5 text-brand-600" />
          </button>
        </div>
        {person.goal_label && (
          <span className="shrink-0 rounded-full bg-brand-100 px-3 py-1 text-[11px] font-extrabold text-brand-700">
            {person.goal_label}
          </span>
        )}
      </div>

      {person.target_calories != null && (
        <>
          <div className="mt-3 rounded-2xl bg-gradient-to-b from-brand-600 to-brand-700 p-3 text-center text-white">
            <div className="text-3xl font-extrabold tabular-nums">{person.target_calories}</div>
            <div className="text-[11px] font-bold text-white/85">سعرة / يوم</div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              ['بروتين', person.protein_g, 'protein'],
              ['كارب', person.carbs_g, 'carbs'],
              ['دهون', person.fat_g, 'fat'],
            ].map(([l, v, icon]) => (
              <div key={l} className="rounded-2xl bg-brand-50 p-2">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-brand-700">
                  <Icon name={icon} className="h-3.5 w-3.5" />
                  {l}
                </div>
                <div className="mt-0.5 text-sm font-extrabold tabular-nums text-brand-900">
                  {v ?? '—'}<span className="text-[10px] font-bold text-gray-400"> جم</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-400">
            <span>
              TDEE: <span className="tabular-nums text-brand-700">{person.tdee_mifflin ?? '—'}</span>
              {' • '}
              {person.gender ?? ''} {person.age != null ? `• ${person.age} سنة` : ''}
            </span>
            <span>{fmtDate(person.calculated_at ?? person.created_at)}</span>
          </div>
        </>
      )}
    </article>
  )
}

export default function Leads() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem('mm_leads_auth') === '1'
    } catch {
      return false
    }
  })
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [checking, setChecking] = useState(false)

  async function unlock(e) {
    e?.preventDefault()
    if (checking) return
    setChecking(true)
    try {
      if (await checkPassword(pw)) {
        try {
          sessionStorage.setItem('mm_leads_auth', '1')
        } catch {
          // التخزين المحلي غير متاح — الدخول للجلسة الحالية فقط
        }
        setAuthed(true)
      } else {
        setPwError('الباسورد غلط، حاول تاني')
      }
    } catch {
      setPwError('المتصفح ده مش مدعوم، جرّب متصفح تاني')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (!authed) return
    async function load() {
      if (!isCloudEnabled || !supabase) {
        setError('الاتصال السحابي غير مفعّل')
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('calculated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) {
        setError('no-select')
      } else {
        setRows(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [authed])

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-[28px] border border-brand-100 bg-white p-6 shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Icon name="lock" className="h-7 w-7" />
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-brand-900">منطقة خاصة</h1>
          <p className="mt-1 text-[13px] font-semibold text-gray-500">صفحة المسجلين محمية بكلمة سر</p>
          <form onSubmit={unlock} className="mt-4 grid gap-3">
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value)
                setPwError('')
              }}
              placeholder="كلمة السر"
              autoComplete="current-password"
              dir="ltr"
              className="min-h-[54px] w-full rounded-2xl border border-brand-200 px-4 text-left text-base font-semibold outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            {pwError && (
              <p className="rounded-2xl bg-red-50 p-3 text-[13px] font-bold text-red-700">{pwError}</p>
            )}
            <button
              type="submit"
              disabled={checking || !pw}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow active:scale-[0.99] disabled:opacity-60"
            >
              <Icon name="check" className="h-5 w-5" />
              {checking ? 'ثواني...' : 'دخول'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  // أحدث صف لكل رقم تليفون (عشان الصفوف القديمة المكررة قبل الإصلاح)
  const people = useMemo(() => {
    const seen = new Map()
    for (const r of rows) {
      if (!r.phone || seen.has(r.phone)) continue
      seen.set(r.phone, r)
    }
    return [...seen.values()]
  }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return people
    return people.filter(
      (p) => (p.name ?? '').includes(q) || String(p.phone ?? '').includes(q.replace(/[\s-]/g, '')),
    )
  }, [people, query])

  return (
    <main className="mx-auto max-w-md px-4 py-6 md:max-w-4xl md:px-8 md:py-10">
      <section className="rounded-[28px] bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 p-6 text-center text-white shadow-lg">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Icon name="user" className="h-7 w-7" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold">المسجلين</h1>
        <p className="mt-1 text-[13px] font-semibold text-white/85">
          {loading ? 'جاري التحميل...' : `${people.length} مشترك`}
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الرقم..."
            className="min-h-[50px] w-full rounded-2xl border border-white/20 bg-white/15 px-4 text-base font-semibold text-white placeholder:text-white/60 outline-none focus:border-white/50"
          />
        </div>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {loading ? (
          <p className="rounded-3xl border border-dashed border-brand-300 bg-white/70 p-6 text-center text-sm font-bold text-gray-500">
            ثواني بنجيب البيانات...
          </p>
        ) : error === 'no-select' ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="text-sm font-extrabold text-amber-800">القراءة مقفولة في الداتابيز</p>
            <p className="mt-1 text-[13px] font-semibold leading-relaxed text-amber-700" dir="ltr">
              نفّذ <code>supabase/migrations/002_leads_select.sql</code> في Supabase SQL Editor ثم حدّث الصفحة.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brand-300 bg-white/70 p-6 text-center text-sm font-bold text-gray-500">
            {people.length === 0 ? 'لسه مفيش حد سجّل' : 'مفيش نتيجة مطابقة للبحث'}
          </p>
        ) : (
          filtered.map((p) => <ProfileCard key={p.phone} person={p} />)
        )}
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm font-bold text-brand-700 underline">
          رجوع للحاسبة
        </Link>
      </div>
    </main>
  )
}
