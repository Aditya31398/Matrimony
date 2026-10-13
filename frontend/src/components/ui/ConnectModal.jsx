import { useState } from 'react'
import Modal from './Modal'

const MAX = 300
const SUGGESTIONS = [
  'Your profile really resonated with me — would love to get to know you.',
  'We seem to share similar values. Shall we connect?',
  'Our families might get along well too!',
]

/** Send an interest, optionally with a short personal note. */
export default function ConnectModal({ open, onClose, firstName, onSend, sending }) {
  const [note, setNote] = useState('')
  const send = (withNote) => onSend(withNote ? note.trim() : '')

  return (
    <Modal open={open} onClose={onClose} title={`Send interest to ${firstName}`}>
      <p className="text-sm text-on-surface-variant mb-3">Add a personal note — members are far more likely to accept.</p>
      <textarea rows={4} maxLength={MAX} value={note} onChange={(e) => setNote(e.target.value)}
        placeholder={`Hi ${firstName}, …`}
        className="w-full bg-surface rounded-xl px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-primary-container resize-none" />
      <div className="flex justify-between items-center text-[11px] text-on-surface-variant mb-3">
        <span>Be kind and genuine.</span>
        <span>{note.length}/{MAX}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => setNote(s)}
            className="text-left text-xs px-3 py-2 rounded-xl bg-orange-50 text-on-surface hover:bg-orange-100 transition-colors">
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => send(false)} disabled={sending}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm text-on-surface-variant disabled:opacity-60">
          Send without note
        </button>
        <button type="button" onClick={() => send(true)} disabled={sending || !note.trim()}
          className="flex-[1.4] py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
          style={{ background: 'var(--gradient-primary)' }}>
          {sending ? 'Sending…' : 'Send with note'}
        </button>
      </div>
    </Modal>
  )
}
