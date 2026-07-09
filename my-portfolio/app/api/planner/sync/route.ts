import { NextResponse } from "next/server";
import {
  upstashCreds,
  extractKey,
  keyMatches,
  getStateDoc,
  putStateDoc,
} from "@/lib/plannerSync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Shared planner state: whole-doc JSON with optimistic-concurrency rev.
// GET  → { rev, state }
// PUT  { rev, state } → { rev } on success, 409 { currentRev } on stale write.

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
function notConfigured() {
  return NextResponse.json({ error: "sync not configured" }, { status: 503 });
}

export async function GET(req: Request) {
  const creds = upstashCreds();
  if (!creds) return notConfigured();
  if (!keyMatches(extractKey(req))) return unauthorized();
  try {
    const doc = await getStateDoc(creds);
    return NextResponse.json(doc);
  } catch (err) {
    console.error("planner sync GET:", err);
    return NextResponse.json({ error: "sync read failed" }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  const creds = upstashCreds();
  if (!creds) return notConfigured();
  if (!keyMatches(extractKey(req))) return unauthorized();

  let body: { rev?: unknown; state?: unknown };
  try {
    body = (await req.json()) as { rev?: unknown; state?: unknown };
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const expectedRev = Number(body.rev);
  if (!Number.isFinite(expectedRev) || expectedRev < 0) {
    return NextResponse.json({ error: "missing rev" }, { status: 400 });
  }
  if (body.state == null || typeof body.state !== "object") {
    return NextResponse.json({ error: "missing state" }, { status: 400 });
  }

  try {
    const result = await putStateDoc(creds, expectedRev, JSON.stringify(body.state));
    if (!result.ok) {
      return NextResponse.json({ error: "conflict", currentRev: result.currentRev }, { status: 409 });
    }
    return NextResponse.json({ rev: result.rev });
  } catch (err) {
    console.error("planner sync PUT:", err);
    return NextResponse.json({ error: "sync write failed" }, { status: 502 });
  }
}
