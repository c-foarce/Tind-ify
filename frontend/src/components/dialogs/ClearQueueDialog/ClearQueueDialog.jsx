import Dialog from '../../Dialog/Dialog';
import styles from './ClearQueueDialog.module.css';

function ClearQueueDialog({ onClose, onConfirm, returnFocusRef }) {
  return (
    <Dialog
      title="Clear filter queue?"
      onClose={onClose}
      returnFocusRef={returnFocusRef}
      closeLabel="Close confirmation"
    >
      <p>
        Are you sure you want to remove all remaining tracks from the filter
        queue? Tracks already kept for export will not be affected.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirm}
        >
          Clear queue
        </button>
      </div>
    </Dialog>
  );
}

export default ClearQueueDialog;