import styles from './AlbumResults.module.css';

function AlbumResults({ albums, onSelectAlbum }) {
  if (albums.length === 0) return null;

  return (
    <div className={styles.resultsGrid}>
      {albums.map((album) => (
        <div
          key={album.id}
          onClick={() => onSelectAlbum(album.id)}
          className={styles.albumCard}
        >
          <img
            src={album.artwork}
            alt={album.name}
            className={styles.albumArtwork}
          />

          <h4 className={styles.albumName}>{album.name}</h4>

          <p className={styles.albumArtist}>{album.artist}</p>
        </div>
      ))}
    </div>
  );
}

export default AlbumResults;
