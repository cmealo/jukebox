// routes/tracks.js
import { Router } from "express";
import db from "#db/client";

const router = Router();

/**
 * Ensure :id is a strict integer before hitting the DB.
 * Stores the parsed number on req.trackId.
 */
router.param("id", (req, res, next, id) => {
  const n = Number(id);
  if (!Number.isInteger(n)) {
    return res.status(400).json({ error: "id must be a number" });
  }
  req.trackId = n;
  next();
});

// GET /tracks -> all tracks
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, duration_ms FROM tracks ORDER BY id;"
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// GET /tracks/:id -> specified track
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, duration_ms FROM tracks WHERE id = $1;",
      [req.trackId] // <-- use validated number
    );
    const track = rows[0];
    if (!track) return res.status(404).json({ error: "Track not found" });
    res.json(track);
  } catch (e) {
    next(e);
  }
});

export default router;
