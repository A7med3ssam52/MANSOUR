// مكتبة أيقونات SVG احترافية موحدة (Stroke style)
// src/components/icons.jsx

const PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.3V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.3" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.3h7" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01M8.5 19h.01M12 19h.01M15.5 19h.01" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M8.5 16v-4.5M13 16V7.5M17.5 16v-2.5" />
    </>
  ),
  bot: (
    <>
      <path d="M12 8.5V5.5" />
      <circle cx="12" cy="4" r="1" />
      <rect x="4.5" y="8.5" width="15" height="11" rx="3.5" />
      <path d="M9.5 13.5h.01M14.5 13.5h.01" />
      <path d="M9.5 16.8h5" />
      <path d="M4.5 12.5H2.8M21.2 12.5h-1.7" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z" />
      <path d="M18.5 14.5l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8.8-2.1Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c1.4-3.8 4.6-5.3 7.5-5.3s6.1 1.5 7.5 5.3" />
    </>
  ),
  phone: (
    <path d="M5.5 3.5h3.6l1.7 4.7-2.3 1.5a12.5 12.5 0 0 0 5.2 5.2l1.5-2.3 4.7 1.7v3.6a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z" />
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
      <path d="M12 14.8v2" />
    </>
  ),
  arrow: (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  send: (
    <>
      <path d="M20.5 3.5 10.5 13.5" />
      <path d="M20.5 3.5 14 20.5l-3.5-7-7-3.5 17-6.5Z" />
    </>
  ),
  flame: (
    <path d="M12 20.5c-3.9 0-6.8-2.7-6.8-6.7 0-2.9 1.9-5.3 3.4-6.8.9 1.4 1.4 2.6 2.4 2.7.3-1.9.8-3.6 2-5.2.2 3.3 1.4 4.8 2.9 6.5 1.2 1.4 2.9 3.1 2.9 5.8 0 4-2.9 6.7-6.8 6.7Z" />
  ),
  protein: <path d="M7 7.5v9M17 7.5v9M3.8 9.8v4.4M20.2 9.8v4.4M7 12h10" />,
  carbs: (
    <>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.5-2.8-5-6.2-5 0 3.5 2.8 5 6.2 5Z" />
      <path d="M12 13c0-3.5 2.8-5 6.2-5 0 3.5-2.8 5-6.2 5Z" />
      <path d="M12 18.5c0-3.5-2.8-5-6.2-5 0 3.5 2.8 5 6.2 5Z" />
      <path d="M12 18.5c0-3.5 2.8-5 6.2-5 0 3.5-2.8 5-6.2 5Z" />
    </>
  ),
  fat: <path d="M12 3.5s5.8 6 5.8 10.4a5.8 5.8 0 0 1-11.6 0C6.2 9.5 12 3.5 12 3.5Z" />,
  coins: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.8" />
      <path d="M5 6v12.5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6" />
      <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" />
    </>
  ),
  ban: (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M6.2 6.2l11.6 11.6" />
    </>
  ),
  activity: <path d="M3 12h4l2.5-7 4.5 14 2.5-7H21" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5.5 15v-9a2 2 0 0 1 2-2h9" />
    </>
  ),
  male: (
    <>
      <circle cx="10" cy="14" r="5" />
      <path d="M13.8 10.2 20 4M15.2 4H20v4.8" />
    </>
  ),
  female: (
    <>
      <circle cx="12" cy="8.5" r="4.8" />
      <path d="M12 13.3v7.2M9 18h6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19.5 6v6c0 4.4-3.1 7.4-7.5 9-4.4-1.6-7.5-4.6-7.5-9V6L12 3Z" />
      <path d="m9 11.8 2.2 2.2 4-4.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.5L20 8.5a2.1 2.1 0 0 0-3-3L5.5 17 4 20Z" />
      <path d="m14.5 7 2.5 2.5" />
    </>
  ),
}

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.9 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? null}
    </svg>
  )
}

// شارة أيقونة دائرية موحدة لعناوين الأقسام
export function IconBadge({ name, className = '' }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 ${className}`}
    >
      <Icon name={name} className="h-5 w-5" />
    </span>
  )
}
