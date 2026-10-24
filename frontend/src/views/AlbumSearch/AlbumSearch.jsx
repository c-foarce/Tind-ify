import SearchBar from '../../components/SearchBar/SearchBar';
import AlbumResults from '../../components/AlbumResults/AlbumResults';
import styles from './AlbumSearch.module.css';

function AlbumSearch({
  onSearch,
  albums,
  onSelectAlbum,
  isSearching,
}) {
  return (
    <section className={styles.searchSection}>
      <SearchBar
        onSearch={onSearch}
        isLoading={isSearching}
      />
      <AlbumResults
        albums={albums}
        onSelectAlbum={onSelectAlbum}
      />
    </section>
  );
}

export default AlbumSearch;
