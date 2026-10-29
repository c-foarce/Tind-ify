
import { useEffect, useRef } from 'react';
import styles from './HelpDialog.module.css';

function HelpDialog({ onClose, returnFocusRef }) {

    const closeButtonRef = useRef(null);

    const dialogRef = useRef(null);

    useEffect(() => {
        closeButtonRef.current?.focus();

        return () => {
            returnFocusRef.current?.focus();
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
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    return (
        <div
            className={styles.helpOverlay}
            onClick={onClose}
        >
            <section
                ref={dialogRef}
                className={styles.helpDialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="helpDialogTitle"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={handleTabKeyDown}
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    className={styles.helpCloseButton}
                    aria-label="Close help"
                    onClick={onClose}
                >
                    &times;
                </button>

                <h2 id="helpDialogTitle">Welcome to Tind-ify!</h2>

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
            </section>
        </div>
    );
}

export default HelpDialog;
