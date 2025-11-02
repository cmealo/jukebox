import db from "#db/client";

// connect / seed / close
await db.connect();
try {
  await seed();
  console.log("🌱 Database seeded.");
} catch (err) {
  console.error("Seed failed:", err);
  process.exitCode = 1;
} finally {
  await db.end();
}

async function seed() {
  // Reset tables & sequences so IDs start at 1
  await db.query(`
    TRUNCATE TABLE playlists_tracks, playlists, tracks
    RESTART IDENTITY;
  `);

  // 20+ tracks
  const tracks = [
    ["Daydream", 180000],
    ["Neon Skyline", 204000],
    ["Silver Lines", 195000],
    ["Glass Garden", 225000],
    ["Firefly Night", 210000],
    ["Parallel Roads", 186000],
    ["Velvet Sun", 201000],
    ["Low Tide", 234000],
    ["Orbit", 198000],
    ["Polaroid", 177000],
    ["Moon Quilt", 205000],
    ["Sugar Pines", 192000],
    ["Painted Kites", 189000],
    ["Night Swim", 220000],
    ["Cool Ember", 203000],
    ["First Light", 182000],
    ["Cardigan Weather", 207000],
    ["Golden Thread", 194000],
    ["Sundown Drive", 216000],
    ["Electric Honey", 199000],
    ["Soft Static", 196000],
  ];

  await db.query(
    `INSERT INTO tracks (name, duration_ms)
     SELECT t.name, t.duration_ms
     FROM jsonb_to_recordset($1::jsonb)
       AS t(name text, duration_ms int);`,
    [
      JSON.stringify(
        tracks.map(([name, duration_ms]) => ({ name, duration_ms }))
      ),
    ]
  );

  // 10 playlists
  const playlists = [
    ["Morning Coffee", "Easy acoustic to start the day"],
    ["Deep Focus", "Ambient instrumentals for work"],
    ["Run Club", "Upbeat tracks for running"],
    ["Road Trip", "Sing-alongs for the highway"],
    ["Chillwave", "Mellow electronic vibes"],
    ["Indie Mix", "A bit of everything"],
    ["Late Night Coding", "Synths and lo-fi beats"],
    ["House Party", "Dance & pop bangers"],
    ["Sunday Supper", "Warm & cozy"],
    ["Rainy Day", "Soft & moody"],
  ];

  await db.query(
    `INSERT INTO playlists (name, description)
     SELECT p.name, p.description
     FROM jsonb_to_recordset($1::jsonb)
       AS p(name text, description text);`,
    [
      JSON.stringify(
        playlists.map(([name, description]) => ({ name, description }))
      ),
    ]
  );

  // ≥15 playlist-track links
  const pairs = [
    [1, 1],
    [1, 3],
    [1, 5],
    [2, 2],
    [2, 6],
    [2, 10],
    [3, 4],
    [3, 7],
    [3, 14],
    [4, 8],
    [4, 9],
    [4, 12],
    [5, 11],
    [5, 13],
    [5, 15],
    [6, 16],
    [7, 18],
    [8, 19],
    [9, 20],
    [10, 21], // track 21 exists
  ];

  for (const [playlist_id, track_id] of pairs) {
    await db.query(
      `INSERT INTO playlists_tracks (playlist_id, track_id)
       VALUES ($1, $2)
       ON CONFLICT (playlist_id, track_id) DO NOTHING;`,
      [playlist_id, track_id]
    );
  }

  // Optional: quick sanity counts
  const [{ count: tCount }] = (
    await db.query(`SELECT COUNT(*)::int AS count FROM tracks;`)
  ).rows;
  const [{ count: pCount }] = (
    await db.query(`SELECT COUNT(*)::int AS count FROM playlists;`)
  ).rows;
  const [{ count: ptCount }] = (
    await db.query(`SELECT COUNT(*)::int AS count FROM playlists_tracks;`)
  ).rows;
  console.log(`Tracks: ${tCount}, Playlists: ${pCount}, Links: ${ptCount}`);
}
