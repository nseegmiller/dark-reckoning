export function ConfirmDialog({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="dr-panel w-full max-w-sm">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b dr-border">
          <h3 id="confirm-dialog-title" className="text-lg uppercase tracking-widest dr-text">{title}</h3>
        </div>

        {/* Message */}
        <div className="p-3 sm:p-4">
          <p id="confirm-dialog-message" className="dr-text-dim">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-3 sm:p-4 border-t dr-border flex gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="dr-btn flex-1"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`dr-btn flex-1 ${danger ? 'text-red-400 border-red-400/50 hover:border-red-400 hover:shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'dr-btn-active'}`}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
