import { Link } from 'react-router-dom'
import { formatLastSeen } from '../../utils/lastSeen'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80'

export default function MessageItem({ conversation, isActive, onClick }) {
  if (!conversation) return null
  const { id, otherProfile, lastMessage, lastMessageTime, isOnline, unreadCount } = conversation
  const lastSeenLabel = formatLastSeen(otherProfile?.lastSeenAt, isOnline)

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-[16px] text-left transition-colors ${
        isActive ? 'bg-primary-container/10' : 'hover:bg-surface'
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={otherProfile?.photoUrl || PLACEHOLDER}
          alt={otherProfile?.firstName}
          className="w-14 h-14 rounded-full object-cover"
          loading="lazy"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3 className="font-bold text-sm text-on-surface truncate">{otherProfile?.firstName}</h3>
          <span className={`text-[12px] ${isActive ? 'text-primary' : 'text-on-surface-variant'} font-medium`}>
            {lastMessageTime}
          </span>
        </div>
        <p className="text-[11px] text-green-600 font-semibold mb-0.5">
          {isOnline ? 'Online' : lastSeenLabel ? `Last seen ${lastSeenLabel}` : ''}
        </p>
        <p className={`text-sm truncate ${unreadCount > 0 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>{lastMessage}</p>
      </div>
      {unreadCount > 0 && (
        <div className="min-w-[20px] h-5 bg-primary rounded-full flex items-center justify-center px-1 flex-shrink-0">
          <span className="text-[11px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
        </div>
      )}
    </button>
  )
}
