import { Router } from "express";
import db from "#db/client";

const router = Router();

// GET /playlists -> all playlists
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, description FROM playlists ORDER BY id;"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// POST /playlists -> create playlist
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "name and description are required" });
    }

    const { rows } = await db.query(
      `INSERT INTO playlists (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description;`,
      [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
});

// GET /playlists/:id -> specified playlist
router.get("/:id", async (req, res, next) => {
  try {
    const playlistId = Number(req.params.id);
    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "id must be a number" });
    }

    const { rows } = await db.query(
      "SELECT id, name, description FROM playlists WHERE id = $1;",
      [playlistId]
    );
    const playlist = rows[0];
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
});

// GET /playlists/:id/tracks -> all tracks in a playlist
router.get("/:id/tracks", async (req, res, next) => {
  try {
    const playlistId = Number(req.params.id);
    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "id must be a number" });
    }

    // Existence check so we return 404 (not empty 200)
    const exists = await db.query("SELECT 1 FROM playlists WHERE id = $1;", [
      playlistId,
    ]);
    if (!exists.rowCount) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const { rows } = await db.query(
      `SELECT t.id, t.name, t.duration_ms
         FROM playlists_tracks pt
         JOIN tracks t ON t.id = pt.track_id
        WHERE pt.playlist_id = $1
        ORDER BY t.id;`,
      [playlistId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// POST /playlists/:id/tracks -> add a track to a playlist
router.post("/:id/tracks", async (req, res, next) => {
  try {
    const playlistId = Number(req.params.id);
    const { trackId } = req.body || {};

    if (!Number.isInteger(playlistId)) {
      return res.status(400).json({ error: "playlist id must be a number" });
    }
    if (!Number.isInteger(trackId)) {
      return res.status(400).json({ error: "trackId must be a number" });
    }

    // Playlist must exist -> 404 (test expects 404 here)
    const pl = await db.query("SELECT 1 FROM playlists WHERE id = $1;", [
      playlistId,
    ]);
    if (!pl.rowCount) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Track existence -> tests expect 400 when track doesn't exist
    const tr = await db.query("SELECT 1 FROM tracks WHERE id = $1;", [trackId]);
    if (!tr.rowCount) {
      return res.status(400).json({ error: "Track does not exist" });
    }

    const { rows } = await db.query(
      `INSERT INTO playlists_tracks (playlist_id, track_id)
       VALUES ($1, $2)
       RETURNING id, playlist_id, track_id;`,
      [playlistId, trackId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
