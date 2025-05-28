import { PGlite } from "@electric-sql/pglite";

console.log("Starting...");

const db = new PGlite('idb://my-pgdata')

console.log("Ready!");

console.log("Creating table...");
export async function initializeDb() {
await db.exec(`
  DROP TABLE IF EXISTS patients;

 CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)}

export default db;

