import { NextResponse } from "next/server";

import { deleteAudioForNote } from "@/lib/server/audio-repository";
import { deleteNoteRecord, findNote, updateNoteRecord } from "@/lib/server/note-repository";

export const runtime = "nodejs";

type NoteRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: NoteRouteContext) {
  try {
    const { id } = await context.params;
    const note = await findNote(id);
    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Unable to load note" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: NoteRouteContext) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as Record<string, unknown>;
    const updates = {
      ...(typeof payload.title === "string" ? { title: payload.title } : {}),
      ...(typeof payload.transcript === "string" ? { transcript: payload.transcript } : {}),
      ...(typeof payload.durationSeconds === "number" ? { durationSeconds: payload.durationSeconds } : {}),
    };

    const note = await updateNoteRecord(id, updates);
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json({ error: "Unable to update note" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: NoteRouteContext) {
  try {
    const { id } = await context.params;
    await deleteAudioForNote(id);
    await deleteNoteRecord(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete note" }, { status: 500 });
  }
}
