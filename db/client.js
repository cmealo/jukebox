import pg from "pg";

const { Client } = pg;

// Create a new PostgreSQL client using the DATABASE_URL
const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

export default db;
