import db from "./client.js";

await db.connect();
const result = await db.query("SELECT current_database()");
console.log("Connected to:", result.rows[0].current_database);
await db.end();
