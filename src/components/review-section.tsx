import { and, eq } from "drizzle-orm";
import { ReviewForm } from "@/components/review-form";
import { db } from "@/db";
import { reviews, trainerProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/dal";
import { hasPaidOrderWith } from "@/lib/member";

/** Shows the review form only to members who have paid this coach. */
export async function ReviewSection({ slug, coachName }: { slug: string; coachName: string }) {
  const user = await getCurrentUser();
  if (!user || user.profile.role !== "client") return null;

  const [coach] = await db
    .select({ userId: trainerProfiles.userId })
    .from(trainerProfiles)
    .where(eq(trainerProfiles.slug, slug))
    .limit(1);
  if (!coach || !(await hasPaidOrderWith(user.id, coach.userId))) return null;

  const [existing] = await db
    .select({ rating: reviews.rating, body: reviews.body })
    .from(reviews)
    .where(and(eq(reviews.trainerId, coach.userId), eq(reviews.clientId, user.id)))
    .limit(1);

  return <ReviewForm slug={slug} coachName={coachName} existing={existing} />;
}
