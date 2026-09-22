import { AlertTriangle } from "lucide-react";

/**
 * Reusable confirmation modal, replacing window.confirm().
 * Usage: const [confirming, setConfirming] = useState(null); // holds the id/item to confirm
 * <ConfirmModal
 *   open={!!confirming}
 *   title="Delete this temple?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   danger
 *   onCancel={() => setConfirming(null)}
 *   onConfirm={() => { doDelete(confirming); setConfirming(null); }}
 * />
 */
const ConfirmModal = ({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>
          {danger && <AlertTriangle size={20} color="var(--danger)" />}
          {title}
        </h3>
        <p>{description}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn btn-sm ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
