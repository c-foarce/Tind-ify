
import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar/SearchBar';
import PlaylistResults from '../../components/PlaylistResults/PlaylistResults';
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
      <SearchBar
        mode="live"
        id="playlist-search"
        label="Search playlists"
        placeholder="Search by playlist name..."
        onSearch={setSearchQuery}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <PlaylistResults
        playlists={filteredPlaylists}
        loadingPlaylistId={loadingPlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
      />
    </section>
  );
}

export default PlaylistSearch;
