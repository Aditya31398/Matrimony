import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MessageItem from '../components/ui/MessageItem'
import { useConversations, useMessages, useIcebreakers, useSendMessage } from '../hooks/useMessages'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../context/AuthContext'
import { formatLastSeen } from '../utils/lastSeen'
import toast from 'react-hot-toast'

const FALLBACK_CONVS = [
  { id: '1', otherProfile: { id: 2, firstName: 'Rohan', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' }, lastMessage: 'Looking forward to chatting!', lastMessageTime: 'Just now', isOnline: true, unreadCount: 0 },
]

const FALLBACK_MSGS = [
  { id: 1, senderId: 2, content: 'Hi! I came across your profile and would love to connect.', sentAt: '10:42 AM', isOwn: false },
  { id: 2, senderId: 0, content: 'Hello! Thanks for reaching out. Would love to chat too.', sentAt: '10:45 AM', isOwn: true },
]

const FALLBACK_ICEBREAKERS = [
  { id: 1, topic: 'Shared Interests', prompt: "What's something you're genuinely passionate about that most people don't know?", featured: true },
  { id: 2, topic: 'Travel', prompt: "What's the most memorable trip you've ever taken and why?", featured: false },
  { id: 3, topic: 'Lifestyle', prompt: 'Morning person or night owl? What does your ideal weekend look like?', featured: false },
]

export default function MessagesPage() {
  const { conversationId } = useParams()
  const { auth } = useAuth()
  const myProfileId = auth?.profileId

  const [searchQuery, setSearchQuery] = useState('')
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const { data: convs, isLoading: convLoading } = useConversations()
  const conversations = convs ?? FALLBACK_CONVS

  const [activeConv, setActiveConv] = useState(() => conversationId ?? null)
  useEffect(() => {
    if (!activeConv && conversations.length > 0) {
      setActiveConv(String(conversations[0].id))
    }
  }, [conversations, activeConv])

  const effectiveConvId = activeConv ?? (conversations[0]?.id ? String(conversations[0].id) : null)

  // Real-time WebSocket — replaces all polling for the active conversation
  useChat(effectiveConvId, myProfileId)

  const { data: msgs, isLoading: msgsLoading } = useMessages(effectiveConvId)
  const { data: icebreakers } = useIcebreakers(effectiveConvId)
  const sendMsg = useSendMessage(effectiveConvId)

  const messages = msgs ?? FALLBACK_MSGS
  const icebreakerList = icebreakers ?? FALLBACK_ICEBREAKERS

  const filteredConvs = conversations.filter((c) =>
    c.otherProfile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConvObj = conversations.find((c) => String(c.id) === effectiveConvId)
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
      className="max-w-[1280px] w-full mx-auto p-6 flex gap-6 h-[calc(100vh-140px)] pb-24 md:pb-6"
    >
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-[300px] bg-white rounded-[24px] shadow-card border border-outline-variant/30 flex-col overflow-hidden hidden md:flex flex-shrink-0">
        <div className="p-5 border-b border-surface-variant/50">
          <h2 className="text-xl font-black text-on-surface mb-4">Messages</h2>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input type="text" placeholder="Search conversations…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface pl-11 pr-4 py-3 rounded-[16px] border-none focus:ring-2 focus:ring-primary-container/50 text-sm text-on-surface placeholder:text-on-surface-variant/60 transition-all outline-none"
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
          ) : filteredConvs.length > 0 ? (
            filteredConvs.map((conv) => (
              <MessageItem
                key={conv.id}
                conversation={conv}
                isActive={String(conv.id) === effectiveConvId}
                onClick={() => setActiveConv(String(conv.id))}
              />
            ))
          ) : (
            <p className="text-center text-sm text-on-surface-variant p-6">No conversations yet</p>
          )}
        </div>
      </aside>

      {/* ── Chat window ─────────────────────────────────────────────── */}
      <section className="flex-1 bg-white rounded-[24px] shadow-card border border-outline-variant/30 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="p-5 border-b border-surface-variant/50 flex justify-between items-center bg-white/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeProfile?.photoUrl ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80'}
                alt={activeProfile?.firstName ?? 'Chat'}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
              {activeIsOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-black text-on-surface">{activeProfile?.firstName ?? 'Chat'}</h1>
              {activeLastSeen ? (
                <p className={`text-sm font-medium flex items-center gap-1 ${activeIsOnline ? 'text-green-600' : 'text-on-surface-variant'}`}>
                  {activeIsOnline && <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />}
                  {activeIsOnline ? 'Online' : `Last seen ${activeLastSeen}`}
                </p>
              ) : null}
            </div>
          </div>
          <Link to={`/profile/${activeProfile?.id}`}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-[16px] border border-outline-variant/50 text-sm font-bold text-on-surface hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              View Profile
            </button>
          </Link>
        </header>

        {/* Guided icebreakers */}
        <div className="px-6 py-4 bg-gradient-to-b from-primary-container/5 to-transparent border-b border-surface-variant/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            </div>
            <span className="text-sm font-bold text-on-surface">Guided Icebreakers</span>
            <span className="text-xs text-on-surface-variant ml-auto">Based on shared interests</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {icebreakerList.map((ib) => (
              <button key={ib.id} onClick={() => setText(ib.prompt)}
                className={`flex-shrink-0 max-w-[260px] text-left p-3.5 rounded-[14px] transition-all hover:-translate-y-0.5 ${
                  ib.featured
                    ? 'bg-primary text-white shadow-md hover:shadow-lg'
                    : 'bg-surface border border-outline-variant/40 text-on-surface hover:border-primary/50'
                }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-black tracking-wider uppercase ${ib.featured ? 'opacity-90' : 'text-primary/80'}`}>
                    {ib.topic}
                  </span>
                  <span className="material-symbols-outlined text-[14px] opacity-70">send</span>
                </div>
                <p className="text-[13px] leading-snug">{ib.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col">
          {msgsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id ?? i}
                className={`flex gap-3 max-w-[80%] ${msg.isOwn ? 'self-end flex-row-reverse' : ''}`}>
                {!msg.isOwn && (
                  <img src={activeProfile?.photoUrl ?? ''} alt=""
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
                    loading="lazy"
                  />
                )}
                <div className={`space-y-1 flex flex-col ${msg.isOwn ? 'items-end' : ''}`}>
                  <div
                    className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                      msg.isOwn
                        ? 'rounded-[24px] rounded-br-[4px] text-white'
                        : 'rounded-[24px] rounded-bl-[4px] bg-surface text-on-surface'
                    }`}
                    style={msg.isOwn ? { background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' } : {}}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mx-2">
                    <span className="text-[11px] text-on-surface-variant">{msg.sentAt}</span>
                    {msg.isOwn && (
                      <span className="material-symbols-outlined text-[13px] text-primary">done_all</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-5 bg-white/95 backdrop-blur border-t border-surface-variant/50">
          <div className="flex items-end gap-2 bg-surface rounded-[24px] p-2 border border-outline-variant/30 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary-container/20 transition-all">
            <button className="p-2.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-dim">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKey}
              placeholder="Type your message…"
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[120px] min-h-[40px] py-2.5 px-1 text-on-surface placeholder:text-on-surface-variant/60 outline-none text-sm"
            />
            <button className="p-2.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-dim">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
            <button onClick={handleSend} disabled={!text.trim() || sendMsg.isPending}
              className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 hover:scale-105 transition-all shadow-md flex items-center justify-center w-11 h-11 mr-0.5 mb-0.5 disabled:opacity-60 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
          <p className="text-center mt-2 text-[11px] text-on-surface-variant flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[13px]">lock</span>
            Messages are end-to-end encrypted
          </p>
        </div>
      </section>
    </motion.main>
  )
}
