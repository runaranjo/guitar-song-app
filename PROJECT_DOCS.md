# PROJECT DOCS — Guitar Song App (SongLib)

> Living reference for the project. Update this when adding files, routes, or DB changes.
> For a journal of changes over time, see DEV_LOG.md.

---

## What This App Does

A personal guitar practice tool. You save songs you've learned, then hit a button to get a random song to practice. The random picker is designed to be fair — all songs get equal stage time using a pick count tracker.

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Templating | EJS (server-rendered HTML) |
| Database | PostgreSQL |
| DB Driver | pg (node-postgres) |
| Auth (planned) | express-session + bcrypt |
| Dev server | nodemon |
| Env vars | dotenv |

---

## Folder Structure

```
guitar-song-app/
├── index.js              ← Entry point. Starts the server.
├── app.js                ← Express app setup. Middleware + routes wired here.
├── .env                  ← Environment variables (never committed to git)
├── db/
│   ├── db.js             ← PostgreSQL client instance
│   └── schema.sql        ← Database schema (run manually, not by the app)
├── routes/
│   └── songs.js          ← All route handlers + all DB query functions
├── views/
│   ├── index.ejs         ← Landing/welcome page
│   ├── home.ejs          ← Main hub: show songs, random pick
│   ├── newsong.ejs       ← Add new song form
│   └── partials/
│       ├── header.ejs    ← HTML head + opening body tag
│       ├── footer.ejs    ← Closing body/html tags
│       └── navbar.ejs    ← Sidebar nav (Library Hub, Add Song, Back)
├── public/
│   └── styles/
│       └── styles.css    ← All app styles
└── sandbox-test/         ← Throwaway test files (not used in app)
```

---

## Files — Purpose & Libraries

### `index.js`
**Purpose:** Starts the HTTP server. Nothing else.
**Imports:** `app.js`, `dotenv`

### `app.js`
**Purpose:** Creates the Express app. Sets up middleware (JSON parsing, URL-encoded form parsing, static files). Mounts the routes.
**Imports:** `express`, `routes/songs.js`, `path`, `url`

### `db/db.js`
**Purpose:** Creates and exports a single PostgreSQL client instance used across the app.
**Imports:** `dotenv/config`, `pg`
**Note:** Uses `pg.Client` (single connection). `db.connect()` is called in routes/songs.js — this should eventually move here.

### `routes/songs.js`
**Purpose:** Handles all HTTP routes AND contains all database query functions. (These should eventually be split — routes stay here, DB functions move to `db/queries.js`.)
**Imports:** `express`, `db/db.js`, `he` (HTML entity encoder — imported but not currently used)

### `db/schema.sql`
**Purpose:** SQL file to set up the database from scratch. Run manually in psql, not by the app.

---

## Routes

| Method | URL | View Rendered | What it does |
|---|---|---|---|
| GET | `/` | `index.ejs` | Landing page |
| GET | `/home` | `home.ejs` | Fetches all songs from DB, passes to view |
| GET | `/newsong` | `newsong.ejs` | Shows the add song form (blank state) |
| POST | `/addsong` | `newsong.ejs` | Saves new song. Checks for duplicates. Auto-creates artist/album if new. Returns success/fail message. |

---

## Database Schema

### `artists`
| Column | Type | Notes |
|---|---|---|
| artist_id | SERIAL PK | Auto increment |
| artist_name | VARCHAR(200) | |
| created_at / updated_at | TIMESTAMP | Auto-set |

### `albums`
| Column | Type | Notes |
|---|---|---|
| album_id | SERIAL PK | |
| album_name | VARCHAR(200) | |
| artist_id | INT FK | References artists |

