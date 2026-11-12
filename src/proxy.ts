import { NextResponse, type NextRequest } from "next/server";
import { authDisabledInDev, getAuth } from "@/lib/auth/server";

/**
 * Optimistic route protection only: signed-out visitors are sent to sign-in.
 * Role checks (member / coach / admin) happen in each area's layout, and every
 * Server Action re-checks the session itself (see src/lib/dal.ts).
 *
 * Neon Auth already allows /api/auth and the signed-out /auth/* views.
 */
const PUBLIC_ROUTES = ["/", "/trainers", "/programs"];

let middleware: ((req: NextRequest) => Promise<Response>) | undefined;

export default function proxy(req: NextRequest) {
  if (authDisabledInDev()) return NextResponse.next();
  middleware ??= getAuth().middleware({
    loginUrl: "/auth/sign-in",
    publicRoutes: PUBLIC_ROUTES,
  }) as (req: NextRequest) => Promise<Response>;
  return middleware(req);
}

export const config = {
  matcher: [
    // Everything except Next internals, the Sentry tunnel, and static files.
    "/((?!_next/static|_next/image|monitoring|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
