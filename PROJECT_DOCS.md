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
| Auth | express-session + bcrypt |
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
│   ├── db.js             ← PostgreSQL client instance. Connects on load.
│   ├── queries.js        ← All database functions (songs, artists, albums, users)
│   └── schema.sql        ← Database schema (run manually, not by the app)
├── routes/
│   ├── songs.js          ← Song route handlers only (home, newsong, addsong)
│   └── auth.js           ← Auth route handlers (register, login, logout)
├── middleware/
│   └── auth.js           ← isLoggedIn middleware — protects routes from unauthenticated access
├── views/
│   ├── index.ejs         ← Landing/welcome page
│   ├── home.ejs          ← Main hub: show songs, random pick
│   ├── newsong.ejs       ← Add new song form
│   ├── register.ejs      ← Registration form
│   ├── login.ejs         ← Login form
│   └── partials/
│       ├── header.ejs    ← HTML head + opening body tag
│       ├── footer.ejs    ← Closing body/html tags
│       └── navbar.ejs    ← Sidebar nav (Library Hub, Add Song, Back)
├── public/
│   └── styles/
│       └── styles.css    ← All app styles
├── COMMANDS.md           ← Useful terminal commands reference
└── sandbox-test/         ← Throwaway test files (not used in app)
```

---

## Files — Purpose & Libraries

### `index.js`
**Purpose:** Starts the HTTP server. Nothing else.
**Imports:** `app.js`, `dotenv`

### `app.js`
**Purpose:** Creates the Express app. Sets up middleware (session, JSON parsing, URL-encoded form parsing, static files). Mounts song and auth routes.
**Imports:** `express`, `express-session`, `routes/songs.js`, `routes/auth.js`

### `db/db.js`
**Purpose:** Creates and exports a single PostgreSQL client instance. Calls `db.connect()` on load.
**Imports:** `dotenv/config`, `pg`

### `db/queries.js`
**Purpose:** All database functions organized by entity (songs, artists, albums, users). Exported and imported by route files.
**Imports:** `db/db.js`

### `routes/songs.js`
**Purpose:** Song-related route handlers only. Uses `isLoggedIn` middleware to protect all routes.
**Imports:** `express`, `db/queries.js`, `middleware/auth.js`

### `routes/auth.js`
**Purpose:** Authentication route handlers — register, login, logout.
**Imports:** `express`, `bcrypt`, `db/queries.js`

### `middleware/auth.js`
**Purpose:** Exports `isLoggedIn` function. Checks `req.session.user` — passes to next handler if logged in, redirects to `/login` if not.

### `db/schema.sql`
**Purpose:** SQL file to set up the database from scratch. Run manually in psql, not by the app.

---

## Routes

### Song Routes (`routes/songs.js`)
| Method | URL | Protected | View Rendered | What it does |
|---|---|---|---|---|
| GET | `/` | No | `index.ejs` | Landing page |
| GET | `/home` | Yes | `home.ejs` | Fetches all songs from DB, passes to view |
| GET | `/newsong` | Yes | `newsong.ejs` | Shows the add song form |
| POST | `/addsong` | Yes | `newsong.ejs` | Saves new song. Checks duplicates. Auto-creates artist/album. |

### Auth Routes (`routes/auth.js`)
| Method | URL | Protected | View Rendered | What it does |
|---|---|---|---|---|
| GET | `/register` | No | `register.ejs` | Shows registration form |
| POST | `/register` | No | `register.ejs` | Hashes password, saves user, redirects to `/login` |
| GET | `/login` | No | `login.ejs` | Shows login form |
| POST | `/login` | No | `login.ejs` | Verifies credentials, creates session, redirects to `/home` |
| GET | `/logout` | No | — | Destroys session, redirects to `/login` |

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

### `users`
| Column | Type | Notes |
|---|---|---|
| user_id | SERIAL PK | |
| user_name | VARCHAR(200) UNIQUE | |
| email_address | VARCHAR(300) UNIQUE | |
| hashed_password | VARCHAR(300) | bcrypt hash |

### `user_songs`
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

## DB Query Functions (`db/queries.js`)

### Songs
| Function | Exported | What it does |
|---|---|---|
| `getSongs(user_id)` | Yes | Returns songs for the logged-in user via JOIN on `user_songs` |
| `saveNewSong(user_id, ...)` | Yes | Checks duplicate, saves artist/album, inserts song, links to user via `linkSongToUser` |
| `doesSongExist(song, artist, album)` | No | Returns bool — case/whitespace insensitive check via `LOWER(TRIM())` |
| `linkSongToUser(user_id, song_id)` | No | Inserts row into `user_songs` linking a song to a user |

### Artists
| Function | Exported | What it does |
|---|---|---|
| `isArtistCreated(name)` | No | Returns bool — checks `artists` table |
| `getArtistId(name)` | No | Returns artist_id for existing artist |
| `saveNewArtist(name)` | No | Inserts artist if new, returns artist_id either way |

### Albums
| Function | Exported | What it does |
|---|---|---|
| `isAlbumCreated(name)` | No | Returns bool — checks `albums` table |
| `getAlbumId(name)` | No | Returns album_id for existing album |
| `saveNewAlbum(name, artist_id)` | No | Inserts album if new, returns album_id either way |

### Users
| Function | Exported | What it does |
|---|---|---|
| `doesUserExist(email)` | Yes | Returns bool — checks if email is already registered |
| `saveNewUser(username, email, hashed_password)` | Yes | Inserts new user into `users` table |
| `getUserByEmail(email)` | Yes | Returns full user row — used during login for password comparison |

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

### `register.ejs` — Registration form
- Fields: username, email, password
- On submit: POST to `/register`
- Shows error message if email already registered

### `login.ejs` — Login form
- Fields: email, password
- On submit: POST to `/login`
- Shows error message if email not found or password incorrect

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
- [x] Split routes and DB query functions into separate files
- [x] User registration with bcrypt password hashing
- [x] User login with session management
- [x] Logout
- [x] Auth middleware protecting routes
- [x] Landing page with Register and Login buttons
- [x] Songs tied to logged-in user via `user_songs` table
- [x] Duplicate song check (case and whitespace insensitive)
- [x] SQL constants pattern in `db/queries.js`

## What's Pending

- [ ] Tie songs to logged-in user (wire up `user_songs` table)
- [ ] Smart random — weight picks by `song_pick_count` so all songs get equal stage time
- [ ] Song tier system (song_tier 1-3 for priority)
- [ ] Edit song
- [ ] Delete song
- [ ] Song detail view (show YouTube link, tuning, key when picked)
- [ ] Style overhaul on Add Song page
