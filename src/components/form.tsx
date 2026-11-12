import { cn } from "@/lib/utils";

/** Small form primitives so every form in the app looks the same. */

const control = "w-full rounded-sm border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-brand";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow mb-2 block text-[11px] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(control, "h-11", props.className)} />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(control, "min-h-28 py-2.5 leading-relaxed", props.className)} />;
}

export function SelectInput(props: React.ComponentProps<"select">) {
  return <select {...props} className={cn(control, "h-11", props.className)} />;
}

export function PrimaryButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn("eyebrow inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-brand px-5 text-brand-foreground hover:bg-brand/85", className)}
    />
  );
}

export function GhostButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn("eyebrow inline-flex h-11 items-center justify-center gap-2 rounded-sm border px-5 text-[11px] hover:border-foreground/40", className)}
    />
  );
}
