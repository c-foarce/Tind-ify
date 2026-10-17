# Tind-ify

Tind-ify is a Spotify-powered music discovery tool that lets users explore albums, swipe through their tracks, and build playlists from the songs they want to keep.

Inspired by Tinder-style swiping, the application provides an interactive way to discover music without having to add every track from an album to a playlist.

## Features

- **Album search** — search Spotify for albums to explore.
- **Track discovery** — browse the tracks belonging to a selected album.
- **Swipe-based selection** — keep tracks you like and discard those you don't.
- **Selection queue** — review your chosen tracks before exporting.
- **Playlist creation** — export selected tracks to a new Spotify playlist.
- **Spotify authentication** — authenticate through Spotify to access the required account permissions.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Axios
- CSS Modules and custom CSS

### Backend
- Python
- Flask
- Flask-CORS
- Spotipy
- Spotify Web API
- python-dotenv

## Project Structure

```text
Tind-ify/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Prerequisites

Before running the application, ensure you have installed:

- [Python](https://www.python.org/downloads/)
- [Node.js and npm](https://nodejs.org/)
- A [Spotify Developer](https://developer.spotify.com/dashboard) application
- A Spotify account

## Installation and Setup

### 1. Clone the repository

```bash
git clone git@github.com:c-foarce/Tind-ify.git
cd Tind-ify
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python -m venv .venv
source .venv/Scripts/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create your local environment file by copying the example:

```bash
cp .env.example .env
```

Open `backend/.env` and supply your own values:

```dotenv
FLASK_SECRET_KEY=your_generated_secret_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

Generate a Flask secret key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the generated value into `FLASK_SECRET_KEY`.

### 3. Configure Spotify authentication

In your Spotify Developer application settings, configure the redirect URI to match the backend:

```text
http://127.0.0.1:5000/callback
```

The application requests the following Spotify permissions:

- `playlist-modify-public`
- `playlist-modify-private`

These permissions allow the application to create playlists on the authenticated user's behalf.

### 4. Start the backend

From the `backend/` directory, run:

```bash
python app.py
```

The Flask backend runs on port `5000`.

Keep this terminal open while using the application.

### 5. Start the frontend

Open a second terminal at the repository root and navigate to the frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal, normally:

```text
http://localhost:5173
```

Open that address in your browser.

## Environment Variables and Security

The application uses environment variables to store sensitive configuration.

- `FLASK_SECRET_KEY` — secret key used by Flask.
- `SPOTIFY_CLIENT_ID` — client identifier for the Spotify application.
- `SPOTIFY_CLIENT_SECRET` — client secret for the Spotify application.

The actual `.env` file and Spotify authentication token caches must remain local and must not be committed to version control.

The included `.env.example` provides a template for configuration without exposing credentials.

## Current Development Configuration

Tind-ify is currently configured for local development:

| Service | Address |
|---|---|
| React frontend | `http://localhost:5173` |
| Flask backend | `http://localhost:5000` |
| API base URL | `http://localhost:5000/api` |
| Spotify OAuth callback | `http://127.0.0.1:5000/callback` |

The frontend and backend must both be running for the application to function.

## Future Improvements

Potential future enhancements include deployment to a public hosting service, improved mobile responsiveness, and further refinements to the track discovery experience.
