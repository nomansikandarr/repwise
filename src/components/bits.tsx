import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Solid lime call-to-action with an arrow, as in the design reference. */
export function CtaLink({
  href,
  children,
  className,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "solid" | "line" | "dark";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "eyebrow group inline-flex h-11 items-center gap-4 whitespace-nowrap transition-colors",
        variant === "solid" && "rounded-sm bg-brand px-5 text-brand-foreground hover:bg-brand/85",
        variant === "dark" && "rounded-sm bg-black px-5 text-white hover:bg-black/80",
        variant === "line" && "border-b border-current/40 hover:border-current",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-3.5", n <= Math.round(value) ? "fill-brand text-brand" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", className)}>
      <Star className="size-3.5 fill-brand text-brand" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal opacity-70">({count})</span>}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-lime mb-3">{eyebrow}</p>}
        <h2 className="display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("eyebrow inline-flex items-center rounded-sm border px-2 py-1 text-[10px] text-muted-foreground", className)}>
      {children}
    </span>
  );
}
