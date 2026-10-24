import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import api from './services/api';
import CardSwiper from './components/CardSwiper/CardSwiper';
import ExportPanel from './components/ExportPanel/ExportPanel';
import TrackSourceSelector from './components/TrackSourceSelector/TrackSourceSelector';
import AlbumSearch from './views/AlbumSearch/AlbumSearch';
import PlaylistSearch from './views/PlaylistSearch/PlaylistSearch';

import styles from './App.module.css';

function App() {

  const [searchResults, setSearchResults] = useState([]);
  const [activeTracks, setActiveTracks] = useState([]);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [playlistName, setPlaylistName] = useState('My Swiped Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(null);
  const [trackSource, setTrackSource] = useState('albums');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isLoadingLikedSongs, setIsLoadingLikedSongs] = useState(false);
  const [likedSongsError, setLikedSongsError] = useState('');

  const filterSectionRef = useRef(null)


  useEffect(() => {
    api.get('/search?q=')
      .then(() => setIsLoggedIn(true))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setIsLoggedIn(false);
        }
      });
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/api/login';
  };

  const handleSearch = async (query) => {
    try {
      const response = await api.get(
        `/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed.', err);
    }
  };

  const handleSelectAlbum = async (albumId) => {
    try {
      const response = await api.get(
        `/album-tracks?id=${encodeURIComponent(albumId)}`
      );
      setActiveTracks(response.data);
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to load album tracks', err);
    }
  };

  const handleSelectPlaylist = async (playlistId) => {
    try {
      const response = await api.get(
        `/playlists/${encodeURIComponent(playlistId)}/tracks`
      );

      setActiveTracks(response.data);
      setIsSearchExpanded(false);

      // Wait for the search panel to collapse, then scroll to the swiper.
      setTimeout(() => {
        filterSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    } catch (err) {
      console.error('Failed to load playlist tracks', err);
    }
  };

  const handleLoadLikedSongs = async () => {
    setIsLoadingLikedSongs(true);
    setLikedSongsError('');

    try {
      const response = await api.get('/liked-songs');

      setActiveTracks(response.data);
      setIsSearchExpanded(false);

      // Allow the search panel to collapse before scrolling.
      setTimeout(() => {
        filterSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    } catch (err) {
      console.error('Failed to load Liked Songs', err);
      setLikedSongsError(
        'Could not load your Liked Songs. Please try again.'
      );
    } finally {
      setIsLoadingLikedSongs(false);
    }
  };

  const handleClearFilterQueue = () => {
    if (activeTracks.length === 0) return;

    const confirmed = window.confirm(
      `Remove all ${activeTracks.length} remaining tracks from the filter queue? Tracks already kept for export will not be affected.`
    );

    if (!confirmed) return;

    setActiveTracks([]);
  };

  const handleDiscardTrack = () => {
    setActiveTracks((prev) => prev.slice(1));
  };

  const handleKeepTrack = (track) => {
    setPlaylistQueue((prev) => [...prev, track]);
    setActiveTracks((prev) => prev.slice(1));
  };

  const handleRemoveTrack = (indexToRemove) => {
    setPlaylistQueue((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleSavePlaylist = async () => {
    if (playlistQueue.length === 0) {
      alert('Add some tracks first!');
      return;
    }

    setExportSuccess(null);

    try {
      const response = await api.post('/create-playlist', {
        name: playlistName,
        description: playlistDescription,
        uris: playlistQueue.map((track) => track.uri),
      });

      setExportSuccess({
        message: response.data.message,
        url: response.data.playlist_url,
      });

      setPlaylistQueue([]);
      setActiveTracks([]);
      setPlaylistName('');
      setPlaylistDescription('');
    } catch (err) {
      console.error('Failed to export playlist', err);
    }
  };

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎵 Tind-ify</h1>

        <button
          type="button"
          className={clsx(
            styles.connectionButton,
            isLoggedIn && styles.connectedButton
          )}
          onClick={handleLogin}
          disabled={isLoggedIn}
        >
          {isLoggedIn
            ? '✓ Connected to Spotify'
            : 'Connect Spotify Account'}
        </button>
      </header>



      <section className={styles.sourceSection}>
        <button
          type="button"
          className={styles.sourceToggle}
          onClick={() => setIsSearchExpanded((prev) => !prev)}
          aria-expanded={isSearchExpanded}
          aria-controls="source-search-content"
        >
          <span>
            {isSearchExpanded ? 'Hide search' : 'Show search'}
          </span>
          <span
            className={clsx(
              styles.toggleIcon,
              !isSearchExpanded && styles.toggleIconCollapsed
            )}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        <div
          id="source-search-content"
          className={clsx(
            styles.searchCollapse,
            !isSearchExpanded && styles.searchCollapsed
          )}
          aria-hidden={!isSearchExpanded}
          inert={!isSearchExpanded}
        >
          <div className={styles.searchCollapseInner}>
            <TrackSourceSelector
              value={trackSource}
              onChange={setTrackSource}
            />

            {trackSource === 'albums' && (
              <AlbumSearch
                onSearch={handleSearch}
                albums={searchResults}
                onSelectAlbum={handleSelectAlbum}
              />
            )}

            {trackSource === 'playlists' && (
              <PlaylistSearch
                onSelectPlaylist={handleSelectPlaylist}
              />
            )}

            {trackSource === 'liked' && (
              <div className={styles.likedSongsSection}>
                <p>Load your saved Spotify tracks to start filtering.</p>

                <button
                  type="button"
                  className={styles.connectionButton}
                  onClick={handleLoadLikedSongs}
                  disabled={isLoadingLikedSongs}
                >
                  {isLoadingLikedSongs
                    ? 'Loading Liked Songs...'
                    : 'Load Liked Songs'}
                </button>

                {likedSongsError && (
                  <p role="alert">{likedSongsError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>



      <section className={styles.workspace}>
        <div
          ref={filterSectionRef}
          className={styles.filterSection}
        >
          <div className={styles.filterHeader}>
            <h2 className={styles.sectionHeading}>
              Tracks to Filter
              <span className={styles.trackCount}>
                {activeTracks.length} left
              </span>
            </h2>

            {activeTracks.length > 0 && (
              <button
                type="button"
                className={styles.clearQueueButton}
                onClick={handleClearFilterQueue}
              >
                Clear filter queue
              </button>
            )}
          </div>

          <CardSwiper
            tracks={activeTracks}
            playlistQueue={playlistQueue}
            onDiscard={handleDiscardTrack}
            onKeep={handleKeepTrack}
          />
        </div>

        <ExportPanel
          playlistName={playlistName}
          onNameChange={setPlaylistName}
          description={playlistDescription}
          onDescriptionChange={setPlaylistDescription}
          playlistQueue={playlistQueue}
          onRemoveTrack={handleRemoveTrack}
          onSave={handleSavePlaylist}
          exportSuccess={exportSuccess}
        />
      </section>
    </main>
  );
}

export default App;
