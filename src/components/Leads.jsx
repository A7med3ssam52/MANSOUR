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
    <article className="overflow-hidden rounded-[28px] border border-brand-100 bg-white shadow-sm transition hover:shadow-md">
      {/* الغلاف */}
      <div className="relative h-20 overflow-hidden bg-gradient-to-l from-brand-800 via-brand-600 to-brand-400">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
        {person.goal_label && (
          <span className="absolute left-3 top-3 rounded-full bg-black/35 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur-sm">
            {person.goal_label}
          </span>
        )}
        <span className="absolute bottom-2 left-3 text-[11px] font-bold text-white/80">
          {fmtDate(person.calculated_at ?? person.created_at)}
        </span>
      </div>

      <div className="px-4 pb-4">
        {/* الاسم والصورة */}
        <div className="-mt-7 flex items-end gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-brand-700 shadow-lg ring-4 ring-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1 pb-0.5">
            <h2 className="truncate text-base font-extrabold text-brand-900">{person.name}</h2>
            <button
              onClick={() => setShowPhone((s) => !s)}
              dir="ltr"
              className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[12px] font-bold tabular-nums text-gray-500 transition hover:bg-brand-50"
              aria-label={showPhone ? 'إخفاء الرقم' : 'إظهار الرقم'}
            >
              <Icon name="phone" className="h-3.5 w-3.5 text-brand-600" />
              {showPhone ? person.phone : maskPhone(person.phone)}
            </button>
          </div>
        </div>

        {person.target_calories != null && (
          <>
            {/* السعرات */}
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-brand-900 p-3 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Icon name="flame" className="h-5 w-5" />
                </span>
                <span className="text-[12px] font-bold text-white/80">المستهدف اليومي</span>
              </div>
              <div className="text-2xl font-extrabold tabular-nums">
                {person.target_calories}
                <span className="mr-1 text-[11px] font-bold text-white/70">سعرة</span>
              </div>
            </div>

            {/* الماكروز */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ['بروتين', person.protein_g, 'protein'],
                ['كارب', person.carbs_g, 'carbs'],
                ['دهون', person.fat_g, 'fat'],
              ].map(([l, v, icon]) => (
                <div key={l} className="rounded-2xl border border-brand-100 bg-brand-50/60 p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-brand-700">
                    <Icon name={icon} className="h-3.5 w-3.5" />
                    {l}
                  </div>
                  <div className="mt-0.5 text-base font-extrabold tabular-nums text-brand-900">
                    {v ?? '—'}
                    <span className="text-[10px] font-bold text-gray-400"> جم</span>
                  </div>
                </div>
              ))}
            </div>

            {/* بيانات إضافية */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px] font-bold text-gray-400">
              <span className="rounded-full bg-gray-50 px-2.5 py-1">
                TDEE <span className="tabular-nums text-brand-700">{person.tdee_mifflin ?? '—'}</span>
              </span>
              {person.gender && <span className="rounded-full bg-gray-50 px-2.5 py-1">{person.gender}</span>}
              {person.age != null && <span className="rounded-full bg-gray-50 px-2.5 py-1">{person.age} سنة</span>}
              {person.weight_kg != null && (
                <span className="rounded-full bg-gray-50 px-2.5 py-1">{person.weight_kg} كجم</span>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  )
}

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-brand-100 bg-white">
      <div className="h-20 animate-pulse bg-brand-100" />
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-3">
          <div className="-mt-7 h-14 w-14 animate-pulse rounded-2xl bg-brand-100 ring-4 ring-white" />
          <div className="h-4 flex-1 animate-pulse rounded-full bg-gray-100" />
        </div>
        <div className="h-16 animate-pulse rounded-2xl bg-gray-50" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-14 animate-pulse rounded-2xl bg-gray-50" />
          <div className="h-14 animate-pulse rounded-2xl bg-gray-50" />
          <div className="h-14 animate-pulse rounded-2xl bg-gray-50" />
        </div>
      </div>
    </div>
  )
}

