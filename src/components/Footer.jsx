import { Link } from 'react-router-dom'
import Icon from './icons'
import LogoMark from './Logo'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-brand-800 via-brand-700 to-brand-600 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative mx-auto max-w-md px-5 pb-28 pt-8 md:max-w-6xl md:px-8 md:py-10">
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:justify-between md:text-right">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark className="h-11 w-11 text-white" />
            <span>
              <span className="block text-base font-extrabold leading-tight md:text-lg">
                محمد منصور
              </span>
              <span className="block text-[11px] font-semibold leading-tight text-white/70 md:text-xs">
                أخصائي تغذية • احسب سعراتك صح
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-xs font-bold md:text-sm">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
            >
              <Icon name="calculator" className="h-4 w-4" />
              حاسبة السعرات
            </Link>
            <Link
              to="/portfolio"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
            >
              <Icon name="target" className="h-4 w-4" />
              أعمالي
            </Link>
            <Link
              to="/follow-up"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 transition hover:bg-white/20"
            >
              <Icon name="activity" className="h-4 w-4" />
              المتابعة
            </Link>
          </nav>
        </div>
        <div className="mt-6 border-t border-white/20 pt-4 text-center md:flex md:items-center md:justify-between md:text-right">
          <p className="text-[11px] font-bold text-white md:text-xs">
            © {new Date().getFullYear()} محمد منصور — جميع الحقوق محفوظة
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-white/75 md:mt-0 md:text-xs">
            المحتوى إرشادي عام وليس بديلاً عن استشارة طبية
          </p>
        </div>
      </div>
    </footer>
  )
}
