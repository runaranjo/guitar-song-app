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

# EXAMPLE TO DOC ROADBLOCKS - Template

## Roadblock: Database Connection Issue
- **Date**: 2025-02-02
- **Description**: The app crashes when trying to connect to the postgres database.
- **Solution**: Fixed by ensuring the `db` folder exists and the database file path is correct.





