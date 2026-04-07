import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className={`modal-overlay ${open ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'var(--text)' }}>{title}</h2>
            <button className="btn-icon text-xl" onClick={onClose} style={{ color: 'var(--text2)' }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
