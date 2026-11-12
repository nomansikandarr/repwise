import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-1.5", className)}>
      <svg viewBox="0 0 28 20" className="h-5 w-7 text-brand" fill="currentColor" aria-hidden>
        <path d="M0 20 7 0h6L6 20zM9 20 16 0h6l-7 20zM19 20l4-11h5l-4 11z" />
      </svg>
      <span className="display text-xl">Repwise</span>
    </Link>
  );
}
