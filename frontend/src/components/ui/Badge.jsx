export function VerifiedBadge({ size = 'sm' }) {
  const cls = size === 'lg' ? 'text-xl' : 'text-[14px]'
  return (
    <span
      className={`material-symbols-outlined text-primary ${cls}`}
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      verified
    </span>
  )
}

export function PremiumBadge() {
  return (
    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
      Premium Member
    </span>
  )
}

export function InterestTag({ label, color = 'secondary' }) {
  const colorMap = {
    secondary: 'bg-secondary-fixed text-on-secondary-fixed-variant',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    primary: 'bg-primary-fixed text-on-primary-fixed-variant',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${colorMap[color] ?? colorMap.secondary}`}>
      {label}
    </span>
  )
}

export function NewBadge({ count }) {
  return (
    <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full text-xs font-bold">
      {count} NEW
    </span>
  )
}
