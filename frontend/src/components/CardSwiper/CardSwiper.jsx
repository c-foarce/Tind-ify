
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
  const textRef = useRef(null);
  const animationRef = useRef(null);
  const isHoveredRef = useRef(false);

  const [isOverflowing, setIsOverflowing] = useState(false);
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

  // Measure the title and create the marquee animation.
  useEffect(() => {
    const titleElement = titleRef.current;
    const textElement = textRef.current;

    if (!titleElement || !textElement || !displayedTrack) {
      setIsOverflowing(false);
      return;
    }

    const speed = 40; // Pixels per second.
    const pauseDuration = 1000; // Milliseconds at each end.

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const checkOverflow = () => {
      // Cancel any existing animation before recalculating.
      animationRef.current?.cancel();
      animationRef.current = null;

      const textWidth = textElement.getBoundingClientRect().width;

      const paddingRight = parseFloat(
        window.getComputedStyle(textElement).paddingRight
      ) || 0;

      const actualTextWidth = textWidth - paddingRight;

      const isTextOverflowing =
        actualTextWidth > titleElement.clientWidth;

      setIsOverflowing(isTextOverflowing);

      if (!isTextOverflowing || reducedMotionQuery.matches) {
        return;
      }

      // The track contains two identical copies.
      // Moving -50% therefore travels exactly one copy's width.
      const travelDistance = textWidth;

      const scrollDuration = (travelDistance / speed) * 1000;

      const totalDuration =
        scrollDuration + pauseDuration * 2;

      // Calculate the exact points at which scrolling starts and ends.
      const scrollStartOffset =
        pauseDuration / totalDuration;

      const scrollEndOffset =
        (pauseDuration + scrollDuration) / totalDuration;

      const animation = titleElement
        .querySelector(`.${styles.marqueeTrack}`)
        .animate(
          [
            {
              transform: 'translateX(0)',
              offset: 0,
            },
            {
              transform: 'translateX(0)',
              offset: scrollStartOffset,
            },
            {
              transform: 'translateX(-50%)',
              offset: scrollEndOffset,
            },
            {
              transform: 'translateX(-50%)',
              offset: 1,
            },
          ],
          {
            duration: totalDuration,
            iterations: Infinity,
            easing: 'linear',
          }
        );

      animationRef.current = animation;

      if (isHoveredRef.current) {
        animation.pause();
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);

    observer.observe(titleElement);
    observer.observe(textElement);

    reducedMotionQuery.addEventListener('change', checkOverflow);

    return () => {
      observer.disconnect();
      reducedMotionQuery.removeEventListener('change', checkOverflow);

      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [displayedTrack?.id, displayedTrack?.uri, displayedTrack?.title]);

  useEffect(() => {
    setIsConfirmingDuplicate(false);
  }, [currentTrack?.id, currentTrack?.uri]);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    animationRef.current?.pause();
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    animationRef.current?.play();
  };

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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span className={styles.marqueeTrack}>
            <span
              ref={textRef}
              className={styles.marqueeText}
            >
              {displayedTrack.title}
            </span>

            <span
              className={clsx(
                styles.marqueeText,
                !isOverflowing && styles.marqueeDuplicateHidden
              )}
              aria-hidden="true"
            >
              {displayedTrack.title}
            </span>
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
