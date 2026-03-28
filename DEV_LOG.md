Ok this file will work as a draft and container of thoughts for my project
I will be laying out what im doing and why im doing it to have somewhere to look back to.


## 2025-02-04
1. Ok so first created a projects folder and create this app folder GUITAR-SONG-APP 
2. For now i think only table needed is SONGS table and database called songify
3. will initialize repository and then create repo in github - Done
4. npm init -y to initinalize node
5. npm i express (routes etc), pg (database), ejs (frontend)
6. install nodemon for testing in dev "npm i --save-dev nodemon" (refreshes server automatically)
7. Created folder public, views and db
8. Started importing pg into db.js within db folder
9. Created README.md and this renamed to DEV_LOG.md
10. Can add "type": module to package.json to use import in files
11. middleware usarlo en app.js, index.js para iniciar app - export default app
12. ok en EJS - en index incluir todo lo que vaya en body. y en header y footer.ejs <body> y </body> respectivamente.
13. REMEMBER: POST IS TO SEND DATA - use a href to make a button take you to other page


---

## 2026-03-23 — Session with Claude

### Changes made:
1. **Credentials moved to .env** — DB user, host, name, password, port were hardcoded in `db/db.js`. Moved to `.env` (already gitignored).
2. **db.js reads from env vars** — now uses `process.env.DB_USER` etc. instead of hardcoded strings.
3. **Fixed dotenv timing bug** — with ES modules, `dotenv.config()` in `index.js` fires too late because imports are hoisted. Fixed by adding `import 'dotenv/config'` directly in `db/db.js`.

4. **Fixed song list parsing bug** — `JSON.parse('<%- JSON.stringify(song_data) %>')` was breaking when song titles contained apostrophes (e.g. "You won't see me"). Fixed by removing the wrapping `JSON.parse` and quotes — `JSON.stringify` output is already valid JS.

### Next steps:
- Split `routes/songs.js` into routes + db queries files
- Move `db.connect()` into `db/db.js`
- Add auth (register, login, sessions)

---

## 2026-03-27 — Session with Claude

### Changes made:

1. **Moved `db.connect()` to `db/db.js`** — it was in `routes/songs.js` which was wrong. Connection now opens where the client is created.

2. **Split `routes/songs.js` into two files** — all DB functions moved to `db/queries.js` and exported. `routes/songs.js` now only contains route handlers (~40 lines). Cleaner separation of concerns.

3. **Installed `bcrypt` and `express-session`** — auth packages. bcrypt hashes passwords, express-session manages login sessions via cookies.

4. **Added session middleware to `app.js`** — `app.use(session({...}))` with `SESSION_SECRET` from `.env`. `resave: false` and `saveUninitialized: false` are best practice settings.

5. **Created `views/register.ejs`** — registration form with username, email, password fields. Shows error message if registration fails.

6. **Created `views/login.ejs`** — login form with email and password fields. Shows error message if credentials are wrong.

7. **Created `routes/auth.js`** — all auth routes:
   - `GET /register` → renders register form
   - `POST /register` → hashes password with bcrypt (10 salt rounds), saves user, redirects to `/login`
   - `GET /login` → renders login form
   - `POST /login` → compares password hash with bcrypt.compare, stores user in session, redirects to `/home`
   - `GET /logout` → destroys session, redirects to `/login`

8. **Added new DB functions to `db/queries.js`**:
   - `doesUserExist(email)` — checks if email is already registered
   - `saveNewUser(username, email, hashed_password)` — inserts new user
   - `getUserByEmail(email)` — fetches full user row for password comparison on login

9. **Created `middleware/auth.js`** — `isLoggedIn` middleware function. Checks `req.session.user` — if exists calls `next()`, if not redirects to `/login`. Added to `/home`, `/newsong`, `/addsong` routes.

10. **Created `COMMANDS.md`** — reference file with useful terminal commands for server, PostgreSQL, route testing, git and SSH.

11. **Cleaned up** — deleted `routes/test.js` scratch file, added `*.test.js` pattern to `.gitignore`.

