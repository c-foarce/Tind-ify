
import { useState } from 'react';
import clsx from 'clsx';
import styles from './SearchBar.module.css';

function SearchBar({
  onSearch,
  mode = 'submit',
  id = 'album-search',
  label = 'Search albums',
  placeholder = 'Search by album name...',
  isLoading = false,
}) {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (mode === 'submit') {
      onSearch(query);
    }
  };

  const handleChange = (event) => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);

    if (mode === 'live') {
      onSearch(nextQuery);
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        styles.searchBar,
        mode === 'live' && styles.liveSearchBar
      )}
    >
      <div className={styles.inputWrapper}>
        <label htmlFor={id} className={styles.searchLabel}>
          {label}
        </label>

        <div className={styles.inputContainer}>
          <input
            id={id}
            type="search"
            className={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
          />

          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label={`Clear ${label.toLowerCase()}`}
              title={`Clear ${label.toLowerCase()}`}
            >
              x
            </button>
          )}
        </div>
      </div>

      {mode === 'submit' && (
        <button
          type="submit"
          className={clsx(
            styles.searchButton,
            isLoading && styles.searchButtonLoading
          )}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      )}
    </form>
  );
}

export default SearchBar;
