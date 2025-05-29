import { PGliteWorker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live'

console.log('Creating worker...');
const db = new PGliteWorker(
  new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module',
    name: 'pglite-worker',
  }),
  {
  extensions: {
      live,
    },
    dataDir: 'idb://my-pgdata',
  }
);

console.log('Worker is ready!');

export async function initializeDb() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (name, phone) 
    );
  `);
}

export default db;
