# SongLib

A personal guitar practice tool. Build your song library, then let the app pick what to practice — making sure every song gets equal stage time over time.

---

## The Problem

You learn 10 songs. Then learn 10 more. By the time you know the second batch, the first batch is gone. SongLib solves that by tracking every song you know and rotating through them fairly during practice sessions.

---

## Features

- Add songs to your personal library (title, artist, album, year, duration, tuning, key, YouTube link)
- Browse your full song library
- Get a random song to practice
- Smart pick count tracking — songs picked less often get priority over time
- Duplicate detection — won't add the same song twice
- Auto-creates artists and albums if they don't exist yet

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Templating | EJS |
| Database | PostgreSQL |
| DB Driver | node-postgres (pg) |
| Auth | express-session + bcrypt *(in progress)* |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+

### Installation

```bash
# Clone the repo
git clone https://github.com/runaranjo/guitar-song-app.git
cd guitar-song-app

# Install dependencies
npm install
```

### Database Setup

```bash
# Create the database
createdb songify_db

# Run the schema
psql -U your_postgres_user -d songify_db -f db/schema.sql
```

### Environment Variables

Create a `.env` file in the root:

```
PORT=3000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=songify_db
DB_PASSWORD=your_password
DB_PORT=5432
```

### Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

App runs at `http://localhost:3000`

---

## Project Structure

```
guitar-song-app/
├── index.js          ← Entry point
├── app.js            ← Express app + middleware
├── db/
│   ├── db.js         ← PostgreSQL client
│   └── schema.sql    ← Database schema
├── routes/
│   └── songs.js      ← Route handlers + DB queries
├── views/
│   ├── index.ejs     ← Landing page
│   ├── home.ejs      ← Library hub
│   ├── newsong.ejs   ← Add song form
│   └── partials/     ← Header, footer, navbar
└── public/
    └── styles/       ← CSS
```

---

## Roadmap

- [x] Add songs with duplicate detection
- [x] Browse song library
- [x] Random song picker
- [ ] User authentication (register, login, sessions)
- [ ] Per-user song libraries
- [ ] Smart random — weighted by pick count
- [ ] Song tier system (priority levels)
- [ ] Edit / delete songs
- [ ] Song detail view (tuning, key, YouTube link)

---

## License

MIT
