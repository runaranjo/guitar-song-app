-- Artists Table
CREATE TABLE artists (
    artist_id SERIAL PRIMARY KEY,
    artist_name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Albums Table (Now Includes artist_id)
CREATE TABLE albums (
    album_id SERIAL PRIMARY KEY,
    album_name VARCHAR(200) NOT NULL,
    artist_id INT NOT NULL,  -- Albums belong to an artist
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE  -- Delete albums if artist is deleted
);

-- Songs Table
CREATE TABLE songs (
    song_id SERIAL PRIMARY KEY,
    song_title VARCHAR(200) NOT NULL,
    artist_id INT NOT NULL,
    album_id INT,
    release_year INT,
    duration VARCHAR(20),
    video_url TEXT,  -- Can store YouTube or other video URLs
    song_tuning VARCHAR(100),  -- Guitar tuning (e.g., standard, drop D, etc.)
    song_key VARCHAR(100),  -- Musical key (e.g., C major, A minor, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE,  -- Delete songs if artist is deleted
    FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE  -- Delete songs if album is deleted
);

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(200) UNIQUE NOT NULL,
    email_address VARCHAR(300) UNIQUE NOT NULL,
    hashed_password VARCHAR(300) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Songs Table (Tracks user song preferences)
CREATE TABLE user_songs (
    user_song_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    song_pick_count INT DEFAULT 0,
    song_tier INT DEFAULT 1,  -- 1 highest - 3 lowest
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
);



-- View: Song details per user (includes pick count and tier)
CREATE VIEW vw_user_songdetails AS
    SELECT
        us.user_id,
        us.song_id,
        us.song_pick_count,
        us.song_tier,
        s.song_title,
        a.artist_name,
        al.album_name,
        s.release_year,
        s.duration,
        s.video_url,
        s.song_tuning,
        s.song_key
    FROM user_songs us
    JOIN songs s ON us.song_id = s.song_id
    JOIN artists a ON s.artist_id = a.artist_id
    JOIN albums al ON s.album_id = al.album_id;


-- TEST DATA

-- INSERT INTO songs (song_name, artist_name, release_year, duration, video_url, song_tuning, song_key)
-- VALUES
--     ('Bohemian Rhapsody', 'Queen', 1975, '00:05:55', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', 'Standard', 'B♭ major'),
--     ('Stairway to Heaven', 'Led Zeppelin', 1971, '00:08:02', 'https://www.youtube.com/watch?v=QkF3oxziUI4', 'Standard', 'A minor'),
--     ('Imagine', 'John Lennon', 1971, '00:03:04', 'https://www.youtube.com/watch?v=YkgkThdzX-8', 'Standard', 'C major'),
--     ('Hotel California', 'Eagles', 1976, '00:06:30', 'https://www.youtube.com/watch?v=EqPtfz0yM4w', 'Standard', 'B minor'),
--     ('Hey Jude', 'The Beatles', 1968, '00:07:11', 'https://www.youtube.com/watch?v=A_MjCqQoLLA', 'Standard', 'F major'),
--     ('Smells Like Teen Spirit', 'Nirvana', 1991, '00:05:01', 'https://www.youtube.com/watch?v=hTWK4pW1tJU', 'Drop D', 'F minor')