export default function Leads() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [goalFilter, setGoalFilter] = useState('الكل')
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

  // أحدث صف لكل رقم تليفون (عشان الصفوف القديمة المكررة قبل الإصلاح)
  const people = useMemo(() => {
    const seen = new Map()
    for (const r of rows) {
      if (!r.phone || seen.has(r.phone)) continue
      seen.set(r.phone, r)
    }
    return [...seen.values()]
  }, [rows])

  const goals = useMemo(() => {
    const set = new Set(people.map((p) => p.goal_label).filter(Boolean))
    return ['الكل', ...set]
  }, [people])

  const stats = useMemo(() => {
    const cals = people.map((p) => p.target_calories).filter((v) => v != null)
    return {
      total: people.length,
      avg: cals.length ? Math.round(cals.reduce((a, b) => a + b, 0) / cals.length) : null,
    }
  }, [people])

  const filtered = useMemo(() => {
    const q = query.trim()
    return people.filter((p) => {
      if (goalFilter !== 'الكل' && p.goal_label !== goalFilter) return false
      if (!q) return true
      return (p.name ?? '').includes(q) || String(p.phone ?? '').includes(q.replace(/[\s-]/g, ''))
    })
  }, [people, query, goalFilter])

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-lg">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="lock" className="h-7 w-7" />
          </span>
          <h1 className="mt-3 text-xl font-extrabold">منطقة خاصة</h1>
          <p className="mt-1 text-[13px] font-semibold text-white/75">صفحة المسجلين محمية بكلمة سر</p>
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
              className="min-h-[54px] w-full rounded-2xl border border-white/20 bg-white/15 px-4 text-left text-base font-semibold text-white placeholder:text-white/50 outline-none focus:border-white/50"
            />
            {pwError && (
              <p className="rounded-2xl bg-red-500/20 p-3 text-[13px] font-bold text-white">{pwError}</p>
            )}
            <button
              type="submit"
              disabled={checking || !pw}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-extrabold text-brand-800 shadow active:scale-[0.99] disabled:opacity-60"
            >
              <Icon name="check" className="h-5 w-5" />
              {checking ? 'ثواني...' : 'دخول'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 md:max-w-4xl md:px-8 md:py-10">
      {/* الترويسة + الإحصائيات */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-lg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Icon name="user" className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">المسجلين</h1>
            <p className="text-[13px] font-semibold text-white/75">بروفايل كل عميل ونتائجه</p>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="text-2xl font-extrabold tabular-nums">{loading ? '…' : stats.total}</div>
            <div className="text-[11px] font-bold text-white/75">مشترك</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="text-2xl font-extrabold tabular-nums">{loading || stats.avg == null ? '…' : stats.avg}</div>
            <div className="text-[11px] font-bold text-white/75">متوسط السعرات</div>
          </div>
        </div>
        <div className="relative mx-auto mt-4 max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الرقم..."
            className="min-h-[50px] w-full rounded-2xl border border-white/20 bg-white/15 px-4 text-base font-semibold text-white placeholder:text-white/60 outline-none focus:border-white/50"
          />
        </div>
      </section>

      {/* فلتر الأهداف */}
      {!loading && goals.length > 2 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => setGoalFilter(g)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${
                goalFilter === g ? 'bg-brand-600 text-white shadow' : 'border border-brand-200 bg-white text-brand-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : error === 'no-select' ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-center md:col-span-2">
            <p className="text-sm font-extrabold text-amber-800">القراءة مقفولة في الداتابيز</p>
            <p className="mt-1 text-[13px] font-semibold leading-relaxed text-amber-700" dir="ltr">
              نفّذ <code>supabase/migrations/002_leads_select.sql</code> في Supabase SQL Editor ثم حدّث الصفحة.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brand-300 bg-white/70 p-8 text-center md:col-span-2">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Icon name="user" className="h-6 w-6" />
            </span>
            <p className="mt-2 text-sm font-bold text-gray-500">
              {people.length === 0 ? 'لسه مفيش حد سجّل' : 'مفيش نتيجة مطابقة للبحث'}
            </p>
          </div>
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
