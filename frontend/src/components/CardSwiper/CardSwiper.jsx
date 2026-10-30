
import { useEffect, useRef, useState } from 'react';
import styles from './CardSwiper.module.css';
import clsx from 'clsx';

function CardSwiper({
  tracks,
  playlistQueue,
  onDiscard,
  onKeep,
  isExiting = false,
}) {
  const titleRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(20);
  const [isConfirmingDuplicate, setIsConfirmingDuplicate] = useState(false);
  const [previousTrack, setPreviousTrack] = useState(null);

  const currentTrack = tracks[0];

  // Retain the last track so it remains visible during the exit animation.
  useEffect(() => {
    if (currentTrack) {
      setPreviousTrack(currentTrack);
    }
  }, [currentTrack]);

  const displayedTrack = currentTrack || previousTrack;

  useEffect(() => {
    const titleElement = titleRef.current;

    if (!titleElement || !displayedTrack) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      const overflowDistance =
        titleElement.scrollWidth - titleElement.clientWidth;

      setIsOverflowing(overflowDistance > 0);

      // Constant scrolling speed, regardless of title length.
      const speed = 40; // pixels per second
      const travelDistance = titleElement.scrollWidth - titleElement.clientWidth;
      const duration = travelDistance / speed;

      setMarqueeDuration(Math.max(duration, 1));

      setMarqueeDuration(Math.max(duration, 1));
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(titleElement);

    return () => observer.disconnect();
  }, [displayedTrack?.title]);

  useEffect(() => {
    setIsConfirmingDuplicate(false);
  }, [currentTrack?.id, currentTrack?.uri]);

  const isDuplicate = (track) => {
    return playlistQueue.some((queuedTrack) => {
      if (track.id && queuedTrack.id) {
        return track.id === queuedTrack.id;
      }

      return Boolean(
        track.uri &&
        queuedTrack.uri &&
        track.uri === queuedTrack.uri
      );
    });
  };

  const handleKeepClick = () => {
    if (isExiting || !currentTrack) return;

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
    if (isExiting || !currentTrack) return;

    if (isConfirmingDuplicate) {
      setIsConfirmingDuplicate(false);
      return;
    }

    onDiscard();
  };

  // Safe fallback if the component is rendered without any track.
  if (!displayedTrack) {
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <img
          src={displayedTrack.artwork}
          alt={`${displayedTrack.title} album artwork`}
          className={clsx(
            styles.artwork,
            isConfirmingDuplicate && styles.duplicateArtwork
          )}
        />

        <h2
          ref={titleRef}
          className={styles.trackTitle}
          title={displayedTrack.title}
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
              {displayedTrack.title}
            </span>

            {isOverflowing && (
              <span
                className={styles.marqueeText}
                aria-hidden="true"
              >
                {displayedTrack.title}
              </span>
            )}
          </span>
        </h2>

        <p className={styles.artist}>
          {displayedTrack.artist}
        </p>

        <div className={styles.actions}>
          <button
            onClick={handleDiscardClick}
            disabled={isExiting}
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
            disabled={isExiting}
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
