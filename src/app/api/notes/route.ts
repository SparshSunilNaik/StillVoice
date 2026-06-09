import { NextResponse } from "next/server";

import { createNoteRecord, listNotes } from "@/lib/server/note-repository";

export const runtime = "nodejs";

function isNotePayload(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;

  return (
    typeof payload.title === "string" &&
    typeof payload.transcript === "string" &&
    typeof payload.durationSeconds === "number"
  );
}

export async function GET() {
  try {
    return NextResponse.json({ notes: await listNotes() });
  } catch {
    return NextResponse.json({ error: "Unable to load notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isNotePayload(payload)) {
      return NextResponse.json({ error: "Invalid note payload" }, { status: 400 });
    }

    const note = await createNoteRecord(payload as Parameters<typeof createNoteRecord>[0]);
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Unable to save note" }, { status: 500 });
  }
}
