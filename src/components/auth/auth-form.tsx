"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/client";

type Mode = "sign-in" | "sign-up";

/** Only allow same-origin relative redirects (no `//evil.com`). */
function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function errorMessage(err: unknown) {
  const e = err as { error?: { message?: string }; message?: string } | undefined;
  return e?.error?.message ?? e?.message ?? "Something went wrong. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirect(params.get("redirectTo"));
  const [pending, setPending] = useState<"email" | "google" | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setPending("email");
    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ email, password, name: String(form.get("name")) })
          : await authClient.signIn.email({ email, password });
      if (result?.error) throw result;
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(null);
    }
  }

  async function google() {
    setPending("google");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: new URL(redirectTo, window.location.origin).toString(),
      });
    } catch (err) {
      toast.error(errorMessage(err));
      setPending(null);
    }
  }

  const isSignUp = mode === "sign-up";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="display text-3xl">{isSignUp ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? "Start training with Pakistan's best coaches in minutes."
            : "Sign in to continue your training."}
        </p>
      </div>

      <Button variant="outline" className="w-full" onClick={google} disabled={pending !== null}>
        {pending === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
        <Separator className="flex-1" /> or <Separator className="flex-1" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending !== null}>
          {pending === "email" && <Loader2 className="animate-spin" />}
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New to Repwise? "}
        <Link
          href={`/auth/${isSignUp ? "sign-in" : "sign-up"}${redirectTo !== "/dashboard" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