### Key concepts learned this session:
- Middleware is just a function with `(req, res, next)` — can chain multiple on one route
- ES modules hoist imports before code runs — dotenv must be imported in the file that needs it
- bcrypt.compare() never decrypts — it hashes the input and compares hashes
- Sessions store user data server-side, browser only gets a signed cookie with a session ID

### Next steps:
- Update landing page (`index.ejs`) with Register and Login buttons
- Tie songs to logged-in user via `user_songs` table
- Smart random pick using `song_pick_count`

---

## 2026-03-28 — Session with Claude

### Changes made:

1. **Refactored `db/queries.js` to use SQL constants** — all SQL strings moved to named constants at the top of the file (e.g. `CHECK_SONG_EXISTS`, `INSERT_SONG`, `GET_SONGS_BY_USER`). Functions now reference constants instead of inline strings. Cleaner, easier to read and maintain. Best practice for Node.js/Express apps.

2. **Fixed duplicate song check** — `CHECK_SONG_EXISTS` now uses `LOWER(TRIM())` on both sides of the comparison. Prevents duplicate entries caused by different casing (e.g. `queen` vs `Queen`) or extra spaces.

3. **Wired up `user_songs` table** — songs are now tied to the logged-in user:
   - `INSERT_SONG` now returns `song_id` via `RETURNING song_id`
   - New function `linkSongToUser(user_id, song_id)` — inserts into `user_songs` after a song is saved
   - `saveNewSong` now accepts `user_id` as first argument, calls `linkSongToUser` after insert
   - `getSongs(user_id)` now uses `GET_SONGS_BY_USER` — JOINs `user_songs`, `songs`, `artists`, `albums` filtered by `user_id`
   - `GET /home` passes `req.session.user.id` to `getSongs`
   - `POST /addsong` passes `req.session.user.id` to `saveNewSong`

4. **Updated landing page** — replaced "Click to enter!" with Login and Register buttons.

### Key concepts this session:
- SQL constants pattern — store query strings as named constants, keep functions short
- `RETURNING` in PostgreSQL INSERT — gets back the newly created row's ID without a second query
- `user_songs` as a bridge table — songs catalog is global, each user has their own library via this table

### Next steps:
- Smart random pick using `song_pick_count`
- Edit / delete songs
- Song detail view

---

## 2026-03-28 (continued) — Smart random pick + DB view

### Changes made:

1. **Created `vw_user_songdetails` DB view** — joins `user_songs`, `songs`, `artists`, `albums` into one flat result per user. Includes `song_pick_count`, `song_tier`, and all song details. Added to `schema.sql` and created in PostgreSQL.

2. **Simplified SQL constants** — `GET_SONGS_BY_USER` and `GET_SONGS_WITH_COUNTS` both now just query `vw_user_songdetails`. No more inline JOINs in app code.

3. **Moved random logic to app layer** — removed weighted random from SQL (`ORDER BY RANDOM() * ...`). DB just returns data, JS decides. `weightedRandom(songs)` function in `routes/songs.js` calculates weights as `1 / (song_pick_count + 1)` and picks accordingly.

4. **Added `GET /randomsong` route** — fetches songs via `getSongsWithCounts()`, runs `weightedRandom()`, increments `song_pick_count` via `incrementPickCount()`, returns song as JSON (`res.json()`).

5. **Updated `home.ejs`** — random button now uses `fetch('/randomsong')` instead of `Math.random()` client-side. Deleted local `getRandomSong()` function.

### Key concepts this session:
- DB views improve query readability and let PostgreSQL optimize execution plans
- Business logic (weighted random) belongs in the app, not in SQL
- `res.json()` returns JSON instead of HTML — this is a REST API endpoint, callable from browser JS via `fetch()`
- `fetch()` in browser JS lets you call server routes without navigating to a new page

### Next steps:
- Validate release year (no future dates)
- Edit / delete songs
- Song detail view

---

# EXAMPLE TO DOC ROADBLOCKS - Template

## Roadblock: Database Connection Issue
- **Date**: 2025-02-02
- **Description**: The app crashes when trying to connect to the postgres database.
- **Solution**: Fixed by ensuring the `db` folder exists and the database file path is correct.





