
import SearchBar from '../../components/SearchBar/SearchBar';
import AlbumResults from '../../components/AlbumResults/AlbumResults';
import styles from './AlbumSearch.module.css';

function AlbumSearch({ onSearch, albums, onSelectAlbum }) {
  return (
    <section className={styles.searchSection}>
      <SearchBar onSearch={onSearch} />
      <AlbumResults
        albums={albums}
        onSelectAlbum={onSelectAlbum}
      />
    </section>
  );
}

export default AlbumSearch;