### `songs`
| Column | Type | Notes |
|---|---|---|
| song_id | SERIAL PK | |
| song_title | VARCHAR(200) | |
| artist_id | INT FK | References artists |
| album_id | INT FK | References albums |
| release_year | INT | |
| duration | VARCHAR(20) | e.g. "3:45" |
| video_url | TEXT | YouTube link |
| song_tuning | VARCHAR(100) | e.g. "Standard", "Drop D" |
| song_key | VARCHAR(100) | e.g. "C Major", "A Minor" |

### `users` *(schema ready, not yet wired)*
| Column | Type | Notes |
|---|---|---|
| user_id | SERIAL PK | |
| user_name | VARCHAR(200) UNIQUE | |
| email_address | VARCHAR(300) UNIQUE | |
| hashed_password | VARCHAR(300) | bcrypt hash |

### `user_songs` *(schema ready, not yet wired)*
| Column | Type | Notes |
|---|---|---|
| user_song_id | SERIAL PK | |
| user_id | INT FK | References users |
| song_id | INT FK | References songs |
| song_pick_count | INT | How many times this song was picked — used for fair random |
| song_tier | INT (1-3) | Priority tier. 1 = highest priority |

### View: `vw_songdetails`
Joins `songs`, `artists`, `albums` into a flat result.
Columns: `song_title`, `artist_name`, `album_name`
Used by: `getSongs()`, `doesSongExist()`

---

## DB Query Functions (in routes/songs.js)

| Function | What it does |
|---|---|
| `getSongs()` | Returns all songs from `vw_songdetails` |
| `saveNewSong(...)` | Orchestrates a full song insert — checks duplicate, saves artist, saves album, inserts song |
| `doesSongExist(song, artist, album)` | Returns bool — checks `vw_songdetails` for exact match |
| `isArtistCreated(name)` | Returns bool — checks `artists` table |
| `getArtistId(name)` | Returns artist_id for existing artist |
| `saveNewArtist(name)` | Inserts artist if new, returns artist_id either way |
| `isAlbumCreated(name)` | Returns bool — checks `albums` table |
| `getAlbumId(name)` | Returns album_id for existing album |
| `saveNewAlbum(name, artist_id)` | Inserts album if new, returns album_id either way |

---

## Views

### `index.ejs` — Landing page
Welcome screen with app name and a button linking to `/home`.

### `home.ejs` — Library Hub
- Loads full song list from server on page render (passed as `song_data`)
- **Show Songs** button — renders all songs as cards in the grid
- **Get a random song** button — picks one random song from the list and displays it
- Random logic is client-side JS using `Math.random()` on the already-loaded `song_data`
- Song cards show: title, artist, Edit button, Delete button (edit/delete not yet wired)

### `newsong.ejs` — Add Song form
- Fields: title, artist, album, year, duration, YouTube URL, tuning, key
- On submit: POST to `/addsong`
- Shows success (green) or error (red) message banner after submit
- Server passes `success`, `failed`, and `song_result` (message string) to the view

### Partials
- **header.ejs** — `<!DOCTYPE html>` through `<body>`. Includes Google Fonts (DM Mono, Indie Flower, Lobster) and `styles.css`.
- **footer.ejs** — Closes `</body></html>`
- **navbar.ejs** — Sidebar with links to: Library Hub, Add Song, Back to start

---

## What's Done

- [x] Add a song (with duplicate check, auto artist/album creation)
- [x] List all songs
- [x] Random song picker (client-side)
- [x] Success/error feedback on add song
- [x] Credentials in .env (not hardcoded)

## What's Pending

- [ ] Split `routes/songs.js` → routes + `db/queries.js`
- [ ] Move `db.connect()` into `db/db.js`
- [ ] User registration
- [ ] User login + sessions (express-session)
- [ ] Tie songs to logged-in user (wire up `user_songs` table)
- [ ] Smart random — weight picks by `song_pick_count` so all songs get equal stage time
- [ ] Song tier system (song_tier 1-3 for priority)
- [ ] Edit song
- [ ] Delete song
- [ ] Song detail view (show YouTube link, tuning, key when picked)
- [ ] Style overhaul on Add Song page
