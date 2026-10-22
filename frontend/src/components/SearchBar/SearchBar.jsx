import { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <div className={styles.inputWrapper}>
        <label htmlFor="album-search" className={styles.searchLabel}>
          Search albums
        </label>

        <div className={styles.inputContainer}>
          <input
            id="album-search"
            type="search"
            className={styles.searchInput}
            placeholder="Search by album name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear search"
            >
              x
            </button>
          )}
        </div>
      </div>

      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  );
}

export default SearchBar;