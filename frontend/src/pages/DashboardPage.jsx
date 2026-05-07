import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProfileCard from '../components/ui/ProfileCard'
import InterestCard from '../components/ui/InterestCard'
import { NewBadge } from '../components/ui/Badge'
import { SkeletonProfileCard, SkeletonInterestCard } from '../components/ui/SkeletonCard'
import { useTopPicks, useViewers } from '../hooks/useProfiles'
import { useInterested } from '../hooks/useMatches'
import { useConversations } from '../hooks/useMessages'

const FALLBACK_TOP_PICKS = [
  { id: 1, firstName: 'Aditi', age: 26, profession: 'Product Designer', city: 'Mumbai', isVerified: true, photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', interests: ['Design', 'Travel'] },
  { id: 2, firstName: 'Rohan', age: 29, profession: 'Architect', city: 'Bengaluru', isVerified: true, photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', interests: ['Hiking', 'Tech'] },
  { id: 3, firstName: 'Sanya', age: 27, profession: 'Professor', city: 'Pune', isVerified: false, photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', interests: ['Books', 'Art'] },
  { id: 4, firstName: 'Kabir', age: 30, profession: 'Fitness Lead', city: 'Delhi', isVerified: false, photoUrl: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80', interests: ['Sports', 'Music'] },
]

const FALLBACK_INTERESTED = [
  { id: 1, profile: { id: 5, firstName: 'Meera', age: 25, profession: 'Software Engineer', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80', isVerified: true } },
  { id: 2, profile: { id: 6, firstName: 'Varun', age: 28, profession: 'Financial Analyst', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', isVerified: false } },
  { id: 3, profile: { id: 7, firstName: 'Ishita', age: 26, profession: 'UX Researcher', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', isVerified: true } },
  { id: 4, profile: { id: 8, firstName: 'Arjun', age: 31, profession: 'Tech Lead', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', isVerified: false } },
]

const FALLBACK_CONVERSATIONS = [
  { id: 1, otherProfile: { firstName: 'Priya Sharma', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }, lastMessage: 'That sounds like a great plan!', lastMessageTime: '12:45 PM', isOnline: true },
  { id: 2, otherProfile: { firstName: 'Rahul Verma', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }, lastMessage: 'Sent a photo', lastMessageTime: 'Yesterday', isOnline: false },
  { id: 3, otherProfile: { firstName: 'Sneha Kapur', photoUrl: 'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?w=100&q=80' }, lastMessage: 'Nice to meet you!', lastMessageTime: 'Monday', isOnline: false },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { data: picks, isLoading: picksLoading } = useTopPicks()
  const { data: interested, isLoading: intLoading } = useInterested()
  const { data: conversations, isLoading: convLoading } = useConversations()
  const { data: viewers } = useViewers()

  const topPicks = picks ?? FALLBACK_TOP_PICKS
  const interestedList = interested ?? FALLBACK_INTERESTED
  const convList = conversations ?? FALLBACK_CONVERSATIONS

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1280px] mx-auto px-6 py-8 pb-32"
    >
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-display-xl font-black text-on-surface mb-2">Find your SoulSync</h1>
        <p className="text-body-lg text-on-surface-variant">Here are your personalized matches for today.</p>
      </header>

      {/* ── Top Picks ───────────────────────────────────────────────── */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-headline-lg font-black text-on-surface">Top Picks for You</h2>
          <Link to="/discover" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {picksLoading
            ? [...Array(4)].map((_, i) => (
                <motion.div key={i} variants={fadeUp}><SkeletonProfileCard /></motion.div>
              ))
            : topPicks.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProfileCard profile={p} variant="compact" />
                </motion.div>
              ))}
        </motion.div>
      </section>

      {/* ── Who Viewed Me ───────────────────────────────────────────── */}
      {viewers && viewers.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Who Viewed Your Profile</h2>
            <span className="text-sm font-bold text-on-surface-variant">{viewers.length} visitor{viewers.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {viewers.map((p) => (
              <Link key={p.id} to={`/profile/${p.id}`} className="flex-shrink-0">
                <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center gap-2 w-24 cursor-pointer">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-200">
                    <img src={p.photoUrl} alt={p.firstName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80' }}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface text-center truncate w-full">{p.firstName}</span>
                  <span className="text-[10px] text-on-surface-variant truncate w-full text-center">{p.profession}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Bento grid: Interested + Recent ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interested in You */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Interested in You</h2>
            <NewBadge count={interestedList.length} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {intLoading
              ? [...Array(4)].map((_, i) => <SkeletonInterestCard key={i} />)
              : interestedList.map((match) => (
                  <InterestCard key={match.id} match={match} />
                ))}
          </div>
        </section>

        {/* Recent Messages */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Recent</h2>
            <Link to="/messages">
              <button className="p-2 text-primary hover:bg-orange-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
            </Link>
          </div>
          <div className="bg-white rounded-[24px] p-2 shadow-card">
            {convLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-surface-container shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-surface-container rounded shimmer" />
                      <div className="h-3 w-36 bg-surface-container rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              convList.map((conv) => (
                <Link key={conv.id} to={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-surface-container rounded-[18px] transition-colors cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={conv.otherProfile?.photoUrl} alt={conv.otherProfile?.firstName} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-on-surface truncate">{conv.otherProfile?.firstName}</h4>
                        <span className="text-[10px] text-on-surface-variant font-bold">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
            <div className="p-3">
              <Link to="/messages">
                <button className="w-full py-3 text-center text-primary text-sm font-bold hover:bg-orange-50 rounded-xl transition-colors">
                  View All Messages
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  )
}
