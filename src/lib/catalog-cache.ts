import "server-only";
import { revalidateTag, updateTag } from "next/cache";
import { after } from "next/server";
import { CATALOG_TAG } from "@/lib/queries";

/**
 * Invalidate the cached public catalog (coaches, programs, reviews) after a
 * write. Call only from Server Actions.
 *
 * `updateTag` expires the cache immediately (read-your-own-writes). But a
 * regeneration that was already in flight when the write happened (for
 * example one started by a link prefetch of an already-stale page) can finish
 * afterwards and store pre-write data as fresh. We saw exactly that in the
 * end-to-end tests. Expiring the tag once more a few seconds after the
 * response discards anything such a regeneration stored.
 */
export function invalidateCatalog() {
  updateTag(CATALOG_TAG);
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, 3_000));
    revalidateTag(CATALOG_TAG, { expire: 0 });
  });
}
