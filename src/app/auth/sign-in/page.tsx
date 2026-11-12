import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  // useSearchParams() in AuthForm needs a Suspense boundary.
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
