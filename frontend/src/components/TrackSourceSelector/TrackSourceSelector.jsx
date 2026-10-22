
import styles from './TrackSourceSelector.module.css';

const sources = [
  { value: 'albums', label: 'Search Albums' },
  { value: 'playlists', label: 'Your Playlists' },
  { value: 'liked', label: 'Liked Songs' },
];

function TrackSourceSelector({ value, onChange }) {
  return (
    <div
      className={styles.selector}
      role="group"
      aria-label="Choose track source"
    >
      {sources.map((source) => (
        <button
          key={source.value}
          type="button"
          className={`${styles.option} ${
            value === source.value ? styles.active : ''
          }`}
          aria-pressed={value === source.value}
          onClick={() => onChange(source.value)}
        >
          {source.label}
        </button>
      ))}
    </div>
  );
}

export default TrackSourceSelector;
