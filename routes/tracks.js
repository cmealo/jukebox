import { Router } from "express";
import db from "#db/client";
const router = Router();

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

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, name, duration_ms FROM tracks WHERE id = $1;",
      [req.params.id]
    );
    const track = rows[0];
    if (!track) return res.status(404).json({ error: "Track not found" });
    res.json(track);
  } catch (e) {
    next(e);
  }
});

export default router;
