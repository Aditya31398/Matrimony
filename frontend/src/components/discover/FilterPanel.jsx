import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RELIGIONS, LANGUAGES, DIETS, EDUCATION, AGES } from '../../utils/profileOptions'

const SELECT = 'w-full bg-surface-container-low border border-outline-variant/70 rounded-xl py-2.5 px-3 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50'
const INPUT = SELECT

function Label({ children, locked }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 mb-2">
      {children}
      {locked && <span className="material-symbols-outlined text-[14px] text-gold-500">lock</span>}
    </label>
  )
}

/** Text filter that only commits after typing pauses, so each keystroke isn't a search. */
function DebouncedInput({ value, onCommit, ...props }) {
  const [draft, setDraft] = useState(value ?? '')
  useEffect(() => setDraft(value ?? ''), [value])
  useEffect(() => {
    if ((draft || '') === (value || '')) return
    const t = setTimeout(() => onCommit(draft.trim()), 450)
    return () => clearTimeout(t)
  }, [draft]) // eslint-disable-line react-hooks/exhaustive-deps
  return <input value={draft} onChange={(e) => setDraft(e.target.value)} {...props} />
}

/**
 * Discover filters. Age, religion, caste and photo are open to everyone; the rest
 * filter on details only Premium members can see, so they're locked for free members.
 */
export default function FilterPanel({ filters, setFilter, clearAll, activeCount, isPremium, showTitle = true }) {
  const locked = !isPremium

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between min-h-[20px]">
        {showTitle && <h2 className="text-2xl text-on-background">Filters</h2>}
        {activeCount > 0 && (
          <button onClick={clearAll} className="ml-auto text-sm font-semibold text-primary hover:underline">Clear all</button>
        )}
      </div>

      <div>
        <Label>Age</Label>
        <div className="flex items-center gap-2">
          <select aria-label="Minimum age" className={SELECT} value={filters.ageMin ?? ''}
            onChange={(e) => setFilter('ageMin', e.target.value)}>
            <option value="">Any</option>
            {AGES.filter((a) => !filters.ageMax || a <= filters.ageMax).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <span className="text-sm text-on-surface-variant">to</span>
          <select aria-label="Maximum age" className={SELECT} value={filters.ageMax ?? ''}
            onChange={(e) => setFilter('ageMax', e.target.value)}>
            <option value="">Any</option>
            {AGES.filter((a) => !filters.ageMin || a >= filters.ageMin).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label>Religion</Label>
        <select className={SELECT} value={filters.religion ?? ''} onChange={(e) => setFilter('religion', e.target.value)}>
          <option value="">Any religion</option>
          {RELIGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <Label>Caste</Label>
        <DebouncedInput className={INPUT} placeholder="e.g. Brahmin, Nair" maxLength={60}
          value={filters.caste} onCommit={(v) => setFilter('caste', v)} />
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-on-surface cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-primary" checked={!!filters.withPhoto}
          onChange={(e) => setFilter('withPhoto', e.target.checked ? 'true' : '')} />
        Only profiles with a visible photo
      </label>

      <div className="pt-4 border-t border-outline-variant/70 space-y-5">
        {locked && (
          <Link to="/premium" className="block rounded-xl bg-primary-fixed/60 px-4 py-3 text-sm text-on-primary-fixed-variant hover:bg-primary-fixed transition-colors">
            <span className="font-bold">Premium filters</span> — mother tongue, location, education, diet and Manglik. <span className="font-semibold underline">Upgrade</span>
          </Link>
        )}

        <div>
          <Label locked={locked}>Mother tongue</Label>
          <select className={SELECT} disabled={locked} value={filters.motherTongue ?? ''}
            onChange={(e) => setFilter('motherTongue', e.target.value)}>
            <option value="">Any language</option>
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <Label locked={locked}>City or state</Label>
          <DebouncedInput className={INPUT} disabled={locked} placeholder="e.g. Bengaluru or Kerala" maxLength={60}
            value={filters.location} onCommit={(v) => setFilter('location', v)} />
        </div>

        <div>
          <Label locked={locked}>Education</Label>
          <select className={SELECT} disabled={locked} value={filters.education ?? ''}
            onChange={(e) => setFilter('education', e.target.value)}>
            <option value="">Any education</option>
            {EDUCATION.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label locked={locked}>Diet</Label>
            <select className={SELECT} disabled={locked} value={filters.diet ?? ''}
              onChange={(e) => setFilter('diet', e.target.value)}>
              <option value="">Any</option>
              {DIETS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label locked={locked}>Manglik</Label>
            <select className={SELECT} disabled={locked} value={filters.manglik ?? ''}
              onChange={(e) => setFilter('manglik', e.target.value)}>
              <option value="">Any</option>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
