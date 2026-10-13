import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ProfileCard from '../components/ui/ProfileCard'
import { SkeletonProfileCard } from '../components/ui/SkeletonCard'
import { Link } from 'react-router-dom'
import { useInfiniteProfiles, useMyProfile } from '../hooks/useProfiles'

const FILTER_CHIPS = [
  { label: 'Matches for you',  icon: 'auto_awesome', value: 'for_you'   },
  { label: 'Recent',           icon: 'schedule',     value: 'recent'    },
  { label: 'Near Me',          icon: 'near_me',      value: 'near_me'   },
  { label: 'Verified',         icon: 'verified',     value: 'verified'  },
  { label: 'Shared Interests', icon: 'interests',    value: 'interests' },
]

const EDUCATION_OPTIONS = ['Any Education', 'Masters Degree', 'PhD / Doctorate', 'Bachelors Degree']

export default function DiscoverPage() {
  const [activeChip, setActiveChip] = useState('for_you')
  const [education,  setEducation]  = useState('Any Education')

  // Own profile — used to resolve city (near_me) and interests (shared interests)
  const { data: myProfile } = useMyProfile()
  const myCity      = myProfile?.city ?? null
  const myInterests = myProfile?.interests ?? []

  // Build query params from active chip + sidebar controls
  const educationParam = education === 'Any Education' ? undefined : education

  const chipParams = {
    for_you:   {},
    recent:    { sort: 'recent' },
    near_me:   { city: myCity ?? undefined },
    verified:  { verified: true },
    interests: { interest: myInterests[0] ?? undefined },
  }

  const queryParams = {
    education: educationParam,
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

  const total = data?.pages?.[0]?.totalElements ?? profiles?.length

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-32">
      <header className="mb-7">
        <p className="text-[12px] uppercase tracking-[0.14em] text-on-surface-variant">Discover</p>
        <h1 className="text-[40px] sm:text-[48px] leading-[1.05] text-on-surface mt-1">People you may like</h1>
        <p className="text-[14px] text-on-surface-variant mt-2">
          {profiles ? `${total} ${total === 1 ? 'profile' : 'profiles'} for your preferences` : 'Finding people who share your values'}
        </p>
      </header>

      {/* Filters: quick views on the left, education on the right */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 pb-6 border-b border-outline-variant/70">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 flex-1">
          {FILTER_CHIPS.map(({ label, icon, value }) => (
            <button key={value} onClick={() => setActiveChip(value)}
              aria-pressed={activeChip === value}
              className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors ${
                activeChip === value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:text-on-surface hover:border-on-surface/30'
              }`}>
              <span className="material-symbols-outlined text-[17px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <select value={education} onChange={(e) => setEducation(e.target.value)} aria-label="Education"
          className="h-9 rounded-full border border-outline-variant bg-white pl-3.5 pr-8 text-[13px] font-medium text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20">
          {EDUCATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>

      {activeChip === 'near_me' && !myCity && !isLoading && (
        <p className="mb-6 text-[13px] text-on-surface-variant">
          Add your city in <Link to="/edit-profile" className="text-primary underline underline-offset-4">your profile</Link> to see people near you.
        </p>
      )}
      {activeChip === 'interests' && myInterests.length === 0 && !isLoading && (
        <p className="mb-6 text-[13px] text-on-surface-variant">
          Add interests in <Link to="/edit-profile" className="text-primary underline underline-offset-4">your profile</Link> to find shared hobbies.
        </p>
      )}

      {!myProfile?.isPremium && (
        <Link to="/premium"
          className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 rounded-2xl bg-primary px-6 py-5 text-white hover:bg-primary/95 transition-colors">
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400">Premium</p>
            <p className="font-display text-[22px] leading-snug mt-0.5">See full profiles, chat freely and check horoscope compatibility</p>
          </div>
          <span className="text-[13px] font-semibold text-primary bg-gold-500 rounded-lg px-4 py-2 self-start sm:self-auto">View plans</span>
        </Link>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => <SkeletonProfileCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="py-24 text-center text-on-surface-variant">
          <p className="font-display text-[26px] text-on-surface">We couldn't load profiles</p>
          <p className="text-[14px] mt-1">Check your connection and refresh the page.</p>
        </div>
      ) : profiles && profiles.length > 0 ? (
        <>
          <motion.div key={`${activeChip}-${education}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {profiles.map((p) => <ProfileCard key={p.id} profile={p} variant="grid" />)}
          </motion.div>
          <div ref={sentinelRef} className="h-8 mt-8 flex items-center justify-center">
            {isFetchingNextPage && <div className="w-6 h-6 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />}
            {!hasNextPage && profiles.length > 8 && <p className="text-[13px] text-on-surface-variant">You've seen everyone for now</p>}
          </div>
        </>
      ) : (
        <div className="py-24 text-center text-on-surface-variant">
          <p className="font-display text-[26px] text-on-surface">No one here yet</p>
          <p className="text-[14px] mt-1">Try another filter — new members join every day.</p>
        </div>
      )}
    </motion.main>
  )
}
