

import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from dotenv import load_dotenv
from requests.exceptions import Timeout
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
SCOPE = (
    "playlist-modify-public "
    "playlist-modify-private "
    "playlist-read-private "
    "playlist-read-collaborative "
    "user-library-read"
)

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

    return spotipy.Spotify(
        auth_manager=sp_oauth,
        requests_timeout=20
    )

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
    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        query = request.args.get('q', '').strip()

        if not query:
            return jsonify([])

        results = sp.search(q=query, type='album', limit=5)
        albums = []

        for item in results['albums']['items']:
            albums.append({
                "id": item['id'],
                "name": item['name'],
                "artist": (
                    item['artists'][0]['name']
                    if item['artists'] else 'Unknown'
                ),
                "artwork": (
                    item['images'][0]['url']
                    if item['images'] else None
                ),
                "release_date": item['release_date']
            })

        return jsonify(albums)

    except spotipy.SpotifyException as e:
        app.logger.exception("Spotify album search failed")
        return jsonify({
            "error": "Could not search Spotify. Please try again."
        }), e.http_status or 500

    except Exception:
        app.logger.exception("Unexpected album search error")
        return jsonify({
            "error": "An unexpected error occurred during album search."
        }), 500


# 4. Tracks list retrieval endpoint
@app.route('/api/album-tracks', methods=['GET'])
def get_album_tracks():
    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        album_id = request.args.get('id', '').strip()

        if not album_id:
            return jsonify({"error": "Missing album ID"}), 400

        album_details = sp.album(album_id)
        track_results = sp.album_tracks(album_id, limit=50)
        flattened_tracks = []

        for track in track_results['items']:
            flattened_tracks.append({
                "id": track['id'],
                "title": track['name'],
                "artist": (
                    track['artists'][0]['name']
                    if track['artists'] else 'Unknown'
                ),
                "album_name": album_details['name'],
                "artwork": (
                    album_details['images'][0]['url']
                    if album_details['images'] else None
                ),
                "uri": track['uri']
            })

        return jsonify(flattened_tracks)

    except spotipy.SpotifyException as e:
        app.logger.exception("Spotify album track retrieval failed")
        return jsonify({
            "error": "Could not retrieve album tracks from Spotify."
        }), e.http_status or 500

    except Exception:
        app.logger.exception("Unexpected album track retrieval error")
        return jsonify({
            "error": "An unexpected error occurred while retrieving album tracks."
        }), 500


# 5. Retrieve the current user's playlists

@app.route('/api/playlists', methods=['GET'])
def get_playlists():
    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        current_user = sp.current_user()
        current_user_id = current_user['id']

        playlists = []
        offset = 0
        limit = 50

        while True:
            results = sp.current_user_playlists(
                limit=limit,
                offset=offset
            )

            for playlist in results['items']:
                owner = playlist.get('owner') or {}
                images = playlist.get('images') or []
                items = playlist.get('items') or playlist.get('tracks') or {}

                playlists.append({
                    "id": playlist['id'],
                    "name": playlist['name'],
                    "artwork": images[0]['url'] if images else None,
                    "track_count": items.get('total', 0),
                    "owner_name": owner.get('display_name') or owner.get('id', 'Unknown'),
                    "is_owner": owner.get('id') == current_user_id,
                    "collaborative": playlist.get('collaborative', False),
                    "spotify_url": (
                        playlist.get('external_urls') or {}
                    ).get('spotify')
                })

            if not results.get('next'):
                break

            offset += len(results['items'])

        return jsonify(playlists)

    except spotipy.SpotifyException as e:
        app.logger.exception("Failed to retrieve Spotify playlists")
        return jsonify({
            "error": "Could not retrieve playlists from Spotify."
        }), e.http_status or 500

# 6. Retrieve tracks from a selected playlist
@app.route('/api/playlists/<playlist_id>/tracks', methods=['GET'])
def get_playlist_tracks(playlist_id):
    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        tracks = []
        offset = 0
        limit = 50

        while True:
            results = sp.playlist_items(
                playlist_id,
                limit=limit,
                offset=offset,
                additional_types=('track',)
            )

            items = results.get('items', [])

            for entry in items:
                # Spotify responses may use "item" or the older "track" key.
                track = entry.get('item') or entry.get('track')

                # Ignore unavailable tracks and local files.
                if not track or track.get('is_local'):
                    continue

                uri = track.get('uri')

                if not uri:
                    continue

                artists = track.get('artists') or []
                album = track.get('album') or {}
                images = album.get('images') or []

                tracks.append({
                    "id": track.get('id'),
                    "title": track.get('name', 'Unknown track'),
                    "artist": (
                        artists[0]['name'] if artists else 'Unknown'
                    ),
                    "album_name": album.get('name', 'Unknown album'),
                    "artwork": images[0]['url'] if images else None,
                    "uri": uri
                })

            if not results.get('next'):
                break

            offset += len(items)

        return jsonify(tracks)

    except spotipy.SpotifyException as e:
        app.logger.exception("Failed to retrieve playlist tracks")

        if e.http_status == 403:
            return jsonify({
                "error": (
                    "Spotify does not allow this playlist to be imported. "
                    "Try a playlist you own or collaborate on."
                )
            }), 403

        if e.http_status == 404:
            return jsonify({
                "error": "This playlist could not be found."
            }), 404

        return jsonify({
            "error": "Could not retrieve tracks from Spotify."
        }), e.http_status or 500

