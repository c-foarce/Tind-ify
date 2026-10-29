
import clsx from 'clsx';

import LoadingProgress from '../../components/LoadingProgress/LoadingProgress';

import styles from './LikedSongsLoader.module.css';

function LikedSongsLoader({
    isLoading,
    isLoaded,
    onLoad,
    progress,
    error,
}) {
    return (
        <div className={styles.likedSongsSection}>
            <p>Load your saved Spotify tracks to start filtering.</p>

            <div className={styles.loaderRow}>
                <button
                    type="button"
                    className={clsx(
                        styles.connectionButton,
                        isLoading && styles.connectionButtonLoading
                    )}
                    onClick={onLoad}
                    disabled={isLoading}
                >
                    {isLoading ? 'Loading Liked Songs...' : 'Load Liked Songs'}
                </button>

                <div className={styles.progressSlot}>
                    {isLoading && (
                        <LoadingProgress
                            message={isLoaded ? 'Loaded!' : 'Loading...'}
                            completedPages={progress?.completedPages ?? 0}
                            totalPages={progress?.totalPages ?? null}
                            ariaLabel="Liked Songs import progress"
                        />
                    )}
                </div>
            </div>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default LikedSongsLoader;
