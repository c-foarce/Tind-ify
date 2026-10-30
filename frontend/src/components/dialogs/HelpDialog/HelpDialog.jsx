
import Dialog from '../../Dialog/Dialog';
import styles from './HelpDialog.module.css';

function HelpDialog({ onClose, returnFocusRef }) {
  return (
    <Dialog
      title="Welcome to Tind-ify!"
      onClose={onClose}
      returnFocusRef={returnFocusRef}
      closeLabel="Close help"
    >
      <p>
        Build your own Spotify playlists by keeping the tracks you love
        and discarding the ones you don't.
      </p>

      <ol>
        <li>Connect your Spotify account.</li>
        <li>Search for an album or playlist, or load your Liked Songs.</li>
        <li>Keep or discard each track as it appears.</li>
        <li>Review your queue, name your playlist, and export it to Spotify.</li>
      </ol>

      <button
        type="button"
        className={styles.helpGotItButton}
        onClick={onClose}
      >
        Got it
      </button>
    </Dialog>
  );
}

export default HelpDialog;
