/**
 * Single-Shop Database Bootstrap
 *
 * Ensures the database has the required default store/vendor row
 * for foreign key constraints in single-shop mode.
 *
 * This is NOT multi-vendor behavior - it's a technical requirement
 * to satisfy FK constraints (product.vendorId, orderItem.vendorId).
 */

import { db } from "#root/shared/database/drizzle/db";
import { vendor, file } from "#root/shared/database/drizzle/schema";
import { getStoreOwnerId } from "#root/shared/config/store";
import { eq, count } from "drizzle-orm";
import { existsSync, mkdirSync, readdirSync } from "node:fs";

/**
 * Ensures the default store owner vendor row exists
 * This must be called during server startup after DB connection is established
 */
export async function ensureDefaultStoreVendor(): Promise<void> {
  const storeOwnerId = getStoreOwnerId();
  const database = db();

  try {
    // Check if vendor row already exists
    const existing = await database.query.vendor.findFirst({
      where: eq(vendor.id, storeOwnerId),
    });

    if (existing) {
      console.log(
        `[Bootstrap] Default store vendor already exists (id: ${storeOwnerId})`,
      );
      return;
    }

    // Create the default store vendor row
    await database.insert(vendor).values({
      id: storeOwnerId,
      name: "Store",
      status: "active", // Must be active for FK references to work
      description: "Default store owner (single-shop mode)",
      logoId: null,
      socialLinks: [],
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(
      `[Bootstrap] ✅ Created default store vendor (id: ${storeOwnerId})`,
    );
  } catch (error) {
    console.error(
      "[Bootstrap] ❌ Failed to ensure default store vendor:",
      error,
    );
    throw error;
  }
}

/**
 * Verifies that the uploads directory is present and (when the DB has file
 * records) not empty. This catches the common deployment mistake of running
 * without a persistent volume mounted at the uploads directory, which causes
 * product/category images to 404 after a redeploy.
 *
 * It is intentionally non-destructive: it never deletes files or DB records,
 * it only ensures the directory exists and emits a clear startup warning.
 */
export async function checkUploadsDirectory(uploadsDir: string): Promise<void> {
  try {
    // Ensure the directory exists so uploads can be written even when a fresh
    // persistent volume was just mounted (mounts start empty).
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
      console.log(`[Uploads] Created uploads directory at ${uploadsDir}`);
    }

    // Count files actually present on disk (ignore temp_* partials).
    const diskFiles = readdirSync(uploadsDir).filter(
      (name) => !name.startsWith("temp_"),
    );

    // Count file records the DB expects to exist on disk.
    const database = db();
    const [row] = await database.select({ count: count() }).from(file);
    const dbFileCount = Number(row?.count ?? 0);

    if (dbFileCount > 0 && diskFiles.length === 0) {
      console.warn(
        `[Uploads] ⚠️  The database has ${dbFileCount} file record(s) but the ` +
          `uploads directory "${uploadsDir}" is empty. Uploaded images will 404. ` +
          `This usually means a persistent volume is NOT mounted at this path. ` +
          `On Coolify/Docker, mount a persistent volume to /app/uploads so files ` +
          `survive redeploys. Existing file records were left untouched.`,
      );
    } else {
      console.log(
        `[Uploads] ✅ Uploads directory OK (${diskFiles.length} file(s) on disk, ` +
          `${dbFileCount} record(s) in DB) at ${uploadsDir}`,
      );
    }
  } catch (error) {
    // Never block startup on this diagnostic check.
    console.error("[Uploads] Failed to verify uploads directory:", error);
  }
}
