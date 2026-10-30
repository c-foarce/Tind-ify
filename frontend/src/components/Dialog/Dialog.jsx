
import { useEffect, useId, useRef } from 'react';
import styles from './Dialog.module.css';

function Dialog({
  title,
  children,
  onClose,
  returnFocusRef,
  closeLabel = 'Close dialog',
  className,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    closeButtonRef.current?.focus();

    return () => {
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleTabKeyDown = (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = dialogRef.current?.querySelectorAll(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <section
        ref={dialogRef}
        className={`${styles.dialog} ${className ?? ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleTabKeyDown}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.closeButton}
          aria-label={closeLabel}
          onClick={onClose}
        >
          &times;
        </button>

        <h2 id={titleId}>{title}</h2>

        {children}
      </section>
    </div>
  );
}

export default Dialog;
