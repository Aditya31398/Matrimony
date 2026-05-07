import { motion } from 'framer-motion'
import { useMyProfile } from '../hooks/useProfiles'
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const INFO_FIELDS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Height', 'height'],
  ['Mother Tongue', 'motherTongue'], ['Dietary Pref', 'dietaryPreference'],
  ['Education', 'education'], ['Horoscope', 'horoscope'],
  ['Looking For', 'lookingForGender'], ['Age Range', null],
]

export default function MyProfilePage() {
  const { data: profile, isLoading } = useMyProfile()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
        <p className="text-sm">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-32">
      <main className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-on-surface">My Profile</h1>
          <div className="flex items-center gap-3">
            <Link to="/edit-profile"
              className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-orange-50 transition-colors px-4 py-2 rounded-full border-2 border-orange-200">
              <span className="material-symbols-outlined text-lg">edit</span>
              Edit Profile
            </Link>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-red-500 transition-colors px-4 py-2 rounded-full hover:bg-red-50">
              <span className="material-symbols-outlined text-lg">logout</span>
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Photo */}
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="relative rounded-[32px] overflow-hidden aspect-[4/5] shadow-card">
              <img src={profile.photoUrl} alt={profile.firstName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                {profile.isPremium && <div className="mb-2"><PremiumBadge /></div>}
                <h2 className="text-2xl font-black leading-tight">
                  {profile.firstName} {profile.lastName}, {profile.age}
                </h2>
                <div className="flex items-center gap-1 mt-1 text-sm opacity-90">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {profile.city}, India
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <div className="md:col-span-3 space-y-5">
            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-black text-on-surface">Basic Info</h3>
                {profile.isVerified && <VerifiedBadge size="lg" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {INFO_FIELDS.map(([label, key]) => {
                  const value = key === null
                    ? (profile.ageMin && profile.ageMax ? `${profile.ageMin} – ${profile.ageMax} yrs` : '—')
                    : (profile[key] ?? '—')
                  return (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                      <span className="font-semibold text-on-surface text-sm capitalize">{value}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100">
                <h3 className="text-lg font-black text-on-surface mb-3">My Story</h3>
                {profile.bio.split('\n\n').map((para, i) => (
                  <p key={i} className="text-on-surface-variant leading-relaxed text-sm mb-3 last:mb-0">{para}</p>
                ))}
              </motion.div>
            )}

            {/* Interests */}
            {(profile.interests ?? []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
                className="bg-tertiary-fixed rounded-[28px] p-6">
                <h3 className="text-base font-black text-on-tertiary-fixed mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">palette</span> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-on-tertiary-container">{tag}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Lifestyle */}
            {(profile.lifestyle ?? []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-secondary-fixed rounded-[28px] p-6">
                <h3 className="text-base font-black text-on-secondary-fixed-variant mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">fitness_center</span> Lifestyle
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-on-secondary-container">{tag}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  )
}
