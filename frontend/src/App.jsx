
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import api from './services/api';
import SearchBar from './components/SearchBar/SearchBar';
import AlbumResults from './components/AlbumResults/AlbumResults';
import CardSwiper from './components/CardSwiper/CardSwiper';
import ExportPanel from './components/ExportPanel/ExportPanel';
import styles from './App.module.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [activeTracks, setActiveTracks] = useState([]);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [playlistName, setPlaylistName] = useState('My Swiped Playlist');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    try {
      const response = await api.post('/create-playlist', {
        name: playlistName,
        uris: playlistQueue.map((track) => track.uri),
      });

      alert(response.data.message);
      setPlaylistQueue([]);
      setActiveTracks([]);
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

      <section className={styles.searchSection}>
        <SearchBar onSearch={handleSearch} />
        <AlbumResults
          albums={searchResults}
          onSelectAlbum={handleSelectAlbum}
        />
      </section>

      <section className={styles.workspace}>
        <div className={styles.filterSection}>
          <h2 className={styles.sectionHeading}>
            Tracks to Filter
            <span className={styles.trackCount}>
              {activeTracks.length} left
            </span>
          </h2>

          <CardSwiper
            tracks={activeTracks}
            onDiscard={handleDiscardTrack}
            onKeep={handleKeepTrack}
          />
        </div>

        <ExportPanel
          playlistName={playlistName}
          onNameChange={setPlaylistName}
          playlistQueue={playlistQueue}
          onRemoveTrack={handleRemoveTrack}
          onSave={handleSavePlaylist}
        />
      </section>
    </main>
  );
}

export default App;
