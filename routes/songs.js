import express from "express";
import db from "../db/db.js"

const router = express.Router()

db.connect();

router.get('/', (req, res) => {
    res.render('index.ejs')
})

router.get('/home', async (req, res) => {
      let song_list = [];   
      const song_data = await getSongs();
    //   console.log(song_data)
      song_data.rows.forEach(element => {
          song_list.push({song_title: element.song_name, artist_name: element.artist_name})
      });
    // console.log(song_list)
    res.render('home.ejs', {song_data: song_list})
})

// Success/Failed to show either Success Message or Error Message
router.get('/newsong', (req, res) => {
    res.render('newsong.ejs', {success: false, failed: false})
})

// ROUTE TO ADD SONG
router.post('/addsong', async (req, res) => {
   const song_name = req.body.song_name;
   const artist_name = req.body.artist_name;
   const release_year = req.body.release_year;
   const song_duration = req.body.duration;
   const video_url = req.body.video_url;
   const song_tuning = req.body.song_tuning;
   const song_key = req.body.song_key;
   
    try {
        await db.query('INSERT INTO songs (song_name, artist_name, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6, $7)',
                      [song_name, artist_name, release_year, song_duration, video_url, song_tuning, song_key]);
        res.render('newsong.ejs', {success: true, failed: false, song_name: song_name});
        // console.log('Following song has been added to the database: ',song_name, release_year, song_duration, video_url, song_tuning, song_key)

    } catch (error) {
        console.error('This is an error happening:', error)
        res.status(500).render('newsong.ejs',{success:false, failed: true})
    }
})

async function getSongs() {
    try {
       const result = await db.query('SELECT * FROM songs') 
       return result
    } catch (error) {
        console.error('This is an error happening:', error)
        return error
    }
}
























export default router