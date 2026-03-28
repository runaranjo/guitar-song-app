import express from "express";
import { getSongs, saveNewSong, getSongsWithCounts, incrementPickCount } from "../db/queries.js";
import { isLoggedIn } from "../middleware/auth.js";

const router = express.Router()

router.get('/', (req, res) => {
    res.render('index.ejs')
});

router.get('/home', isLoggedIn, async (req, res) => {
    let song_list = [];
    const song_data = await getSongs(req.session.user.id);
    song_data.rows.forEach(song => {
        song_list.push({ song_title: song.song_title, artist_name: song.artist_name })
    });
    res.render('home.ejs', { song_data: song_list })
});

router.get('/newsong', isLoggedIn, (req, res) => {
    res.render('newsong.ejs', { success: false, failed: false })
});

router.post('/addsong', isLoggedIn, async (req, res) => {
    const song_name = req.body.song_name;
    const artist_name = req.body.artist_name;
    const album_name = req.body.album_name;
    const release_year = req.body.release_year;
    const song_duration = req.body.duration;
    const video_url = req.body.video_url;
    const song_tuning = req.body.song_tuning;
    const song_key = req.body.song_key;

    try {
        const new_song_result = await saveNewSong(req.session.user.id, song_name, artist_name, album_name, release_year, song_duration, video_url, song_tuning, song_key)
        res.render('newsong.ejs', { success: new_song_result.success, failed: new_song_result.failed, song_result: new_song_result.song_messsage });
    } catch (error) {
        console.error('Error adding song:', error)
        res.status(500).render('newsong.ejs', { success: false, failed: true })
    }
});

router.get('/randomsong', isLoggedIn, async (req, res) => {
    const songs = await getSongsWithCounts(req.session.user.id)
    const song = weightedRandom(songs)
    await incrementPickCount(req.session.user.id, song.song_id)
    res.json(song)
});

function weightedRandom(songs) {
    const weights = songs.map(s => 1 / (s.song_pick_count + 1))
    const total = weights.reduce((sum, w) => sum + w, 0)
    let random = Math.random() * total
    for (let i = 0; i < songs.length; i++) {
        random -= weights[i]
        if (random <= 0) return songs[i]
    }
    return songs[songs.length - 1]
}

export default router
