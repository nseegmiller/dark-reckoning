export function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
      <div className="pip-panel w-full max-w-sm">
        {/* Header */}
        <div className="p-4 border-b pip-border">
          <h3 className="text-lg uppercase tracking-widest pip-text">{title}</h3>
        </div>

        {/* Message */}
        <div className="p-4">
          <p className="pip-text-dim">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t pip-border flex gap-3">
          <button
            onClick={onCancel}
            className="pip-btn flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`pip-btn flex-1 ${danger ? 'text-red-400 border-red-400/50 hover:border-red-400 hover:shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'pip-btn-active'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
