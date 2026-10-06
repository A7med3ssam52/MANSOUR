import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const { pathname } = useLocation()
  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        pathname === to ? 'bg-brand-600 text-white' : 'text-brand-800 hover:bg-brand-100'
      }`}
    >
      {label}
    </Link>
  )
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-2.5 md:max-w-6xl md:px-6 md:py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-extrabold text-white md:h-11 md:w-11 md:text-xl">
            م
          </span>
          <span>
            <span className="block text-base font-extrabold leading-tight text-brand-900 md:text-lg">
              محمد منصور
            </span>
            <span className="block text-[11px] font-semibold leading-tight text-brand-600 md:text-xs">
              أخصائي تغذية
            </span>
          </span>
        </Link>
        {/* ديسكتوب: روابط عادية */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLink('/', 'حاسبة السعرات')}
          {navLink('/portfolio', 'البورتفوليو')}
          {navLink('/follow-up', 'المتابعة')}
        </nav>
        {/* موبايل: اختصارات مدمجة */}
        <div className="flex items-center gap-1 md:hidden">
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-700">
            المتابعة قريباً
          </span>
          <Link
            to={pathname === '/portfolio' ? '/' : '/portfolio'}
            className="rounded-full px-3 py-1.5 text-[11px] font-bold text-brand-800 hover:bg-brand-100"
          >
            {pathname === '/portfolio' ? 'الحاسبة' : 'أعمالي'}
          </Link>
        </div>
      </div>
    </header>
  )
}
