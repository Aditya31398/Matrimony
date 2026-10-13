import { useState } from 'react'
import Modal from './Modal'

const REASONS = [
  ['FAKE_PROFILE', 'Fake profile or photos'],
  ['SCAM', 'Asking for money / scam'],
  ['HARASSMENT', 'Harassment or threats'],
  ['INAPPROPRIATE', 'Inappropriate content'],
  ['ALREADY_MARRIED', 'Already married'],
  ['OTHER', 'Something else'],
]

export default function ReportModal({ open, onClose, firstName, onSubmit, submitting }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [block, setBlock] = useState(true)

  return (
    <Modal open={open} onClose={onClose} title={`Report ${firstName}`}>
      <p className="text-sm text-on-surface-variant mb-4">Reports are confidential — {firstName} won't know who reported them.</p>
      <div className="space-y-2 mb-4">
        {REASONS.map(([value, label]) => (
          <label key={value} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-colors ${
            reason === value ? 'border-primary bg-orange-50' : 'border-slate-100 hover:border-primary/30'}`}>
            <input type="radio" name="reason" value={value} checked={reason === value}
              onChange={() => setReason(value)} className="accent-primary" />
            <span className="text-sm font-semibold text-on-surface">{label}</span>
          </label>
        ))}
      </div>
      <textarea rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)}
        placeholder="Anything else we should know? (optional)"
        className="w-full bg-surface rounded-2xl px-4 py-3 text-sm outline-none border-2 border-transparent focus:border-primary-container resize-none mb-3" />
      <label className="flex items-center gap-2 text-sm text-on-surface mb-5 cursor-pointer">
        <input type="checkbox" checked={block} onChange={(e) => setBlock(e.target.checked)} className="accent-primary w-4 h-4" />
        Also block {firstName}
      </label>
      <button type="button" disabled={!reason || submitting}
        onClick={() => onSubmit({ reason, details: details.trim() || undefined, block })}
        className="w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-50">
        {submitting ? 'Sending…' : 'Submit report'}
      </button>
    </Modal>
  )
}
