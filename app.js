import express from "express";
import tracksRouter from "./routes/tracks.js";
import playlistsRouter from "./routes/playlists.js";

const app = express();

app.use(express.json());
app.use("/tracks", tracksRouter);
app.use("/playlists", playlistsRouter);

// PostgreSQL-aware error handler (rubric)
app.use((err, req, res, next) => {
  if (err?.code === "23505") {
    return res
      .status(400)
      .json({ error: "That track is already in the playlist." }); // unique violation
  }
  if (err?.code === "23503") {
    return res
      .status(400)
      .json({ error: "Invalid playlist or track reference." }); // FK violation
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
