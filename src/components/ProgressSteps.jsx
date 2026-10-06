import Icon from './icons'

const STEPS = ['بياناتك', 'الحاسبة', 'النتيجة', 'الوجبات']

export default function ProgressSteps({ lead, result, tab }) {
  const current = tab === 'home' || tab === 'calc' ? (lead ? 2 : 1) : tab === 'result' ? 3 : 4
  const done = result ? 4 : lead ? 2 : 1
  return (
    <div className="flex items-center gap-1" aria-label="تقدم الخطوات">
      {STEPS.map((s, i) => {
        const n = i + 1
        const active = n === current
        const finished = n < done || (result && n <= 4 && n < current)
        return (
          <div key={s} className="flex flex-1 items-center gap-1 last:flex-none">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                  active
                    ? 'bg-brand-600 text-white'
                    : finished
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {finished && !active ? <Icon name="check" className="h-4 w-4" /> : n}
              </span>
              <span
                className={`text-[10px] font-bold ${active ? 'text-brand-700' : 'text-gray-400'}`}
              >
                {s}
              </span>
            </div>
            {n < 4 && <span className="mb-5 h-0.5 flex-1 rounded bg-gray-100" />}
          </div>
        )
      })}
    </div>
  )
}
