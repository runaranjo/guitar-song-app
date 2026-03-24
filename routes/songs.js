import express from "express";
import db from "../db/db.js"
import he from "he"

const router = express.Router()

db.connect();

router.get('/', (req, res) => {
    res.render('index.ejs')
});

router.get('/home', async (req, res) => {
      let song_list = [];   
      const song_data = await getSongs();
    //   console.log(song_data)
      song_data.rows.forEach(song => {
          song_list.push({song_title: song.song_title, artist_name: song.artist_name})
      });
    // console.log(song_list)
    res.render('home.ejs', {song_data: song_list})
});

// Success/Failed to show either Success Message or Error Message
router.get('/newsong', (req, res) => {
    res.render('newsong.ejs', {success: false, failed: false})
});

// ROUTE TO ADD SONG
router.post('/addsong', async (req, res) => {
   const song_name = req.body.song_name;
   const artist_name = req.body.artist_name;
   const album_name = req.body.album_name;
   const release_year = req.body.release_year;
   const song_duration = req.body.duration;
   const video_url = req.body.video_url;
   const song_tuning = req.body.song_tuning;
   const song_key = req.body.song_key;

   try {
        const new_song_result = await saveNewSong(song_name, artist_name, album_name, release_year, song_duration, video_url, song_tuning, song_key)
        res.render('newsong.ejs', {success: new_song_result.success, failed: new_song_result.failed, song_result : new_song_result.song_messsage});
        // console.log('Following song has been added to the database: ',song_name, release_year, song_duration, video_url, song_tuning, song_key)
    } catch (error) {
        console.error('This is an error happening:', error)
        res.status(500).render('newsong.ejs',{success:false, failed: true})
    }
   
});


//  FUNCTIONS CRUD 

// ------------------------------------------ SONGS CRUD ------------------------------------------

async function getSongs() {
    try {
       const result = await db.query('SELECT * FROM vw_songdetails') 
       return result
    } catch (error) {
        console.error('Error getting songs:', error);
        throw error;
    }
};


//  SAVE NEW SONG - Checks song, artist and album existence before inserting
async function saveNewSong(song_name, artist_name, album_name, release_year, song_duration, video_url, song_tuning, song_key){
    try {
        const songExists = await doesSongExist(song_name, artist_name, album_name)
        let song_messsage = ""
        if(!songExists){
            const artist_id = await saveNewArtist(artist_name);
            const album_id = await saveNewAlbum(album_name, artist_id);
            console.log(artist_id, album_id)
            await db.query('INSERT INTO songs (song_title, artist_id, album_id, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6, $7, $8)',
            [song_name, artist_id, album_id, release_year, song_duration, video_url, song_tuning, song_key]);
            song_messsage =  `Song ${song_name} added to the database`
            return { success: true , failed: false,  song_messsage}
        } else {
            song_messsage =  `Song ${song_name} already exists`
            return { success: false, failed : true , song_messsage}
            
        }
    } catch (error) {
        console.error(`Error saving song: ${song_name}`, error);
        throw error;
    }
};


async function doesSongExist(song_name, artist_name, album_name){
    try {
        const result = await db.query('SELECT EXISTS(SELECT * from vw_songdetails where song_title = $1 and artist_name = $2 and album_name = $3) as song_exists', [song_name,artist_name, album_name])
        console.log(result.rows[0].song_exists)
        return result.rows[0].song_exists;
    } catch (error) {
        console.error('Error checking if artist exists:', error);
        throw error;
    } 
}

//  ------------------------ ARTIST CRUD ------------------------------------------

 // Returns either artist exists or not - bool
async function isArtistCreated(artist_name){
    try {
        const result = await db.query('SELECT EXISTS(SELECT * from artists where artist_name = $1) as artist_exists', [artist_name])
        console.log(result.rows[0].artist_exists)
        return result.rows[0].artist_exists;
    } catch (error) {
        console.error('Error checking if artist exists:', error);
        throw error;
    } 
};

 // Returns artist id
 async function getArtistId(artist_name){
    try {
        const result = await db.query('SELECT * from artists where artist_name = $1', [artist_name])
        console.log("Does not exist")
        return result.rows[0].artist_id;
    } catch (error) {
        console.error('Error checking if artist exists:', error);
        throw error;
    } 
};

// Saves artist in db and returns new artist id.
async function saveNewArtist(artist_name){
    try {
       const doesExist = await isArtistCreated(artist_name)

        if (!doesExist){
            const result = await db.query("INSERT into artists (artist_name) values ($1) RETURNING *", [artist_name])
            const new_artist_id = result.rows[0].artist_id;
            console.log('Artist saved in the database')
            return new_artist_id
        } else {
            const new_artist_id = await getArtistId(artist_name);
            console.log("Artist already exist, get its id")
            return new_artist_id
        }
    } catch (error) {
        console.error('Error saving artist:', error);
        throw error;
    }
};


//  ------------------------ ALBUM CRUD ------------------------------------------


 // Returns either Album exists or not - bool
 async function isAlbumCreated(album_name){
    try {
        const result = await db.query('SELECT EXISTS(SELECT * from albums where album_name = $1) as album_exists', [album_name])
        console.log(result.rows[0].album_exists)
        return result.rows[0].album_exists;
    } catch (error) {
        console.error('Error checking if album exists:', error);
        throw error;
    } 
};

 // Returns Album id
 async function getAlbumId(album_name){
    try {
        const result = await db.query('SELECT * from albums where album_name = $1', [album_name])
        console.log("Does not exist")
        return result.rows[0].album_id;
    } catch (error) {
        console.error('Error checking if Album exists:', error);
        throw error;
    } 
};

// Saves Album in db and returns new Album id.
async function saveNewAlbum(album_name, artist_id){
    try {
       const doesExist = await isAlbumCreated(album_name)

        if (!doesExist){
            const result = await db.query("INSERT into albums (album_name, artist_id) values ($1, $2) RETURNING *", [album_name, artist_id])
            const new_album_id = result.rows[0].album_id;
            console.log('Album saved in the database')
            return new_album_id
        } else {
            const new_album_id = await getAlbumId(album_name);
            console.log("Album already exist, get its id")
            return new_album_id
        }
    } catch (error) {
        console.error('Error saving Album:', error);
        throw error;
    }
};


// -----------------------------------------








// // ROUTE TO ADD SONG
// router.post('/addsong', async (req, res) => {
//     const song_name = req.body.song_name;
//     const artist_name = req.body.artist_name;
//     const release_year = req.body.release_year;
//     const song_duration = req.body.duration;
//     const video_url = req.body.video_url;
//     const song_tuning = req.body.song_tuning;
//     const song_key = req.body.song_key;
    
//      try {
//          await db.query('INSERT INTO songs (song_name, artist_name, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6, $7)',
//                        [song_name, artist_name, release_year, song_duration, video_url, song_tuning, song_key]);
//          res.render('newsong.ejs', {success: true, failed: false, song_name: song_name});
//          // console.log('Following song has been added to the database: ',song_name, release_year, song_duration, video_url, song_tuning, song_key)
 
//      } catch (error) {
//          console.error('This is an error happening:', error)
//          res.status(500).render('newsong.ejs',{success:false, failed: true})
//      }
//  })

















export default router