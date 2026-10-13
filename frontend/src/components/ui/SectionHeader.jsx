import { Link } from 'react-router-dom'

/** Consistent section heading: small overline, serif title, optional quiet link. */
export default function SectionHeader({ overline, title, subtitle, to, linkLabel = 'See all' }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {overline && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600 mb-1">{overline}</p>}
        <h2 className="text-[28px] leading-tight text-on-surface">{title}</h2>
        {subtitle && <p className="text-[13px] text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="flex-shrink-0 text-[13px] font-medium text-primary hover:underline underline-offset-4">
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
