/**
 * Fixes the __drizzle_migrations table by replacing old filename-based hashes
 * with correct SHA256 hashes (as expected by drizzle-kit 0.30+).
 *
 * Run once: node scripts/fix-migration-hashes.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const migrationsFolder = path.join(root, "shared/database/migrations");
const journalPath = path.join(migrationsFolder, "meta/_journal.json");

const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));

// Only hash migrations that are already applied (indices 0-20)
const APPLIED_UP_TO_IDX = 20;
const appliedEntries = journal.entries.filter(
  (e) => e.idx <= APPLIED_UP_TO_IDX,
);

console.log(`Re-hashing ${appliedEntries.length} applied migrations...`);

const hashes = appliedEntries.map((entry) => {
  const sqlPath = path.join(migrationsFolder, `${entry.tag}.sql`);
  const content = fs.readFileSync(sqlPath, "utf8");
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  console.log(`  ${entry.tag} → ${hash.substring(0, 16)}...`);
  return { tag: entry.tag, hash };
});

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query("BEGIN");
  await client.query("DELETE FROM __drizzle_migrations");
  for (const { hash } of hashes) {
    await client.query("INSERT INTO __drizzle_migrations (hash) VALUES ($1)", [
      hash,
    ]);
  }
  await client.query("COMMIT");
  console.log(`\n✓ Replaced ${hashes.length} migration hashes.`);
  console.log("Now run: npm run drizzle:migrate");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  await client.end();
}
