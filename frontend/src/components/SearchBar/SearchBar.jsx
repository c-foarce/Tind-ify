import { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input 
        type="text" 
        placeholder="Search for an album (e.g., Daft Punk)..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
      />
      <button type="submit" style={{ padding: '0.5rem 1rem' }}>Search</button>
    </form>
  );
}

export default SearchBar;