# 7. Retreives the user's liked songs
@app.route('/api/liked-songs', methods=['GET'])
def get_liked_songs():
    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        tracks = []
        offset = 0
        limit = 50

        while True:
            results = sp.current_user_saved_tracks(
                limit=limit,
                offset=offset
            )

            items = results.get('items', [])

            for entry in items:
                track = entry.get('track')

                # Ignore unavailable tracks and local files.
                if not track or track.get('is_local'):
                    continue

                uri = track.get('uri')

                if not uri:
                    continue

                artists = track.get('artists') or []
                album = track.get('album') or {}
                images = album.get('images') or []

                tracks.append({
                    "id": track.get('id'),
                    "title": track.get('name', 'Unknown track'),
                    "artist": (
                        artists[0]['name'] if artists else 'Unknown'
                    ),
                    "album_name": album.get('name', 'Unknown album'),
                    "artwork": images[0]['url'] if images else None,
                    "uri": uri
                })

            if not results.get('next'):
                break

            offset += len(items)

        return jsonify(tracks)

    except Timeout:
        app.logger.exception("Spotify Liked Songs request timed out")
        return jsonify({
            "error": (
                "Spotify took too long to load your Liked Songs. "
                "Please try again."
            )
        }), 504

    except spotipy.SpotifyException as e:
        app.logger.exception("Failed to retrieve Liked Songs")

        if e.http_status == 403:
            return jsonify({
                "error": (
                    "Spotify did not allow access to your Liked Songs. "
                    "Reconnect your account and try again."
                )
            }), 403

        return jsonify({
            "error": "Could not retrieve your Liked Songs."
        }), e.http_status or 500


# 8. Save and create a new playlist
@app.route('/api/create-playlist', methods=['POST'])
def create_playlist():
    new_playlist = None

    try:
        sp = get_spotify_client()

        if not sp:
            return jsonify({"error": "User not authenticated"}), 401

        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "error": "Invalid request data."
            }), 400

        # Validate the playlist name before using string methods.
        playlist_name = data.get('name', 'My Filtered Mix')

        if not isinstance(playlist_name, str):
            return jsonify({
                "error": "The playlist name must be text."
            }), 400

        playlist_name = playlist_name.strip()

        if not playlist_name:
            return jsonify({
                "error": "Please provide a playlist name."
            }), 400

        playlist_description = data.get('description') or ''
        track_uris = data.get('uris', [])

        if not isinstance(playlist_description, str):
            return jsonify({
                "error": "The playlist description must be text."
            }), 400

        # Validate the submitted track URIs.
        if not isinstance(track_uris, list) or not track_uris:
            return jsonify({
                "error": "No tracks selected."
            }), 400

        if not all(
            isinstance(uri, str) and uri.startswith("spotify:track:")
            for uri in track_uris
        ):
            return jsonify({
                "error": "One or more track URIs are invalid."
            }), 400

        # Create the playlist first.
        new_playlist = sp._post(
            "me/playlists",
            payload={
                "name": playlist_name,
                "description": playlist_description,
                "public": True,
            },
        )

        # Spotify accepts a maximum of 100 tracks per add-items request.
        for start in range(0, len(track_uris), 100):
            batch = track_uris[start:start + 100]

            sp._post(
                f"playlists/{new_playlist['id']}/items",
                payload={"uris": batch},
            )

        return jsonify({
            "status": "success",
            "message": f"Created '{playlist_name}'!",
            "playlist_url": new_playlist["external_urls"]["spotify"],
        })

    except spotipy.SpotifyException as e:
        app.logger.exception("Spotify playlist export failed")

        # Playlist creation may have succeeded before a later batch failed.
        if new_playlist:
            return jsonify({
                "error": (
                    "The playlist was created, but not all tracks "
                    "could be added."
                ),
                "playlist_url": (
                    new_playlist.get("external_urls", {}).get("spotify")
                ),
            }), 502

        return jsonify({
            "error": "Spotify could not create the playlist."
        }), e.http_status or 500

    except Exception:
        app.logger.exception("Unexpected playlist export error")

        if new_playlist:
            return jsonify({
                "error": (
                    "The playlist was created, but not all tracks "
                    "could be added."
                ),
                "playlist_url": (
                    new_playlist.get("external_urls", {}).get("spotify")
                ),
            }), 500

        return jsonify({
            "error": (
                "An unexpected error occurred while creating the playlist."
            )
        }), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)
