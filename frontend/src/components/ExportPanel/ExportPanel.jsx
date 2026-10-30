
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
  exportError,
  exportButtonRef,
  isExporting,
}) {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Your Playlist</h2>

      <div className={styles.playlistSettings}>
        <div className={styles.nameField}>
          <label className={clsx(styles.label, styles.inputLabel)} htmlFor="playlist-name">
            Playlist name
          </label>

          <input
            id="playlist-name"
            className={clsx(
              styles.nameInput,
              styles.playlistNameInput
            )}
            type="text"
            value={playlistName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Enter a playlist name"
          />
        </div>

        <div className={styles.descriptionField}>
          <label className={clsx(styles.label, styles.inputLabel)} htmlFor="playlist-description">
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
        </div>
      </div>

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
        ref={exportButtonRef}
        type="button"
        className={clsx(
          styles.exportButton,
          playlistQueue.length === 0 && styles.exportButtonDisabled
        )}
        onClick={onSave}
        disabled={playlistQueue.length === 0 || isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export to Spotify'}
      </button>

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
