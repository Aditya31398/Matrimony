import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useConnect, useShortlist } from '../hooks/useMatches'
import { useStartConversation } from '../hooks/useMessages'
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge'
import toast from 'react-hot-toast'

const FALLBACK = {
  id: 1,
  firstName: 'Ananya', lastName: 'Sharma', age: 28, profession: 'Product Designer',
  city: 'Mumbai', state: 'Maharashtra', isVerified: true, isPremium: true,
  photoUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=85',
  religion: 'Hindu (Brahmin)', height: "5'6\" (168cm)", motherTongue: 'Hindi, Marathi',
  dietaryPreference: 'Vegetarian', education: 'Masters in Design', horoscope: 'Leo (Sun Sign)',
  bio: "I'm a curious soul who finds joy in the intersection of technology and human emotion. By day, I design digital experiences that make life easier; by night, I'm usually found experimenting with fusion recipes in my kitchen or lost in a classic Murakami novel.\n\nGrowing up in a household that balanced tradition with modern values, I've learned to appreciate the quiet moments as much as the grand milestones.",
  interests: ['UI/UX Design', 'Oil Painting', 'Architecture', 'Podcasts'],
  lifestyle: ['Yoga', 'Trekking', 'Early Bird', 'Travel Enthusiast'],
  lookingFor: [
    'Someone who values kindness and emotional intelligence as much as professional ambition.',
    'A partner who enjoys deep conversations about life, philosophy, and the future.',
  ],
}

const INFO_FIELDS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Height', 'height'],
  ['Mother Tongue', 'motherTongue'], ['Dietary Pref', 'dietaryPreference'],
  ['Education', 'education'], ['Horoscope', 'horoscope'],
]

export default function ProfileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProfile(id)
  const connect = useConnect()
  const shortlist = useShortlist()
  const startConversation = useStartConversation()

  const profile = data ?? (isError ? FALLBACK : null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl opacity-30">person_off</span>
        <p className="text-xl font-bold">Profile not found</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Go back
        </button>
      </div>
    )
  }

  const handleConnect = () => {
    connect.mutate(profile.id, {
      onSuccess: () => toast.success(`Connection request sent to ${profile.firstName}!`),
      onError: (e) => toast.error(e.message || 'Already connected or request pending'),
    })
  }

  const handleShortlist = () => {
    shortlist.mutate(profile.id, {
      onSuccess: () => toast.success(`${profile.firstName} added to shortlist`),
      onError: (e) => toast.error(e.message || 'Could not shortlist'),
    })
  }

  const handleMessage = () => {
    startConversation.mutate(profile.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
      onError: () => toast.error('Could not open chat'),
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-40">
      {/* Back button */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Photo + Basic Info ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="relative group">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.10)] group-hover:scale-[1.01] transition-transform duration-500">
                <img src={profile.photoUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  {profile.isPremium && <div className="mb-3"><PremiumBadge /></div>}
                  <h1 className="text-[40px] font-black leading-tight">
                    {profile.firstName} {profile.lastName}, {profile.age}
                  </h1>
                  <div className="flex items-center gap-5 mt-2 opacity-90 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      {profile.city}, India
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                      {profile.profession}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-white rounded-[32px] p-8 shadow-card border border-slate-100">
              <h3 className="text-xl font-black text-on-surface mb-5">Basic Info</h3>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                {INFO_FIELDS.map(([label, key]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    <span className="font-semibold text-on-surface text-sm">{profile[key] ?? '—'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Story, Interests, Looking For ─────────────────── */}
          <div className="lg:col-span-7 space-y-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-[32px] p-9 shadow-card border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined fill-icon">auto_awesome</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface">My Story</h2>
                {profile.isVerified && <VerifiedBadge size="lg" />}
              </div>
              {profile.bio?.split('\n\n').map((para, i) => (
                <p key={i} className="text-on-surface-variant leading-relaxed text-[15px] mb-4 last:mb-0">{para}</p>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-tertiary-fixed rounded-[32px] p-7">
                <h3 className="text-lg font-black text-on-tertiary-fixed mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">palette</span> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests ?? []).map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-on-tertiary-container">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="bg-secondary-fixed rounded-[32px] p-7">
                <h3 className="text-lg font-black text-on-secondary-fixed-variant mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">fitness_center</span> Lifestyle
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.lifestyle ?? []).map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-on-secondary-container">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {(profile.lookingFor ?? []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-primary-fixed rounded-[32px] p-9 border border-orange-100/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined fill-icon">favorite</span>
                  </div>
                  <h2 className="text-2xl font-black text-on-primary-fixed">What I'm Looking For</h2>
                </div>
                <div className="space-y-4">
                  {profile.lookingFor.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">check_circle</span>
                      <p className="text-on-primary-fixed-variant text-[15px] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* ── Floating Action Bar ──────────────────────────────────────── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[60]"
      >
        <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-4 shadow-float flex items-center gap-3 border border-orange-100/50">
          <button onClick={handleShortlist} disabled={shortlist.isPending}
            className="h-14 w-14 rounded-2xl bg-white border-2 border-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-60 flex-shrink-0">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
          <button onClick={handleMessage} disabled={startConversation.isPending}
            className="flex-1 h-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60">
            {startConversation.isPending
              ? <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              : <><span className="material-symbols-outlined fill-icon text-[20px]">chat</span>Message</>
            }
          </button>
          <button onClick={handleConnect} disabled={connect.isPending}
            className="flex-[1.3] h-14 rounded-2xl text-white font-black flex items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover active:scale-95 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ae3115 0%, #ff6b4a 100%)' }}>
            {connect.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span className="material-symbols-outlined fill-icon">send</span>Connect</>
            }
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
