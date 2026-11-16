"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { setLessonComplete } from "@/actions/learning";
import { cn } from "@/lib/utils";

export function MarkCompleteButton({
  slug,
  position,
  complete,
  nextHref,
}: {
  slug: string;
  position: number;
  complete: boolean;
  nextHref?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await setLessonComplete({ slug, position, complete: !complete });
          if (!result.ok) return void toast.error(result.error);
          if (!complete) {
            toast.success("Lesson complete", nextHref ? { action: { label: "Next lesson", onClick: () => router.push(nextHref) } } : undefined);
          }
          router.refresh();
        })
      }
      className={cn(
        "eyebrow inline-flex h-11 items-center gap-2 rounded-sm px-5 disabled:opacity-60",
        complete ? "border text-[11px] hover:border-foreground/40" : "bg-brand text-brand-foreground hover:bg-brand/85",
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : complete ? <CheckCircle2 className="text-lime size-4" /> : <Circle className="size-4" />}
      {complete ? "Completed" : "Mark complete"}
    </button>
  );
}
