import Icon from './icons'

const TABS = [
  { id: 'home', icon: 'home', label: 'الرئيسية' },
  { id: 'calc', icon: 'calculator', label: 'الحاسبة' },
  { id: 'result', icon: 'chart', label: 'نتيجتي', needsResult: true },
  { id: 'ai', icon: 'bot', label: 'منصور بوت', needsResult: true },
]

export default function BottomNav({ active, hasResult, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 border-t border-brand-100 bg-white/95 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
        {TABS.map((t) => {
          const locked = t.needsResult && !hasResult
          const isActive = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => onNavigate(t.id, locked)}
              className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-extrabold transition ${
                isActive ? 'text-brand-700' : locked ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 h-1 w-10 rounded-b-full bg-brand-600" />
              )}
              <Icon name={locked ? 'lock' : t.icon} className="h-6 w-6" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      <div className="pb-safe mx-auto max-w-md bg-white/95" />
    </nav>
  )
}
