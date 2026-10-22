
import { useEffect, useRef, useState } from 'react';
import styles from './CardSwiper.module.css';
import clsx from 'clsx';

function CardSwiper({ tracks, onDiscard, onKeep }) {

  const titleRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(20);

  const currentTrack = tracks[0];

  useEffect(() => {
    const titleElement = titleRef.current;

    if (!titleElement || !currentTrack) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      const overflowDistance =
        titleElement.scrollWidth - titleElement.clientWidth;

      setIsOverflowing(overflowDistance > 0);

      // Approximately 35 pixels of travel per second.
      const speed = 40;
      const duration = (overflowDistance / 2) / speed;

      setMarqueeDuration(Math.max(duration, 1));
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(titleElement);

    return () => observer.disconnect();
  }, [currentTrack?.title]);

  if (tracks.length === 0) {
    return (
      <p className={styles.emptyMessage}>
        Search and pick an album above to begin filtering songs.
      </p>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <img
          src={currentTrack.artwork}
          alt={`${currentTrack.title} album artwork`}
          className={styles.artwork}
        />

        <h2
          ref={titleRef}
          className={styles.trackTitle}
          title={currentTrack.title}
        >
          <span
            className={clsx(
              styles.marqueeTrack,
              isOverflowing && styles.marqueeTrackActive
            )}
            style={{
              '--marquee-duration': `${marqueeDuration}s`,
            }}
          >
            <span className={styles.marqueeText}>
              {currentTrack.title}
            </span>

            {isOverflowing && (
              <span
                className={styles.marqueeText}
                aria-hidden="true"
              >
                {currentTrack.title}
              </span>
            )}
          </span>
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
