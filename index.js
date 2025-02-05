import yourmother from './app.js'
import dotenv from 'dotenv'

dotenv.config(); // Load env variables

const PORT = process.env.PORT || 3000;

yourmother.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})