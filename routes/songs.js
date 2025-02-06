import express from "express";
import db from "../db/db.js"

const router = express.Router()

db.connect();

router.get('/', (req, res) => {
    res.render('index.ejs')
})

router.get('/home', (req, res) => {
    res.render('home.ejs')
})

router.get('/newsong', (req, res) => {
    res.render('newsong.ejs')
})

router.post('/addsong', async (req, res) => {
   const song_name = req.body.song_name;
   const release_year = req.body.release_year;
   const song_duration = req.body.duration;
   const video_url = req.body.video_url;
   const song_tuning = req.body.song_tuning;
   const song_key = req.body.song_key;
   
    try {
    //    res.json({song_name, release_year, song_duration, video_url, song_tuning, song_key});
     //  await db.query('INSERT INTO songs (song_name, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6)',
      //                 [song_name, release_year, song_duration, video_url, song_tuning, song_key])
     console.log('Following song has been added to the database: ',song_name, release_year, song_duration, video_url, song_tuning, song_key)
        res.redirect('/newsong')

} catch (error) {
        console.error('This is an error happening:', error)
    }
})


export default router