import db from "./db.js";

// ------------------------------------------ SONGS ------------------------------------------

export async function getSongs() {
    try {
        const result = await db.query('SELECT * FROM vw_songdetails')
        return result
    } catch (error) {
        console.error('Error getting songs:', error);
        throw error;
    }
}

export async function saveNewSong(song_name, artist_name, album_name, release_year, song_duration, video_url, song_tuning, song_key) {
    try {
        const songExists = await doesSongExist(song_name, artist_name, album_name)
        let song_messsage = ""
        if (!songExists) {
            const artist_id = await saveNewArtist(artist_name);
            const album_id = await saveNewAlbum(album_name, artist_id);
            await db.query(
                'INSERT INTO songs (song_title, artist_id, album_id, release_year, duration, video_url, song_tuning, song_key) values ($1, $2, $3, $4, $5, $6, $7, $8)',
                [song_name, artist_id, album_id, release_year, song_duration, video_url, song_tuning, song_key]
            );
            song_messsage = `Song ${song_name} added to the database`
            return { success: true, failed: false, song_messsage }
        } else {
            song_messsage = `Song ${song_name} already exists`
            return { success: false, failed: true, song_messsage }
        }
    } catch (error) {
        console.error(`Error saving song: ${song_name}`, error);
        throw error;
    }
}

async function doesSongExist(song_name, artist_name, album_name) {
    try {
        const result = await db.query(
            'SELECT EXISTS(SELECT * from vw_songdetails where song_title = $1 and artist_name = $2 and album_name = $3) as song_exists',
            [song_name, artist_name, album_name]
        )
        return result.rows[0].song_exists;
    } catch (error) {
        console.error('Error checking if song exists:', error);
        throw error;
    }
}

// ------------------------------------------ ARTISTS ------------------------------------------

async function isArtistCreated(artist_name) {
    try {
        const result = await db.query(
            'SELECT EXISTS(SELECT * from artists where artist_name = $1) as artist_exists',
            [artist_name]
        )
        return result.rows[0].artist_exists;
    } catch (error) {
        console.error('Error checking if artist exists:', error);
        throw error;
    }
}

async function getArtistId(artist_name) {
    try {
        const result = await db.query('SELECT * from artists where artist_name = $1', [artist_name])
        return result.rows[0].artist_id;
    } catch (error) {
        console.error('Error getting artist id:', error);
        throw error;
    }
}

async function saveNewArtist(artist_name) {
    try {
        const doesExist = await isArtistCreated(artist_name)
        if (!doesExist) {
            const result = await db.query("INSERT into artists (artist_name) values ($1) RETURNING *", [artist_name])
            return result.rows[0].artist_id;
        } else {
            return await getArtistId(artist_name);
        }
    } catch (error) {
        console.error('Error saving artist:', error);
        throw error;
    }
}

// ------------------------------------------ ALBUMS ------------------------------------------

async function isAlbumCreated(album_name) {
    try {
        const result = await db.query(
            'SELECT EXISTS(SELECT * from albums where album_name = $1) as album_exists',
            [album_name]
        )
        return result.rows[0].album_exists;
    } catch (error) {
        console.error('Error checking if album exists:', error);
        throw error;
    }
}

async function getAlbumId(album_name) {
    try {
        const result = await db.query('SELECT * from albums where album_name = $1', [album_name])
        return result.rows[0].album_id;
    } catch (error) {
        console.error('Error getting album id:', error);
        throw error;
    }
}

async function saveNewAlbum(album_name, artist_id) {
    try {
        const doesExist = await isAlbumCreated(album_name)
        if (!doesExist) {
            const result = await db.query("INSERT into albums (album_name, artist_id) values ($1, $2) RETURNING *", [album_name, artist_id])
            return result.rows[0].album_id;
        } else {
            return await getAlbumId(album_name);
        }
    } catch (error) {
        console.error('Error saving album:', error);
        throw error;
    }
}
