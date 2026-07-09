export default function ConfirmModal({ title, message, confirmText = "Confirm", danger, onConfirm, onClose, busy = false, children }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <button className="modal-close" aria-label="Close dialog" onClick={onClose}><i className="fa-solid fa-xmark"/></button>
      <h3 id="confirm-title">{title}</h3><p>{message}</p>{children}
      <div className="modal-actions"><button className="btn ghost" disabled={busy} onClick={onClose}>Cancel</button><button className={`btn ${danger ? "danger" : ""}`} disabled={busy} onClick={onConfirm}>{busy ? "Working…" : confirmText}</button></div>
    </div>
  </div>;
}
