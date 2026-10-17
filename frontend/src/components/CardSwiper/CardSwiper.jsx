import styles from './CardSwiper.module.css';
import clsx from 'clsx';

function CardSwiper({ tracks, onDiscard, onKeep }) {
  if (tracks.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        Search and pick an album above to begin filtering songs.
      </p>
    );
  }

  const currentTrack = tracks[0];

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <img
          src={currentTrack.artwork}
          alt={`${currentTrack.title} album artwork`}
          className={styles.artwork}
        />

        <h2 className={styles.trackTitle}>
          {currentTrack.title}
        </h2>

        <p className={styles.artist}>
          {currentTrack.artist}
        </p>

        <div className={styles.actions}>
          <button
            onClick={onDiscard}
            className={clsx(styles.button, styles.discardButton)}
          >
            Discard
          </button>

          <button
            onClick={() => onKeep(currentTrack)}
            className={clsx(styles.button, styles.keepButton)}
          >
            Keep Track
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardSwiper;
