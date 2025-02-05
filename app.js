import express from "express"
import routes from './routes/songs.js'
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware for prsing JSON and URL-encoded 
app.use(express.json()); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true }))

app.use(express.static("public"))


// Use routes
app.use('/', routes)

export default app