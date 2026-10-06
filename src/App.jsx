import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import LeadGate from './components/LeadGate'
import TdeeCalculator from './components/TdeeCalculator'
import Results from './components/Results'
import MansourAI from './components/MansourAI'
import BottomNav from './components/BottomNav'
import ProgressSteps from './components/ProgressSteps'
import Portfolio from './components/Portfolio'
import Leads from './components/Leads'
import Footer from './components/Footer'
import Icon from './components/icons'
import { clearAll, getLead, getResult } from './services/leads'

function Home() {
  const [lead, setLead] = useState(() => getLead())
  const [result, setResult] = useState(() => getResult())
  const [tab, setTab] = useState('home')

  function navigate(id, locked) {
    setTab(locked ? 'calc' : id)
    window.scrollTo({ top: 0 })
  }

  function handleCalculated(r) {
    setResult(r)
    setTab('result')
    window.scrollTo({ top: 0 })
  }

  function resetAll() {
    clearAll()
    setLead(null)
    setResult(null)
    setTab('calc')
    window.scrollTo({ top: 0 })
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const leadChip = (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-brand-100 bg-white p-3 shadow-sm">
      <p className="text-[13px] font-bold text-brand-900">
        أهلاً {lead?.name}{' '}
        <span dir="ltr" className="tabular-nums"> {lead?.phone}</span>
      </p>
      <button
        onClick={resetAll}
        className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 px-3 text-xs font-bold text-brand-700"
      >
        <Icon name="edit" className="h-4 w-4" />
        تغيير
      </button>
    </div>
  )

  const emptyCalc = (
    <div className="rounded-3xl border border-dashed border-brand-300 bg-white/70 p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <Icon name="calculator" className="h-6 w-6" />
      </span>
      <p className="mt-2 text-sm font-bold text-gray-500">لسه محسبتش سعراتك</p>
      <button
        onClick={() => (window.innerWidth < 768 ? navigate('calc') : scrollTo('calculator'))}
        className="mt-3 min-h-[52px] w-full rounded-2xl bg-brand-600 text-base font-extrabold text-white"
      >
        روح للحاسبة
      </button>
    </div>
  )

  return (
    <>
      {/* ===== موبايل: تجربة تطبيق (تبويبات + شريط سفلي) ===== */}
      <div className="md:hidden">
        {tab === 'home' && <Hero onStart={() => navigate('calc')} />}
        {tab !== 'home' && (
          <div className="px-4 pt-4">
            <ProgressSteps lead={lead} result={result} tab={tab} />
          </div>
        )}
        <main className="mx-auto grid max-w-md gap-4 px-4 pb-32 pt-4">
          {tab === 'calc' && (
            <>
              {!lead ? (
                <LeadGate onDone={(l) => setLead(l)} />
              ) : (
                <>
                  {leadChip}
                  <TdeeCalculator onCalculated={handleCalculated} />
                </>
              )}
            </>
          )}
          {tab === 'result' && (
            <>
              {result ? (
                <Results result={result} onDistribute={() => navigate('ai')} />
              ) : (
                emptyCalc
              )}
            </>
          )}
          {tab === 'ai' && (
            <>
              {result ? (
                <MansourAI lead={lead} result={result} />
              ) : (
                <div className="rounded-3xl border border-dashed border-brand-300 bg-white/70 p-6 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
                    <Icon name="bot" className="h-6 w-6" />
                  </span>
                  <p className="mt-2 text-sm font-bold text-gray-500">احسب سعراتك الأول عشان أوزعها لك</p>
                  <button
                    onClick={() => navigate('calc')}
                    className="mt-3 min-h-[52px] w-full rounded-2xl bg-brand-600 text-base font-extrabold text-white"
                  >
                    روح للحاسبة
                  </button>
                </div>
              )}
            </>
          )}
          {tab === 'home' && (
            <button
              onClick={() => navigate('calc')}
              className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 text-base font-extrabold text-white shadow"
            >
              ابدأ من هنا
              <Icon name="arrow" className="h-5 w-5" />
            </button>
          )}
        </main>
        <BottomNav active={tab} hasResult={!!result} onNavigate={navigate} />
      </div>

      {/* ===== ديسكتوب: موقع ويب عادي (صفحة كاملة بعرض عريض) ===== */}
      <div className="hidden md:block">
        <Hero onStart={() => scrollTo(lead ? 'calculator' : 'lead')} />
        <main className="mx-auto grid max-w-6xl gap-6 px-8 py-10">
          <section id="lead">
            {!lead ? (
              <LeadGate onDone={(l) => { setLead(l); scrollTo('calculator') }} />
            ) : (
              leadChip
            )}
          </section>
          {lead && (
            <section id="calculator">
              <TdeeCalculator onCalculated={(r) => { setResult(r); scrollTo('results') }} />
            </section>
          )}
          {lead && result && (
            <>
              <section id="results">
                <Results result={result} onDistribute={() => scrollTo('ai')} />
              </section>
              <section id="ai">
                <MansourAI lead={lead} result={result} />
              </section>
            </>
          )}
          {lead && !result && (
            <div className="rounded-3xl border border-dashed border-brand-300 bg-white/60 p-6 text-center text-sm font-semibold text-gray-500">
              كمّل بيانات جسمك فوق واضغط "احسب سعراتي" عشان النتيجة والشات يظهروا هنا.
            </div>
          )}
        </main>
      </div>
    </>
  )
}

function Soon({ title, desc }) {
  return (
    <main className="mx-auto max-w-md px-5 py-16 pb-32 text-center md:max-w-6xl md:px-8 md:py-20">
      <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700">
        قريباً
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-brand-900 md:text-3xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-gray-500">{desc}</p>
    </main>
  )
}

export default function App() {
  return (
    <div className="min-h-dvh">
      {/* موبايل: عمود بحد أقصى مثل شاشة تطبيق */}
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-[#f7fdf8] shadow-xl md:max-w-none md:bg-transparent md:shadow-none">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/labs/users/leads" element={<Leads />} />
          <Route
            path="/follow-up"
            element={<Soon title="نظام المتابعة" desc="نظام المتابعة الأسبوعية والاشتراكات هيشتغل هنا قريباً." />}
          />
        </Routes>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  )
}
