
function AlbumResults({ albums, onSelectAlbum }) {
  if (albums.length === 0) return null;

  return (
    <div className="results-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      {albums.map(album => (
        <div 
          key={album.id} 
          onClick={() => onSelectAlbum(album.id)}
          style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', cursor: 'pointer', width: '150px' }}
        >
          <img src={album.artwork} alt={album.name} style={{ width: '100%', borderRadius: '4px' }} />
          <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '0.9rem' }}>{album.name}</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{album.artist}</p>
        </div>
      ))}
    </div>
  );
}

export default AlbumResults;
