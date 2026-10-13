import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/** Bottom sheet on phones, centred dialog on larger screens. Closes on Escape or backdrop tap. */
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div role="dialog" aria-modal="true" aria-label={title}
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-6 pb-8 shadow-float max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-on-surface">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-full hover:bg-surface text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
