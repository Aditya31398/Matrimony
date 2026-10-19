import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link, useSearchParams } from 'react-router-dom'
import ProfileCard from '../components/ui/ProfileCard'
import { SkeletonProfileCard } from '../components/ui/SkeletonCard'
import Modal from '../components/ui/Modal'
import FilterPanel from '../components/discover/FilterPanel'
import { useInfiniteProfiles, useMyProfile } from '../hooks/useProfiles'

const FILTER_CHIPS = [
  { label: 'Matches for you',  icon: 'auto_awesome', value: 'for_you'   },
  { label: 'Recent',           icon: 'schedule',     value: 'recent'    },
  { label: 'Near Me',          icon: 'near_me',      value: 'near_me'   },
  { label: 'Verified',         icon: 'verified',     value: 'verified'  },
  { label: 'Shared Interests', icon: 'interests',    value: 'interests' },
]

// Filters kept in the URL so they survive back/refresh and can be shared
const FILTER_KEYS = ['ageMin', 'ageMax', 'religion', 'caste', 'withPhoto', 'motherTongue', 'location', 'education', 'diet', 'manglik']
const PREMIUM_KEYS = new Set(['motherTongue', 'location', 'education', 'diet', 'manglik'])

const pillLabel = (key, value) => ({
  ageMin: `From ${value} yrs`, ageMax: `Up to ${value} yrs`, withPhoto: 'With photo',
  manglik: value === 'true' ? 'Manglik' : 'Not Manglik',
}[key] ?? value)

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams()
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeChip = params.get('view') ?? 'for_you'

  // Own profile — used to resolve city (near_me), interests (shared interests) and premium filters
  const { data: myProfile } = useMyProfile()
  const myCity      = myProfile?.city ?? null
  const myInterests = myProfile?.interests ?? []
  const isPremium   = !!myProfile?.isPremium

  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || undefined]))
  const activeFilters = FILTER_KEYS.filter((k) => filters[k] && (isPremium || !PREMIUM_KEYS.has(k)))

  const setParam = (key, value) => setParams((prev) => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value); else next.delete(key)
    return next
  }, { replace: true })
  const clearAll = () => setParams((prev) => {
    const next = new URLSearchParams(prev)
    FILTER_KEYS.forEach((k) => next.delete(k))
    return next
  }, { replace: true })

  const chipParams = {
    for_you:   {},
    recent:    { sort: 'recent' },
    near_me:   { city: myCity ?? undefined },
    verified:  { verified: true },
    interests: { interest: myInterests[0] ?? undefined },
  }

  const queryParams = {
    ...Object.fromEntries(activeFilters.map((k) => [k, filters[k]])),
    ...chipParams[activeChip],
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProfiles(queryParams)

  // Sentinel div triggers next-page fetch when scrolled into view
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 })
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten all loaded pages into a single profile list
  const profiles = data
    ? data.pages.flatMap((page) => page?.content ?? (Array.isArray(page) ? page : []))
    : null

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-10 flex gap-10 pb-32"
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6 self-start sticky top-24">
        <div className="bg-white rounded-[24px] border border-outline-variant/70 p-6">
          <FilterPanel filters={filters} setFilter={setParam} clearAll={clearAll}
            activeCount={activeFilters.length} isPremium={isPremium} />
        </div>

        {!myProfile?.isPremium && (
          <div className="p-6 rounded-[24px] text-white relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
            <span className="material-symbols-outlined fill-icon absolute -right-3 -top-3 text-[96px] text-white/10">workspace_premium</span>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gold-400 mb-2">Premium</p>
            <p className="font-display text-2xl leading-snug mb-5">See full profiles, chat freely and check horoscope matches</p>
            <Link to="/premium" className="block text-center w-full py-3 rounded-xl text-sm font-bold text-[#3A1F1A] active:scale-95 transition-all"
              style={{ background: 'var(--gradient-gold)' }}>
              Upgrade now
            </Link>
          </div>
        )}
      </aside>

      {/* ── Main feed ───────────────────────────────────────────────── */}
      <section className="flex-1 min-w-0">
        <header className="mb-6">
          <h1 className="text-[40px] leading-tight text-on-surface">Discover</h1>
          <p className="text-sm text-on-surface-variant">
            {profiles ? `${data?.pages?.[0]?.totalElements ?? profiles.length} profiles match your preferences` : 'Finding people who share your values'}
          </p>
        </header>

        {/* Filter chips */}
        <div className="flex items-center gap-2.5 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSheetOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border border-primary text-primary bg-white">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters{activeFilters.length > 0 && ` (${activeFilters.length})`}
          </button>
          {FILTER_CHIPS.map(({ label, icon, value }) => (
            <button key={value} onClick={() => setParam('view', value === 'for_you' ? '' : value)}
              aria-pressed={activeChip === value}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors ${
                activeChip === value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/40 hover:text-primary'
              }`}>
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Active filters, each removable */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {activeFilters.map((k) => (
              <button key={k} onClick={() => setParam(k, '')}
                className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[12px] font-semibold hover:bg-primary-fixed-dim transition-colors">
                {pillLabel(k, filters[k])}
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            ))}
            <button onClick={clearAll} className="text-[12px] font-semibold text-on-surface-variant hover:text-primary ml-1">Clear all</button>
          </div>
        )}
        <div className="mb-4" />

        {/* Near Me + no city warning */}
        {activeChip === 'near_me' && !myCity && !isLoading && (
          <div className="mb-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <span className="material-symbols-outlined text-lg">info</span>
            Add your city to your profile to see matches near you.
          </div>
        )}

        {/* Shared Interests + no interests warning */}
        {activeChip === 'interests' && myInterests.length === 0 && !isLoading && (
          <div className="mb-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <span className="material-symbols-outlined text-lg">info</span>
            Add interests to your profile to find people with shared hobbies.
          </div>
        )}

        {/* Profile grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <SkeletonProfileCard key={i} />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-30">cloud_off</span>
            <p className="text-lg font-bold">Couldn't load profiles</p>
            <p className="text-sm">Check your connection and refresh the page.</p>
          </div>
        ) : profiles && profiles.length > 0 ? (
          <>
            <motion.div
              key={`${activeChip}-${params.toString()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {profiles.map((p) => <ProfileCard key={p.id} profile={p} variant="grid" />)}
            </motion.div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-8 mt-6 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="w-8 h-8 border-4 border-orange-100 border-t-primary rounded-full animate-spin" />
              )}
              {!hasNextPage && profiles.length > 6 && (
                <p className="text-sm text-on-surface-variant">You've seen all profiles</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl opacity-30">search_off</span>
            <p className="text-lg font-bold">No profiles found</p>
            <p className="text-sm">Try adjusting your filters</p>
            {activeFilters.length > 0 && (
              <button onClick={clearAll} className="mt-2 text-sm font-semibold text-primary hover:underline">Clear all filters</button>
            )}
          </div>
        )}
      </section>

      {/* Phones and tablets: same filters in a bottom sheet */}
      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filters">
        <FilterPanel filters={filters} setFilter={setParam} clearAll={clearAll}
          activeCount={activeFilters.length} isPremium={isPremium} showTitle={false} />
        <button onClick={() => setSheetOpen(false)}
          className="mt-6 w-full py-3.5 rounded-xl text-white font-bold" style={{ background: 'var(--gradient-primary)' }}>
          Show {data?.pages?.[0]?.totalElements ?? ''} results
        </button>
      </Modal>
    </motion.main>
  )
}
