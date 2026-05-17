import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import ProfileCard from '../components/ui/ProfileCard'
import { SkeletonProfileCard } from '../components/ui/SkeletonCard'
import { useInfiniteProfiles, useMyProfile } from '../hooks/useProfiles'

const FILTER_CHIPS = [
  { label: 'For You',          icon: 'colors_spark', value: 'for_you'   },
  { label: 'Recent',           icon: 'schedule',     value: 'recent'    },
  { label: 'Near Me',          icon: 'near_me',      value: 'near_me'   },
  { label: 'Verified',         icon: 'verified',     value: 'verified'  },
  { label: 'Shared Interests', icon: 'interests',    value: 'interests' },
]

const EDUCATION_OPTIONS = ['Any Education', 'Masters Degree', 'PhD / Doctorate', 'Bachelors Degree']

const FALLBACK_PROFILES = [
  { id: 1, firstName: 'Ananya', age: 28, profession: 'Product Designer',   city: 'Mumbai',    isVerified: true,  photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', interests: ['Art', 'Travel'] },
  { id: 2, firstName: 'Rohan',  age: 31, profession: 'Software Architect', city: 'Bangalore', isVerified: false, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', interests: ['Hiking', 'Tech'] },
  { id: 3, firstName: 'Meera',  age: 27, profession: 'Pediatrician',       city: 'Delhi',     isVerified: true,  photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', interests: ['Yoga', 'Music'] },
  { id: 4, firstName: 'Arjun',  age: 33, profession: 'Creative Director',  city: 'Pune',      isVerified: true,  photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80', interests: ['Photo', 'Design'] },
  { id: 5, firstName: 'Ishita', age: 26, profession: 'UX Researcher',      city: 'Chennai',   isVerified: true,  photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80', interests: ['Design', 'Poetry'] },
  { id: 6, firstName: 'Kabir',  age: 30, profession: 'Fitness Lead',       city: 'Delhi',     isVerified: false, photoUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80', interests: ['Sports', 'Travel'] },
]

export default function DiscoverPage() {
  const [activeChip, setActiveChip] = useState('for_you')
  const [education,  setEducation]  = useState('Any Education')
  const [distance,   setDistance]   = useState(50)

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
    // Distance slider only makes sense when "Near Me" is active; passes
    // city of the logged-in user (exact match). A future geo enhancement
    // can replace this with radius + coordinates.
    ...(activeChip === 'near_me' && distance < 500 && myCity
      ? { city: myCity }
      : {}),
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
    : (isError ? FALLBACK_PROFILES : null)

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1440px] mx-auto px-6 py-10 flex gap-10 pb-32"
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:block w-72 flex-shrink-0 space-y-8">
        <div>
          <h3 className="text-xl font-black text-on-background mb-6">Advanced Search</h3>
          <div className="space-y-7">
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">school</span>
                Education
              </label>
              <select value={education} onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none">
                {EDUCATION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">distance</span>
                Distance ({distance}km)
                {activeChip !== 'near_me' && (
                  <span className="text-[10px] font-normal text-on-surface-variant/50">(activate Near Me)</span>
                )}
              </label>
              <input
                type="range" min={10} max={500} value={distance}
                onChange={(e) => { setDistance(Number(e.target.value)); setActiveChip('near_me') }}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-primary-fixed border border-primary/10">
          <p className="text-xs font-bold text-on-primary-fixed-variant tracking-widest uppercase mb-1">SoulSync Premium</p>
          <p className="text-lg font-black text-on-primary-fixed-variant mb-4 leading-snug">Unlock 3× more Daily Matches</p>
          <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-2xl text-sm font-bold shadow-btn-primary hover:shadow-btn-primary-hover active:scale-95 transition-all">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* ── Main feed ───────────────────────────────────────────────── */}
      <section className="flex-grow min-w-0">
        {/* Filter chips */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_CHIPS.map(({ label, icon, value }) => (
            <button key={value} onClick={() => setActiveChip(value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeChip === value
                  ? 'bg-primary text-white shadow-btn-primary'
                  : 'bg-white text-on-surface-variant border border-surface-variant hover:bg-orange-50 hover:border-primary/30'
              }`}>
              <span className="material-symbols-outlined text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>

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
        ) : profiles && profiles.length > 0 ? (
          <>
            <motion.div
              key={activeChip + education}
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
          </div>
        )}
      </section>
    </motion.main>
  )
}
