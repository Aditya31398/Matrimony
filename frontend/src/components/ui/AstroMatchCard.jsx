import { Link } from 'react-router-dom'
import { useAstroMatch } from '../../hooks/usePremium'
import PremiumLock from './PremiumLock'

const verdictColor = (total) =>
  total >= 25 ? 'text-green-700 bg-green-50' : total >= 18 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'

const ALGO_LABEL = {
  ASHTAKOOTA: 'Ashtakoota (Gun Milan, North)',
  DASHAKOOTA: 'Dashakoota (Porutham, South)',
  BASIC_ZODIAC: 'Star compatibility',
}

const scoreText = (r) =>
  r.algorithm === 'DASHAKOOTA'
    ? `${Math.round(r.totalScore)} / ${r.maxScore} poruthams`
    : `${Number(r.totalScore).toFixed(1)} / ${r.maxScore}`

/** Language/tradition-aware result from the matching engine, with notes and any second system. */
function TraditionResult({ result }) {
  const mixed = result.region?.includes('/')
  const notAdvised = result.algorithm === 'DASHAKOOTA' && result.rajjuDosha
  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-surface-container-low px-4 py-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tradition-aware match</p>
          <p className="text-sm font-black text-on-surface">{ALGO_LABEL[result.algorithm] ?? result.algorithm}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-black ${notAdvised ? 'text-red-600' : 'text-on-surface'}`}>
            {notAdvised ? 'Not advised' : `${result.percentage}%`}
          </p>
          <p className="text-xs text-on-surface-variant">{scoreText(result)}</p>
        </div>
      </div>

      {mixed && (
        <p className="text-xs text-on-surface-variant">
          Mixed traditions ({result.region.replace('/', ' & ').toLowerCase()}), so both systems are shown.
        </p>
      )}

      {result.alternate && result.alternate.algorithm !== 'NONE' && (
        <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
          <span className="font-bold text-on-surface">{ALGO_LABEL[result.alternate.algorithm]}</span>
          <span className="font-black text-on-surface">
            {scoreText(result.alternate)}
            <span className="ml-2 text-xs font-bold text-on-surface-variant">{result.alternate.percentage}%</span>
          </span>
        </div>
      )}

      {(result.nadiDosha || result.rajjuDosha || result.manglikDosha) && (
        <div className="flex flex-wrap gap-2">
          {result.nadiDosha && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Nadi Dosha</span>}
          {result.rajjuDosha && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Rajju Dosha</span>}
          {result.manglikDosha && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Manglik mismatch</span>}
        </div>
      )}

      {(result.advisories ?? []).length > 0 && (
        <ul className="space-y-1.5">
          {result.advisories.map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** 36-point Guna Milan between the viewer and this profile (premium only). */
export default function AstroMatchCard({ profileId, firstName, isPremium }) {
  const { data, isLoading, isError, error } = useAstroMatch(profileId, isPremium)

  if (!isPremium) {
    return (
      <PremiumLock
        title="Astro compatibility (Guna Milan)"
        text={`See your 36-point kundli match with ${firstName}.`}
      />
    )
  }

  return (
    <div className="bg-white rounded-[32px] p-7 sm:p-9 shadow-card border border-slate-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined fill-icon">auto_awesome</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface">Astro Compatibility</h2>
          <p className="text-xs text-on-surface-variant">Ashtakoot Guna Milan · based on star &amp; rashi</p>
        </div>
      </div>

      {isLoading && <div className="h-24 rounded-2xl bg-surface-container animate-pulse" />}

      {isError && <p className="text-sm text-red-600">{error.message || 'Could not calculate the match'}</p>}

      {data && !data.available && (
        <p className="text-sm text-on-surface-variant">
          {data.myDetailsMissing
            ? <>Add your star and rashi in <Link to="/edit-profile" className="text-primary font-bold hover:underline">Edit Profile</Link> to see this match.</>
            : `${firstName} hasn't added their star and rashi yet.`}
        </p>
      )}

      {data?.available && (
        <>
          <div className="flex items-end gap-4 mb-5">
            <p className="text-5xl font-black text-on-surface leading-none">
              {data.total}<span className="text-xl text-on-surface-variant font-bold">/{data.max}</span>
            </p>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${verdictColor(data.total)}`}>{data.verdict}</span>
          </div>

          <div className="space-y-2.5 mb-5">
            {data.kootas.map((k) => (
              <div key={k.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-on-surface">{k.name} <span className="font-normal text-on-surface-variant">· {k.meaning}</span></span>
                  <span className="font-bold text-on-surface">{k.points}/{k.max}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(k.points / k.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {data.doshas.length > 0 && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-3">
              <strong>{data.doshas.join(' & ')}</strong> present — many families consult an astrologer about remedies.
            </p>
          )}
          {data.advanced && data.advanced.algorithm !== 'NONE' && <TraditionResult result={data.advanced} />}

          <p className="text-[11px] text-on-surface-variant">
            {data.bride.name}: {data.bride.nakshatra}, {data.bride.rashi} · {data.groom.name}: {data.groom.nakshatra}, {data.groom.rashi}.
            For guidance only; regional traditions may score some kootas differently.
          </p>
        </>
      )}
    </div>
  )
}
