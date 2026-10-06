// شعار الموقع بنفس سيستم الأيقونات (Stroke style: viewBox 24، حواف دائرية)
// src/components/Logo.jsx
export default function LogoMark({ className = 'h-9 w-9', strokeWidth = 1.9 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="محمد منصور"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <path d="M7.5 16.5V10.7c0-.4.45-.6.75-.4L12 12.4l3.75-2.1c.3-.2.75 0 .75.4v5.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
