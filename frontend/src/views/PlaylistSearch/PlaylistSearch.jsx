
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import styles from './PlaylistSearch.module.css';

function PlaylistSearch({ onSelectPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get('/playlists');
        setPlaylists(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
          'Could not load your Spotify playlists.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const filteredPlaylists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return playlists.filter((playlist) => {
      const isOwnedByUser = playlist.is_owner === true;
      const matchesSearch = playlist.name
        .toLowerCase()
        .includes(query);

      return isOwnedByUser && matchesSearch;
    });
  }, [playlists, searchQuery]);

  const handleSelectPlaylist = async (playlist) => {
    setLoadingPlaylistId(playlist.id);
    setError('');

    try {
      await onSelectPlaylist(playlist.id);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        `Could not load tracks from "${playlist.name}".`
      );
    } finally {
      setLoadingPlaylistId(null);
    }
  };

  if (isLoading) {
    return (
      <p className={styles.message}>
        Loading your playlists...
      </p>
    );
  }

  if (error && playlists.length === 0) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  }

  return (
    <section className={styles.playlistSearch}>
      <div className={styles.searchField}>
        <label htmlFor="playlist-search">
          Search playlists
        </label>

        <input
          id="playlist-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by playlist name..."
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <p className={styles.resultCount}>
        {filteredPlaylists.length} playlist
        {filteredPlaylists.length === 1 ? '' : 's'} found
      </p>

      {filteredPlaylists.length === 0 ? (
        <p className={styles.message}>
          No playlists match your search.
        </p>
      ) : (
        <div className={styles.playlistGrid}>
          {filteredPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              className={styles.playlistCard}
              onClick={() => handleSelectPlaylist(playlist)}
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
    </section>
  );
}

export default PlaylistSearch;
