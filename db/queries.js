import db from "./db.js";

// ------------------------------------------ SQL CONSTANTS ------------------------------------------

// Songs
const CHECK_SONG_EXISTS = `
    SELECT EXISTS(
        SELECT * FROM vw_songdetails
        WHERE LOWER(TRIM(song_title)) = LOWER(TRIM($1))
        AND LOWER(TRIM(artist_name)) = LOWER(TRIM($2))
        AND LOWER(TRIM(album_name)) = LOWER(TRIM($3))
    ) AS song_exists`;

const INSERT_SONG = `
    INSERT INTO songs (song_title, artist_id, album_id, release_year, duration, video_url, song_tuning, song_key)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING song_id`;

// Artists
const CHECK_ARTIST_EXISTS = `SELECT EXISTS(SELECT * FROM artists WHERE artist_name = $1) AS artist_exists`;
const GET_ARTIST_BY_NAME  = `SELECT * FROM artists WHERE artist_name = $1`;
const INSERT_ARTIST       = `INSERT INTO artists (artist_name) VALUES ($1) RETURNING *`;

// Albums
const CHECK_ALBUM_EXISTS = `SELECT EXISTS(SELECT * FROM albums WHERE album_name = $1) AS album_exists`;
const GET_ALBUM_BY_NAME  = `SELECT * FROM albums WHERE album_name = $1`;
const INSERT_ALBUM       = `INSERT INTO albums (album_name, artist_id) VALUES ($1, $2) RETURNING *`;

// User Songs
const LINK_SONG_TO_USER = `INSERT INTO user_songs (user_id, song_id) VALUES ($1, $2)`;

const GET_SONGS_WITH_COUNTS = `SELECT * FROM vw_user_songdetails WHERE user_id = $1`;

const INCREMENT_PICK_COUNT = `
    UPDATE user_songs
    SET song_pick_count = song_pick_count + 1
    WHERE user_id = $1 AND song_id = $2`;

const GET_SONGS_BY_USER = `SELECT * FROM vw_user_songdetails WHERE user_id = $1`;

// Users
const CHECK_USER_EXISTS  = `SELECT EXISTS(SELECT * FROM users WHERE email_address = $1) AS user_exists`;
const INSERT_USER        = `INSERT INTO users (user_name, email_address, hashed_password) VALUES ($1, $2, $3)`;
const GET_USER_BY_EMAIL  = `SELECT * FROM users WHERE email_address = $1`;


// ------------------------------------------ SONGS ------------------------------------------

export async function getSongs(user_id) {
    try {
        const result = await db.query(GET_SONGS_BY_USER, [user_id])
        return result
    } catch (error) {
        console.error('Error getting songs:', error);
        throw error;
    }
}

export async function saveNewSong(user_id, song_name, artist_name, album_name, release_year, song_duration, video_url, song_tuning, song_key) {
    try {
        const songExists = await doesSongExist(song_name, artist_name, album_name)
        let song_messsage = ""
        if (!songExists) {
            const artist_id = await saveNewArtist(artist_name);
            const album_id = await saveNewAlbum(album_name, artist_id);
            const result = await db.query(INSERT_SONG, [song_name, artist_id, album_id, release_year, song_duration, video_url, song_tuning, song_key]);
            const song_id = result.rows[0].song_id;
            await linkSongToUser(user_id, song_id);
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
        const result = await db.query(CHECK_SONG_EXISTS, [song_name, artist_name, album_name])
        return result.rows[0].song_exists;
    } catch (error) {
        console.error('Error checking if song exists:', error);
        throw error;
    }
}

export async function getSongsWithCounts(user_id) {
    try {
        const result = await db.query(GET_SONGS_WITH_COUNTS, [user_id])
        return result.rows;
    } catch (error) {
        console.error('Error getting songs with counts:', error);
        throw error;
    }
}

export async function incrementPickCount(user_id, song_id) {
    try {
        await db.query(INCREMENT_PICK_COUNT, [user_id, song_id])
    } catch (error) {
        console.error('Error incrementing pick count:', error);
        throw error;
    }
}

async function linkSongToUser(user_id, song_id) {
    try {
        await db.query(LINK_SONG_TO_USER, [user_id, song_id])
    } catch (error) {
        console.error('Error linking song to user:', error);
        throw error;
    }
}

// ------------------------------------------ ARTISTS ------------------------------------------

async function isArtistCreated(artist_name) {
    try {
        const result = await db.query(CHECK_ARTIST_EXISTS, [artist_name])
        return result.rows[0].artist_exists;
    } catch (error) {
        console.error('Error checking if artist exists:', error);
        throw error;
    }
}

async function getArtistId(artist_name) {
    try {
        const result = await db.query(GET_ARTIST_BY_NAME, [artist_name])
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
            const result = await db.query(INSERT_ARTIST, [artist_name])
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
        const result = await db.query(CHECK_ALBUM_EXISTS, [album_name])
        return result.rows[0].album_exists;
    } catch (error) {
        console.error('Error checking if album exists:', error);
        throw error;
    }
}

async function getAlbumId(album_name) {
    try {
        const result = await db.query(GET_ALBUM_BY_NAME, [album_name])
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
            const result = await db.query(INSERT_ALBUM, [album_name, artist_id])
            return result.rows[0].album_id;
        } else {
            return await getAlbumId(album_name);
        }
    } catch (error) {
        console.error('Error saving album:', error);
        throw error;
    }
}

// ------------------------------------------ USERS ------------------------------------------

export async function doesUserExist(email) {
    try {
        const result = await db.query(CHECK_USER_EXISTS, [email])
        return result.rows[0].user_exists;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        throw error;
    }
}

export async function saveNewUser(username, email, hashed_password) {
    try {
        await db.query(INSERT_USER, [username, email, hashed_password])
    } catch (error) {
        console.error('Error saving new user:', error);
        throw error;
    }
}

export async function getUserByEmail(email) {
    try {
        const result = await db.query(GET_USER_BY_EMAIL, [email])
        return result.rows[0];
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}
