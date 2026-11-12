import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { homePath, requireUser } from "@/lib/dal";

/** Landing spot after sign-in: sends each user to their own area by role. */
export default function DashboardRedirect() {
  return (
    <main className="grid flex-1 place-items-center">
      <Suspense fallback={<Loader2 className="size-6 animate-spin text-muted-foreground" />}>
        <Redirector />
      </Suspense>
    </main>
  );
}

async function Redirector(): Promise<null> {
  redirect(homePath(await requireUser()));
}
