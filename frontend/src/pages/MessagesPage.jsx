import { useState, useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import MessageItem from '../components/ui/MessageItem'
import { useConversations, useMessages, useIcebreakers, useSendMessage, CONVERSATIONS_KEY } from '../hooks/useMessages'
import { useChat } from '../hooks/useChat'
import { usePremium } from '../hooks/usePremium'
import { useAuth } from '../context/AuthContext'
import { formatLastSeen } from '../utils/lastSeen'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../utils/placeholder'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { auth } = useAuth()
  const { isPremium } = usePremium()
  const myProfileId = auth?.profileId

  const [searchQuery, setSearchQuery] = useState('')
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const { data: conversations = [], isLoading: convLoading, isError: convError } = useConversations()

  // On wide screens open the most recent chat by default; on phones the list shows first
  const isWide = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  const activeId = conversationId ?? (isWide && conversations[0] ? String(conversations[0].id) : null)

  // Real-time WebSocket — replaces all polling for the active conversation
  useChat(activeId, myProfileId)

  const { data: messages = [], isLoading: msgsLoading, dataUpdatedAt } = useMessages(activeId)
  const { data: icebreakers = [] } = useIcebreakers(isPremium ? activeId : null)
  const sendMsg = useSendMessage(activeId)

  // Opening a chat marks it read on the server; refresh the list so the unread badge clears
  useEffect(() => {
    if (activeId && dataUpdatedAt) {
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_KEY], exact: true })
    }
  }, [activeId, dataUpdatedAt, queryClient])

  const filteredConvs = conversations.filter((c) =>
    c.otherProfile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConvObj = conversations.find((c) => String(c.id) === activeId)
  const activeProfile = activeConvObj?.otherProfile
  const activeIsOnline = activeConvObj?.isOnline ?? false
  const activeLastSeen = formatLastSeen(activeProfile?.lastSeenAt, activeIsOnline)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    sendMsg.mutate(text.trim(), {
      onError: (e) => toast.error(e.message || 'Failed to send message'),
    })
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1280px] w-full mx-auto p-4 sm:p-6 flex gap-6 h-[calc(100vh-140px)] pb-28 md:pb-6"
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`w-full md:w-[300px] bg-white rounded-2xl shadow-card border border-outline-variant/30 flex-col overflow-hidden flex-shrink-0 ${
        activeId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-5 border-b border-surface-variant/50">
          <h2 className="text-xl font-semibold text-on-surface mb-4">Messages</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input type="text" placeholder="Search conversations…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface pl-11 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary-container/50 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {convLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-surface-container rounded" />
                    <div className="h-3 w-36 bg-surface-container rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : convError ? (
            <p className="text-center text-sm text-red-600 p-6">Couldn't load conversations. Please refresh.</p>
          ) : filteredConvs.length > 0 ? (
            filteredConvs.map((conv) => (
              <MessageItem
                key={conv.id}
                conversation={conv}
                isActive={String(conv.id) === activeId}
                onClick={() => navigate(`/messages/${conv.id}`)}
              />
            ))
          ) : (
            <div className="text-center p-6 space-y-2">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">forum</span>
              <p className="text-sm font-bold text-on-surface">No conversations yet</p>
              <p className="text-xs text-on-surface-variant">Open a profile and tap Message to start chatting.</p>
              <Link to="/discover" className="inline-block text-sm font-bold text-primary hover:underline pt-1">Browse profiles</Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Chat window ─────────────────────────────────────────────── */}
      <section className={`flex-1 bg-white rounded-2xl shadow-card border border-outline-variant/30 flex-col overflow-hidden min-w-0 ${
        activeId ? 'flex' : 'hidden md:flex'
      }`}>
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8 text-center">
            <span className="material-symbols-outlined text-6xl opacity-30">chat</span>
            <p className="font-bold">Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="p-4 sm:p-5 border-b border-surface-variant/50 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-10 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => navigate('/messages')} aria-label="Back to conversations"
                  className="md:hidden p-1.5 -ml-1 rounded-full hover:bg-surface text-on-surface-variant">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="relative flex-shrink-0">
                  <img
                    src={activeProfile?.photoUrl || AVATAR_PLACEHOLDER}
                    onError={showPlaceholderOnError}
                    alt={activeProfile?.firstName ?? 'Chat'}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {activeIsOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-on-surface truncate">{activeProfile?.firstName ?? 'Chat'}</h1>
                  {activeLastSeen && (
                    <p className={`text-sm font-medium flex items-center gap-1 ${activeIsOnline ? 'text-green-600' : 'text-on-surface-variant'}`}>
                      {activeIsOnline && <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />}
                      {activeIsOnline ? 'Online' : `Last seen ${activeLastSeen}`}
                    </p>
                  )}
                </div>
              </div>
              {activeProfile?.id && (
                <Link to={`/profile/${activeProfile.id}`}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-outline-variant/50 text-sm font-bold text-on-surface hover:bg-surface transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px]">account_circle</span>
                  <span className="hidden sm:inline">View Profile</span>
                </Link>
              )}
            </header>

            {/* Guided icebreakers (only useful when you can send) */}
            {isPremium && icebreakers.length > 0 && messages.length === 0 && (
              <div className="px-6 py-4 bg-gradient-to-b from-primary-container/5 to-transparent border-b border-surface-variant/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                  </div>
                  <span className="text-sm font-bold text-on-surface">Conversation starters</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {icebreakers.map((ib) => (
                    <button key={ib.id} onClick={() => setText(ib.prompt)}
                      className={`flex-shrink-0 max-w-[260px] text-left p-3.5 rounded-xl transition-all ${
                        ib.featured
                          ? 'bg-primary text-white shadow-md hover:shadow-lg'
                          : 'bg-surface border border-outline-variant/40 text-on-surface hover:border-primary/50'
                      }`}>
                      <span className={`block text-[10px] font-semibold tracking-wider uppercase mb-1 ${ib.featured ? 'opacity-90' : 'text-primary/80'}`}>
                        {ib.topic}
                      </span>
                      <p className="text-[13px] leading-snug">{ib.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 flex flex-col">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <p className="m-auto text-sm text-on-surface-variant">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id ?? i}
                    className={`flex gap-3 max-w-[85%] ${msg.isOwn ? 'self-end flex-row-reverse' : ''}`}>
                    {!msg.isOwn && (
                      <img src={activeProfile?.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
                      />
                    )}
                    <div className={`space-y-1 flex flex-col ${msg.isOwn ? 'items-end' : ''}`}>
                      <div
                        className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
                          msg.isOwn
                            ? 'rounded-2xl rounded-br-[4px] text-white'
                            : 'rounded-2xl rounded-bl-[4px] bg-surface text-on-surface'
                        }`}
                        style={msg.isOwn ? { background: 'var(--gradient-primary)' } : {}}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mx-2">
                        <span className="text-[11px] text-on-surface-variant">{msg.sentAt}</span>
                        {msg.isOwn && (
                          <span className={`material-symbols-outlined text-[13px] ${msg.isRead ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {msg.isRead ? 'done_all' : 'done'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — chatting is a premium feature */}
            <div className="p-4 sm:p-5 bg-white/95 backdrop-blur border-t border-surface-variant/50">
              {isPremium ? (
                <div className="flex items-end gap-2 bg-surface rounded-2xl p-2 pl-4 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
                  <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKey}
                    placeholder="Type your message…" maxLength={2000}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[40px] py-2.5 px-1 text-on-surface placeholder:text-on-surface-variant/60 outline-none text-sm"
                  />
                  <button onClick={handleSend} disabled={!text.trim() || sendMsg.isPending} aria-label="Send"
                    className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md flex items-center justify-center w-11 h-11 mr-0.5 mb-0.5 disabled:opacity-60 active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl bg-orange-50 border border-orange-200 p-4">
                  <span className="material-symbols-outlined text-primary fill-icon">lock</span>
                  <p className="flex-1 text-sm text-on-surface text-center sm:text-left">
                    <strong>Replying is a Premium feature.</strong> Upgrade to chat with {activeProfile?.firstName ?? 'members'}.
                  </p>
                  <Link to="/premium"
                    className="px-4 py-2 rounded-xl text-white text-sm font-bold active:scale-[0.98] transition-all"
                    style={{ background: 'var(--gradient-primary)' }}>
                    Upgrade
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </motion.main>
  )
}
