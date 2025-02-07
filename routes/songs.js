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


// Success/Failed to show either Success Message or Error Message

router.get('/newsong', (req, res) => {
    res.render('newsong.ejs', {success: false, failed: false})
})

router.post('/addsong', async (req, res) => {
   const song_name = req.body.song_name;
   const release_year = req.body.release_year;
   const song_duration = req.body.duration;
   const video_url = req.body.video_url;
   const song_tuning = req.body.song_tuning;
   const song_key = req.body.song_key;
   
    try {
    //    res.json({success: true});
     //  await db.query('INSERT INTO songs (song_name, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6)',
      //                 [song_name, release_year, song_duration, video_url, song_tuning, song_key])
     console.log('Following song has been added to the database: ',song_name, release_year, song_duration, video_url, song_tuning, song_key)
     res.render('newsong.ejs', {success: true, failed: false})


} catch (error) {
        console.error('This is an error happening:', error)
        res.status(500).render('newsong.ejs',{success:false, failed: true})
    }
})


export default router