import crypto from "node:crypto";
import fs from "node:fs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const migrationsFolder = "./shared/database/migrations";
const journal = JSON.parse(
  fs.readFileSync(`${migrationsFolder}/meta/_journal.json`, "utf8"),
);
const missing = [
  "0017_lively_hellion",
  "0018_productive_marrow",
  "0019_amusing_the_hand",
  "0020_sweet_prodigy",
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const tag of missing) {
  const content = fs.readFileSync(`${migrationsFolder}/${tag}.sql`, "utf8");
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  const entry = journal.entries.find((e) => e.tag === tag);
  await client.query(
    "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
    [hash, entry.when],
  );
  console.log(`Inserted: ${tag} → ${hash.substring(0, 16)}...`);
}

await client.end();
console.log("Done — run: npm run drizzle:migrate");
