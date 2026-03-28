import express from "express"
import session from "express-session"
import songRoutes from './routes/songs.js'
import authRoutes from './routes/auth.js'
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// Middleware for prsing JSON and URL-encoded
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))


// Use routes
app.use('/', songRoutes)
app.use('/', authRoutes)

export default app