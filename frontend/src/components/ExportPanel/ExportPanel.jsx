import { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './ExportPanel.module.css';

function ExportPanel({
  playlistName,
  onNameChange,
  description,
  onDescriptionChange,
  playlistQueue,
  onRemoveTrack,
  onSave,
  exportSuccess,
  exportError,
}) {

  const [showSuccess, setShowSuccess] = useState(true);

  useEffect(() => {
    if (exportSuccess) {
      setShowSuccess(true);
    }
  }, [exportSuccess]);

  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Your Playlist</h2>

      <label className={styles.label} htmlFor="playlist-name">
        Playlist name
      </label>

      <input
        id="playlist-name"
        className={styles.nameInput}
        type="text"
        value={playlistName}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Enter a playlist name"
      />

      <label className={styles.label} htmlFor="playlist-description">
        Playlist description
      </label>

      <textarea
        id="playlist-description"
        className={styles.nameInput}
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="What is this playlist about?"
        rows={3}
      />

      <div className={styles.queueHeading}>
        <h3>Selected Tracks</h3>
        <span className={styles.count}>
          {playlistQueue.length}
        </span>
      </div>

      {playlistQueue.length === 0 ? (
        <p className={styles.emptyMessage}>
          No tracks yet. Keep some songs to build your playlist.
        </p>
      ) : (
        <ul className={styles.trackList}>
          {playlistQueue.map((track, index) => (
            <li
              key={`${track.uri}-${index}`}
              className={styles.trackItem}
            >
              <img
                className={styles.trackArtwork}
                src={track.artwork}
                alt=""
              />

              <div className={styles.trackDetails}>
                <span className={styles.trackTitle}>
                  {track.title}
                </span>
                <span className={styles.trackArtist}>
                  {track.artist}
                </span>
              </div>

              <button
                type="button"
                className={clsx(
                  styles.iconButton,
                  styles.removeButton
                )}
                onClick={() => onRemoveTrack(index)}
                aria-label={`Remove ${track.title} from playlist`}
                title="Remove track"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className={styles.trashIcon}
                >
                  <path
                    d="M3 6h18M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v6m4-6v6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={clsx(
          styles.exportButton,
          playlistQueue.length === 0 && styles.exportButtonDisabled
        )}
        onClick={onSave}
        disabled={playlistQueue.length === 0}
      >
        Export to Spotify
      </button>


      {exportSuccess && showSuccess && (
        <div className={styles.successMessage} role="status">
          <button
            type="button"
            className={styles.dismissButton}
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss success message"
            title="Dismiss message"
          >
            x
          </button>

          <p>{exportSuccess.message}</p>

          <a
            href={exportSuccess.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open playlist on Spotify
          </a>
        </div>
      )}

      {exportError && (
        <div className={styles.errorMessage} role="alert">
          <p>{exportError.message}</p>

          {exportError.url && (
            <a
              href={exportError.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open partially exported playlist on Spotify
            </a>
          )}
        </div>
      )}
    </aside>
  );
}

export default ExportPanel;
