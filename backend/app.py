

import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

# Load environment variables from the backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)

# Load credentials from environment variables
app.secret_key = os.getenv("FLASK_SECRET_KEY")
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Ensure all required configuration is present
if not all([app.secret_key, CLIENT_ID, CLIENT_SECRET]):
    raise RuntimeError(
        "Missing required environment variables. "
        "Check FLASK_SECRET_KEY, SPOTIFY_CLIENT_ID, "
        "and SPOTIFY_CLIENT_SECRET in your .env file."
    )

CORS(app)

# Spotify OAuth configuration
REDIRECT_URI = "http://127.0.0.1:5000/callback"
SCOPE = "playlist-modify-public playlist-modify-private"

def create_spotify_oauth():
    cache_path = os.path.join(
        os.path.dirname(__file__),
        ".spotify_cache"
    )

    return SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope=SCOPE,
        cache_path=cache_path,
        show_dialog=True
    )

def get_spotify_client():
    sp_oauth = create_spotify_oauth()
    token_info = sp_oauth.get_cached_token()

    if not token_info:
        return None

    return spotipy.Spotify(auth_manager=sp_oauth)

# 1. Trigger User Authentication Flow
@app.route('/api/login')
def login():
    sp_oauth = create_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()

    print("Configured redirect URI:", REDIRECT_URI)
    print("Generated Spotify authorization URL:", auth_url)

    return redirect(auth_url)

# 2. Capture the callback redirect from Spotify
@app.route('/callback')
def callback():
    sp_oauth = create_spotify_oauth()

    error = request.args.get('error')
    code = request.args.get('code')

    if error:
        return f"Spotify authentication failed: {error}", 400

    if not code:
        return "Missing Spotify authorization code.", 400

    try:
        sp_oauth.get_access_token(code)
        return redirect('http://localhost:5173')
    except Exception:
        app.logger.exception("Spotify OAuth callback failed")
        return "Spotify authentication failed. Check the Flask logs.", 500

# 3. Search endpoint
@app.route('/api/search', methods=['GET'])
def search_albums():
    sp = get_spotify_client()
    if not sp:
        return jsonify({"error": "User not authenticated"}), 401
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    results = sp.search(q=query, type='album', limit=5)
    albums = []
    for item in results['albums']['items']:
        albums.append({
            "id": item['id'],
            "name": item['name'],
            "artist": item['artists'][0]['name'] if item['artists'] else 'Unknown',
            "artwork": item['images'][0]['url'] if item['images'] else None,
            "release_date": item['release_date']
        })
    return jsonify(albums)

# 4. Tracks list retrieval endpoint
@app.route('/api/album-tracks', methods=['GET'])
def get_album_tracks():
    sp = get_spotify_client()
    if not sp:
        return jsonify({"error": "User not authenticated"}), 401
    album_id = request.args.get('id', '')
    if not album_id:
        return jsonify({"error": "Missing album ID"}), 400
    album_details = sp.album(album_id)
    track_results = sp.album_tracks(album_id, limit=50)
    flattened_tracks = []
    for track in track_results['items']:
        flattened_tracks.append({
            "id": track['id'],
            "title": track['name'],
            "artist": track['artists'][0]['name'] if track['artists'] else 'Unknown',
            "album_name": album_details['name'],
            "artwork": album_details['images'][0]['url'] if album_details['images'] else None,
            "uri": track['uri']
        })
    return jsonify(flattened_tracks)

# 5. Save and create a new playlist
@app.route('/api/create-playlist', methods=['POST'])
def create_playlist():
    sp = get_spotify_client()
    if not sp:
        return jsonify({"error": "User not authenticated"}), 401
    data = request.json or {}
    playlist_name = data.get('name', 'My Filtered Mix')
    track_uris = data.get('uris', [])
    if not track_uris:
        return jsonify({"error": "No tracks selected"}), 400
    try:
        current_user = sp.current_user()
        user_id = current_user['id']
        new_playlist = sp.user_playlist_create(user=user_id, name=playlist_name, public=True)
        sp.playlist_add_items(playlist_id=new_playlist['id'], items=track_uris)
        return jsonify({"status": "success", "message": f"Created '{playlist_name}'!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
