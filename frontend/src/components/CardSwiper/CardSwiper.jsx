
import { useEffect, useRef, useState } from 'react';
import styles from './CardSwiper.module.css';
import clsx from 'clsx';

function CardSwiper({ tracks, playlistQueue, onDiscard, onKeep }) {
  const titleRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(20);
  const [isConfirmingDuplicate, setIsConfirmingDuplicate] = useState(false);

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

      // Approximately 40 pixels of travel per second.
      const speed = 40;
      const duration = (overflowDistance / 2) / speed;

      setMarqueeDuration(Math.max(duration, 1));
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(titleElement);

    return () => observer.disconnect();
  }, [currentTrack?.title]);

  useEffect(() => {
    setIsConfirmingDuplicate(false);
  }, [currentTrack?.id, currentTrack?.uri]);

  if (tracks.length === 0) {
    return null
    // fix tidier later, for now this works. need SOMETHING, not just undefined
    //  (
    //   <p className={styles.emptyMessage}>
    //     Search and pick an album above to begin filtering songs.
    //   </p>
    // );
  }

  const isDuplicate = (track) => {
    return playlistQueue.some((queuedTrack) => {
      // Compare Spotify IDs whenever both tracks have one.
      if (track.id && queuedTrack.id) {
        return track.id === queuedTrack.id;
      }

      // Fall back to Spotify URI if either ID is unavailable.
      return Boolean(
        track.uri &&
        queuedTrack.uri &&
        track.uri === queuedTrack.uri
      );
    });
  };

  const handleKeepClick = () => {
    if (isConfirmingDuplicate) {
      onKeep(currentTrack);
      setIsConfirmingDuplicate(false);
      return;
    }

    if (isDuplicate(currentTrack)) {
      setIsConfirmingDuplicate(true);
      return;
    }

    onKeep(currentTrack);
  };

  const handleDiscardClick = () => {
    if (isConfirmingDuplicate) {
      setIsConfirmingDuplicate(false);
      return;
    }

    onDiscard();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <img
          src={currentTrack.artwork}
          alt={`${currentTrack.title} album artwork`}
          className={clsx(
            styles.artwork,
            isConfirmingDuplicate && styles.duplicateArtwork
          )}
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
            onClick={handleDiscardClick}
            className={clsx(
              styles.button,
              isConfirmingDuplicate
                ? styles.cancelDuplicateButton
                : styles.discardButton
            )}
          >
            {isConfirmingDuplicate ? 'Cancel' : 'Discard'}
          </button>

          <button
            onClick={handleKeepClick}
            className={clsx(
              styles.button,
              isConfirmingDuplicate
                ? styles.confirmDuplicateButton
                : styles.keepButton
            )}
          >
            {isConfirmingDuplicate
              ? 'Keep duplicate?'
              : 'Keep Track'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CardSwiper;
