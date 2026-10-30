
import Dialog from '../../Dialog/Dialog';
import styles from './ExportSuccessDialog.module.css';

function ExportSuccessDialog({ exportSuccess, onClose, returnFocusRef }) {
  return (
    <Dialog
      title="Playlist exported!"
      onClose={onClose}
      returnFocusRef={returnFocusRef}
      closeLabel="Close export confirmation"
    >
      <p>{exportSuccess.message}</p>

      <a
        className={styles.playlistLink}
        href={exportSuccess.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open playlist on Spotify
      </a>

      <button
        type="button"
        className={styles.doneButton}
        onClick={onClose}
      >
        Done
      </button>
    </Dialog>
  );
}

export default ExportSuccessDialog;
