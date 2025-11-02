import { Router } from "express";
import db from "#db/client";
const router = Router();

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

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !description)
      return res
        .status(400)
        .json({ error: "name and description are required" });

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

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, description FROM playlists WHERE id = $1;",
      [req.params.id]
    );
    const playlist = rows[0];
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });
    res.json(playlist);
  } catch (e) {
    next(e);
  }
});

router.get("/:id/tracks", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT t.id, t.name, t.duration_ms
         FROM playlists_tracks pt
         JOIN tracks t ON t.id = pt.track_id
        WHERE pt.playlist_id = $1
        ORDER BY t.id;`,
      [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/tracks", async (req, res, next) => {
  try {
    const playlistId = Number(req.params.id);
    const { trackId } = req.body || {};
    if (!trackId) return res.status(400).json({ error: "trackId is required" });

    const { rows } = await db.query(
      `INSERT INTO playlists_tracks (playlist_id, track_id)
       VALUES ($1, $2)
       RETURNING id, playlist_id, track_id;`,
      [playlistId, trackId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  } // unique/FK handled by error middleware
});

export default router;
