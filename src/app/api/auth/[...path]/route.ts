import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

type Ctx = { params: Promise<{ path: string[] }> };
type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Resolve handlers per request so the auth instance is created lazily.
const forward = (method: Method) => (req: NextRequest, ctx: Ctx) =>
  getAuth().handler()[method](req, ctx);

export const GET = forward("GET");
export const POST = forward("POST");
export const PUT = forward("PUT");
export const DELETE = forward("DELETE");
export const PATCH = forward("PATCH");
