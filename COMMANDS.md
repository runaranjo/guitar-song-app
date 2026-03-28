# Useful Commands

A reference of commands used during development. Add to this as you go.

---

## Server

```bash
# Start dev server (auto-reload)
npm run dev

# Start production server
npm start

# Kill the running server
pkill -f "node index.js"
pkill -f "nodemon"
```

---

## PostgreSQL

```bash
# Start PostgreSQL
brew services start postgresql@16

# Stop PostgreSQL
brew services stop postgresql@16

# Restart PostgreSQL
brew services restart postgresql@16

# Check if PostgreSQL is running
brew services list | grep postgres

# Fix stale lock file (if postgres won't start after a crash)
rm /opt/homebrew/var/postgresql@16/postmaster.pid
brew services start postgresql@16

# Connect to the app database
psql -U runaranjo -d songify_db

# Run a quick query from terminal
psql -U runaranjo -d songify_db -c "SELECT * FROM songs;"

# Check if DB connection works
psql -U runaranjo -d songify_db -c "SELECT 1"

# Run schema file (to set up DB from scratch)
psql -U runaranjo -d songify_db -f db/schema.sql
```

---

## Testing Routes (without a browser)

```bash
# Check if a route redirects and where it goes
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/home

# Check HTTP status code of a route
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Check if a page renders (returns HTML)
curl -s http://localhost:3000/login | grep -c "loginForm"

# Send a POST request with form data (useful for testing without a browser)
curl -s -X POST http://localhost:3000/login \
  -d "email=test@test.com&password=123456" \
  -w "%{http_code}"
```

---

## Git

```bash
# Check status
git status

# Stage specific files
git add file1.js file2.js

# Commit
git commit -m "your message"

# Push to main
git push origin main

# Create a new branch
git checkout -b feature/branch-name

# Switch to main
git checkout main

# Merge branch into main
git merge feature/branch-name

# Delete local branch
git branch -d feature/branch-name

# Delete remote branch
git push origin --delete feature/branch-name

# Pull latest from remote
git pull origin main
```

---

## SSH

```bash
# Test GitHub SSH connection
ssh -T git@github.com

# Show your public SSH key (to add to GitHub)
cat ~/.ssh/id_ed25519.pub
```
