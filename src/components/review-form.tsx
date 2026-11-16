"use client";

import { Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveReview } from "@/actions/learning";
import { cn } from "@/lib/utils";

export function ReviewForm({
  slug,
  coachName,
  existing,
}: {
  slug: string;
  coachName: string;
  existing?: { rating: number; body: string };
}) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState(existing?.body ?? "");
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return toast.error("Pick a star rating first.");
    start(async () => {
      const result = await saveReview({ slug, rating, body });
      if (!result.ok) return void toast.error(result.error);
      toast.success(existing ? "Review updated" : "Thanks for your review!");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="rounded-lg border bg-card p-5" data-testid="review-form">
      <p className="font-medium">{existing ? "Your review" : `Review ${coachName.split(" ")[0]}`}</p>
      <p className="text-sm text-muted-foreground">
        {existing ? "You can update it any time." : "Only verified clients can review. Be honest and specific."}
      </p>
      <div className="mt-4 flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
          >
            <Star className={cn("size-7 transition-colors", n <= (hover || rating) ? "fill-brand text-brand" : "text-muted-foreground/40")} />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What changed for you after training together?"
        aria-label="Review"
        className="mt-4 min-h-24 w-full rounded-sm border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
        maxLength={1000}
      />
      <button
        type="submit"
        disabled={pending}
        className="eyebrow mt-3 inline-flex h-10 items-center gap-2 rounded-sm bg-brand px-5 text-[11px] text-brand-foreground hover:bg-brand/85 disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {existing ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
