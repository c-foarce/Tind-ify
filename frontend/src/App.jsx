
import { useRef, useState, useEffect } from 'react';

import clsx from 'clsx';

import api from './services/api';

import CardSwiper from './components/CardSwiper/CardSwiper';
import ExportPanel from './components/ExportPanel/ExportPanel';
import TrackSourceSelector from './components/TrackSourceSelector/TrackSourceSelector';
import HelpDialog from './components/HelpDialog/HelpDialog';

import AlbumSearch from './views/AlbumSearch/AlbumSearch';
import PlaylistSearch from './views/PlaylistSearch/PlaylistSearch';
import LikedSongsLoader from './views/LikedSongsLoader/LikedSongsLoader';

import styles from './App.module.css';

function App() {

  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Help dialog
  const [isHelpOpen, setIsHelpOpen] = useState(() => {
    return sessionStorage.getItem('tindify-help-dismissed') !== 'true';
  });

  // Search results and search controls
  const [searchResults, setSearchResults] = useState([]);
  const [trackSource, setTrackSource] = useState('albums');
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Track filtering and playlist queue
  const [activeTracks, setActiveTracks] = useState([]);
  const [playlistQueue, setPlaylistQueue] = useState([]);

  // Liked Songs loading and error handling
  const [isLoadingLikedSongs, setIsLoadingLikedSongs] = useState(false);
  const [likedSongsError, setLikedSongsError] = useState('');
  const [likedSongsProgress, setLikedSongsProgress] = useState(null);
  const [isLikedSongsLoaded, setIsLikedSongsLoaded] = useState(false);

  // Playlist export and feedback
  const [playlistName, setPlaylistName] = useState('My Swiped Playlist');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [exportSuccess, setExportSuccess] = useState(null);
  const [exportError, setExportError] = useState(null);

  // Filter section animation
  const [isFilterSectionExisting, setIsFilterSectionExisting] = useState(
    activeTracks.length > 0
  );

  // DOM references
  const filterSectionRef = useRef(null);

  const helpButtonRef = useRef(null);


  useEffect(() => {
    api.get('/search?q=')
      .then(() => setIsLoggedIn(true))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setIsLoggedIn(false);
        }
      });
  }, []);

  useEffect(() => {
    let timeoutId;

    if (activeTracks.length > 0) {
      setIsFilterSectionExisting(true);
    } else {
      timeoutId = setTimeout(() => {
        setIsFilterSectionExisting(false);
      }, 250);
    }

    return () => clearTimeout(timeoutId);
  }, [activeTracks.length]);

  const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/api/login';
  };

  const handleCloseHelp = () => {
    sessionStorage.setItem('tindify-help-dismissed', 'true');
    setIsHelpOpen(false);
  };

  const handleSearch = async (query) => {
    setIsSearching(true);

    try {
      const response = await api.get(
        `/search?q=${encodeURIComponent(query)}`
      );

      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed.', err);
    } finally {
      setIsSearching(false);
    }
  };


  const handleSelectAlbum = async (albumId) => {
    try {
      const response = await api.get(
        `/album-tracks?id=${encodeURIComponent(albumId)}`
      );

      setActiveTracks(response.data);
      setSearchResults([]);
      setIsSearchExpanded(false);

      // Wait for the search panel to collapse, then scroll to the swiper.
      setTimeout(() => {
        filterSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    } catch (err) {
      console.error('Failed to load album tracks', err);
    }
  };

const handleSelectPlaylist = async (playlistId, onProgress) => {
  try {
    const response = await fetch(
      `${api.defaults.baseURL}/playlists/${encodeURIComponent(playlistId)}/tracks`
    );

    if (!response.ok) {
      let message = 'Could not load tracks from this playlist.';

      try {
        const data = await response.json();
        message = data.error || message;
      } catch {
        // Keep the fallback message if the response isn't JSON.
      }

      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('Your browser could not read the loading stream.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let completed = false;

    let finalProgress = {
      completedPages: 0,
      totalPages: null,
    };

    const processEvent = (block) => {
      let eventName = '';
      const dataLines = [];

      for (const line of block.split(/\r?\n/)) {
        if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }

      if (!eventName || dataLines.length === 0) return;

      const data = JSON.parse(dataLines.join('\n'));

      if (eventName === 'progress') {
        finalProgress = {
          completedPages: data.completed_pages,
          totalPages: data.total_pages,
        };

        onProgress?.(finalProgress);
      } else if (eventName === 'error') {
        throw new Error(data.error);
      } else if (eventName === 'complete') {
        setActiveTracks(data.tracks);

        onProgress?.({
          completedPages:
            finalProgress.totalPages ?? finalProgress.completedPages,
          totalPages: finalProgress.totalPages,
          isLoaded: true,
        });

        completed = true;
      }
    };

    while (!completed) {
      const { value, done } = await reader.read();

      if (done) {
        buffer += decoder.decode();
      } else {
        buffer += decoder.decode(value, { stream: true });
      }

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || '';

      for (const block of blocks) {
        processEvent(block);

        if (completed) break;
      }

      if (done) break;
    }

    if (!completed) {
      throw new Error('The loading stream ended before the tracks arrived.');
    }

    // Keep the success message visible before collapsing the search panel.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSearchExpanded(false);

    // Allow the panel to collapse before scrolling to the filter cards.
    setTimeout(() => {
      filterSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 300);
  } catch (err) {
    console.error('Failed to load playlist tracks', err);
    throw err;
  }
};

  const handleLoadLikedSongs = async () => {
    setIsLoadingLikedSongs(true);
    setIsLikedSongsLoaded(false);
    setLikedSongsError('');
    setLikedSongsProgress(null);

    try {
      const response = await fetch(
        `${api.defaults.baseURL}/liked-songs`
      );

      if (!response.ok) {
        let message = 'Could not load your Liked Songs. Please try again.';

        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
          // Keep the fallback message if the response isn't JSON.
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error('Your browser could not read the loading stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completed = false;

      let finalProgress = {
        completedPages: 0,
        totalPages: null,
      };

      const processEvent = (block) => {
        let eventName = '';
        const dataLines = [];

        for (const line of block.split(/\r?\n/)) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trim());
          }
        }

        if (!eventName || dataLines.length === 0) return;

        const data = JSON.parse(dataLines.join('\n'));

        if (eventName === 'progress') {
          finalProgress = {
            completedPages: data.completed_pages,
            totalPages: data.total_pages,
          };

          setLikedSongsProgress(finalProgress);
        } else if (eventName === 'error') {
          throw new Error(data.error);
        } else if (eventName === 'complete') {
          setActiveTracks(data.tracks);

          // Show a full progress bar during the success pause.
          setLikedSongsProgress({
            completedPages:
              finalProgress.totalPages ?? finalProgress.completedPages,
            totalPages: finalProgress.totalPages,
          });

          setIsLikedSongsLoaded(true);
          completed = true;
        }
      };

      while (!completed) {
        const { value, done } = await reader.read();

        if (done) {
          buffer += decoder.decode();
        } else {
          buffer += decoder.decode(value, { stream: true });
        }

        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          processEvent(block);

          if (completed) break;
        }

        if (done) break;
      }

      if (!completed) {
        throw new Error('The loading stream ended before the tracks arrived.');
      }

      // Keep "Loaded!" visible for half a second.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Collapse the search panel, then scroll to the filtering cards.
      setIsSearchExpanded(false);

      setTimeout(() => {
        filterSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 300);
    } catch (err) {
      console.error('Failed to load Liked Songs', err);
      setLikedSongsError(
        err.message || 'Could not load your Liked Songs. Please try again.'
      );
    } finally {
      setIsLoadingLikedSongs(false);
      setLikedSongsProgress(null);
      setIsLikedSongsLoaded(false);
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
    setExportError(null);

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

      setExportError({
        message:
          err.response?.data?.error ||
          'Failed to export the playlist. Please try again.',
        url: err.response?.data?.playlist_url || null,
      });
    }
  };


  return (
    <main className={styles.app}>

      <header className={styles.header}>
        <h1 className={styles.title}>🎵 Tind-ify</h1>

        <div className={styles.headerActions}>
          <button
            ref={helpButtonRef}
            type="button"
            className={styles.helpButton}
            onClick={() => setIsHelpOpen(true)}
          >
            ? Help
          </button>

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
        </div>
      </header>

      {isHelpOpen && (
        <HelpDialog
          onClose={handleCloseHelp}
          returnFocusRef={helpButtonRef}
        />
      )}

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
                isSearching={isSearching}
              />
            )}

            {trackSource === 'playlists' && (
              <PlaylistSearch
                onSelectPlaylist={handleSelectPlaylist}
              />
            )}

            {trackSource === 'liked' && (
              <LikedSongsLoader
                isLoading={isLoadingLikedSongs}
                isLoaded={isLikedSongsLoaded}
                onLoad={handleLoadLikedSongs}
                progress={likedSongsProgress}
                error={likedSongsError}
              />
            )}
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <div
          ref={filterSectionRef}
          className={styles.filterSection}
        >
          {activeTracks.length > 0 && (
            <div className={styles.filterHeader}>
              <h2 className={styles.sectionHeading}>
                Tracks to Filter
                <span className={styles.trackCount}>
                  {activeTracks.length} left
                </span>
              </h2>

              <button
                type="button"
                className={styles.clearQueueButton}
                onClick={handleClearFilterQueue}
              >
                Clear filter queue
              </button>
            </div>
          )}

          {isFilterSectionExisting && (
            <div
              className={clsx(
                styles.filterCardContainer,
                activeTracks.length === 0 && styles.filterCardContainerExiting
              )}
            >
              <CardSwiper
                tracks={activeTracks}
                playlistQueue={playlistQueue}
                onDiscard={handleDiscardTrack}
                onKeep={handleKeepTrack}
                isExiting={activeTracks.length === 0}
              />
            </div>
          )}
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
          exportError={exportError}
        />
      </section>
    </main>
  );
}

export default App;
