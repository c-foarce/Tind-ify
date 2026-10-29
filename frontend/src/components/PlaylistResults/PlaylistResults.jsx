
import styles from './PlaylistResults.module.css';

import LoadingProgress from '../LoadingProgress/LoadingProgress';

function PlaylistResults({
  playlists,
  loadingPlaylistId,
  playlistProgress,
  onSelectPlaylist,
}) {
  return (
    <>
      <div className={styles.resultsHeader}>
        <p className={styles.resultCount}>
          {playlists.length} playlist
          {playlists.length === 1 ? '' : 's'} found
        </p>

        {loadingPlaylistId !== null && (
          <LoadingProgress
            message={playlistProgress?.isLoaded ? 'Loaded!' : 'Loading tracks'}
            completedPages={playlistProgress?.completedPages ?? 0}
            totalPages={playlistProgress?.totalPages ?? null}
            ariaLabel="Playlist track import progress"
          />
        )}
      </div>

      {playlists.length === 0 ? (
        <p className={styles.message}>
          No playlists match your search.
        </p>
      ) : (
        <div className={styles.playlistGrid}>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              className={styles.playlistCard}
              onClick={() => onSelectPlaylist(playlist)}
              disabled={loadingPlaylistId !== null}
            >
              {playlist.artwork ? (
                <img
                  src={playlist.artwork}
                  alt=""
                  className={styles.artwork}
                />
              ) : (
                <div className={styles.artworkPlaceholder}>
                  No artwork
                </div>
              )}

              <span className={styles.playlistName}>
                {playlist.name}
              </span>

              <span className={styles.playlistDetails}>
                {playlist.owner_name}
              </span>

              <span className={styles.playlistDetails}>
                {playlist.track_count} tracks
              </span>

              {loadingPlaylistId === playlist.id && (
                <span className={styles.loadingLabel}>
                  Loading tracks...
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default PlaylistResults;
