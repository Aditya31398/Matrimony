const TIER_TONE = {
  EXCELLENT: 'text-emerald-700',
  GOOD: 'text-emerald-700',
  AVERAGE: 'text-gold-600',
  POOR: 'text-red-700',
  INCOMPATIBLE: 'text-red-700',
}
const TIER_LABEL = { EXCELLENT: 'Excellent', GOOD: 'Good', AVERAGE: 'Average', POOR: 'Weak', INCOMPATIBLE: 'Challenging' }
const SYSTEM = { ASHTAKOOTA: 'Ashtakoota · Gun Milan', DASHAKOOTA: 'Dashakoota · Porutham', BASIC_ZODIAC: 'Star compatibility' }

const score = (c) => c.algorithm === 'DASHAKOOTA'
  ? `${Math.round(c.totalScore)}/${c.maxScore}`
  : `${c.totalScore.toFixed(1)}/${c.maxScore}`

/** Horoscope compatibility result from /api/compatibility, presented quietly. */
export default function HoroscopeCard({ compat }) {
  if (!compat) return <div className="h-28 rounded-xl shimmer" />
  if (compat.algorithm === 'NONE') return <p className="text-[14px] text-on-surface-variant">{compat.summary}</p>

  const rajju = compat.algorithm === 'DASHAKOOTA' && compat.rajjuDosha
  const doshas = [compat.nadiDosha && 'Nadi dosha', compat.rajjuDosha && 'Rajju dosha', compat.manglikDosha && 'Manglik mismatch'].filter(Boolean)

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">{SYSTEM[compat.algorithm] ?? compat.algorithm}</p>
          <p className="font-display text-[40px] leading-none text-on-surface mt-1">
            {score(compat)} <span className={`text-[16px] font-sans font-medium ${TIER_TONE[compat.tier] ?? ''}`}>
              {rajju ? 'Not advised' : TIER_LABEL[compat.tier] ?? ''}
            </span>
          </p>
        </div>
        <span className="text-[13px] text-on-surface-variant">{compat.percentage}%</span>
      </div>
      <div className="h-1 rounded-full bg-surface-container mt-4 overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${compat.percentage}%` }} />
      </div>

      <p className="text-[14px] text-on-surface-variant leading-relaxed mt-4">{compat.summary}</p>

      {doshas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {doshas.map((d) => (
            <span key={d} className="rounded-md border border-red-200 px-2 py-1 text-[12px] font-medium text-red-700">{d}</span>
          ))}
        </div>
      )}

      {compat.alternate && compat.alternate.algorithm !== 'NONE' && (
        <div className="flex items-center justify-between border-t border-outline-variant/70 mt-5 pt-4 text-[14px]">
          <span className="text-on-surface-variant">{SYSTEM[compat.alternate.algorithm]}</span>
          <span className="font-medium text-on-surface">{score(compat.alternate)} · {compat.alternate.percentage}%</span>
        </div>
      )}

      {(compat.advisories ?? []).length > 0 && (
        <ul className="mt-4 space-y-1.5 text-[13px] text-on-surface-variant">
          {compat.advisories.map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      )}

      {compat.kootas?.length > 0 && (
        <details className="group mt-5">
          <summary className="cursor-pointer select-none list-none text-[13px] font-medium text-primary hover:underline underline-offset-4">
            Show all {compat.kootas.length} kootas
          </summary>
          <div className="mt-4 space-y-2.5">
            {compat.kootas.map((k) => (
              <div key={k.name} className="grid grid-cols-[110px_1fr_44px] items-center gap-3 text-[13px]">
                <span className="text-on-surface">{k.name}</span>
                <div className="h-1 rounded-full bg-surface-container overflow-hidden">
                  <div className={`h-full rounded-full ${k.scored > 0 ? 'bg-primary/70' : 'bg-red-300'}`} style={{ width: `${(k.scored / k.max) * 100}%` }} />
                </div>
                <span className="text-right text-on-surface-variant">{k.scored}/{k.max}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
