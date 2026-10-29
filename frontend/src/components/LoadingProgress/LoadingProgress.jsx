
import styles from "./LoadingProgress.module.css";

function LoadingProgress({
    message,
    completedPages = 0,
    totalPages = null,
    ariaLabel = "Loading progress",
}) {
    const hasPageProgress =
        totalPages !== null &&
        totalPages > 0 &&
        completedPages > 0;

    const percentage = hasPageProgress
        ? Math.min(100, Math.round((completedPages / totalPages) * 100))
        : 0;

    return (
        <div className={styles.progress}>
            <span className={styles.progressMessage}>
                {message}
            </span>

            <div
                className={styles.progressTrack}
                role="progressbar"
                aria-label={ariaLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={hasPageProgress ? percentage : undefined}
            >
                <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <span className={styles.progressCount}>
                {totalPages == null
                    ? "Counting pages…"
                    : `${completedPages}/${totalPages} pages`}
            </span>
        </div>
    );

}

export default LoadingProgress;
