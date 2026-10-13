import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { useUnreadNotifications, useNotifications } from '../../hooks/useFeatures'
import { notificationService } from '../../services/featureService'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../../utils/placeholder'

const TYPE_ICON = { INTEREST: 'favorite', ACCEPTED: 'handshake', MESSAGE: 'chat' }

function timeAgo(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: unread = 0 } = useUnreadNotifications()
  const { data: items = [], isLoading } = useNotifications(open)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] })

  const openItem = async (n) => {
    setOpen(false)
    if (!n.read) notificationService.read(n.id).then(refresh)
    if (n.link) navigate(n.link)
  }

  const markAll = () => notificationService.readAll().then(refresh)

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        className="relative p-2 rounded-full hover:bg-primary/5 transition-all duration-300 active:scale-95">
        <span className="material-symbols-outlined text-slate-600">notifications</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] bg-white rounded-[24px] shadow-float border border-slate-100 overflow-hidden z-[70]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-black text-on-surface">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs font-bold text-primary hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <div className="w-7 h-7 border-4 border-orange-100 border-t-primary rounded-full animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl opacity-30">notifications_off</span>
                  <p className="text-sm font-bold mt-2">You're all caught up</p>
                  <p className="text-xs mt-1">Interests, accepted requests and messages show up here.</p>
                </div>
              ) : (
                items.map((n) => (
                  <button key={n.id} onClick={() => openItem(n)}
                    className={`w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-surface transition-colors ${n.read ? '' : 'bg-orange-50/60'}`}>
                    <div className="relative flex-shrink-0">
                      <img src={n.actorPhotoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt=""
                        className="w-11 h-11 rounded-full object-cover" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="material-symbols-outlined fill-icon text-[12px]">{TYPE_ICON[n.type] ?? 'notifications'}</span>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${n.read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>{n.text}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
