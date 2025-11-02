-- Drop tables in correct order (if they exist)
DROP TABLE IF EXISTS playlists_tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS tracks;

-- Create tracks table
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration_ms INTEGER NOT NULL
);

-- Create playlists table
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Create join table for many-to-many relationship
CREATE TABLE playlists_tracks (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  UNIQUE (playlist_id, track_id)
);
