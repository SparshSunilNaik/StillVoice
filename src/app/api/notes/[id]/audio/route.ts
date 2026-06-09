import { NextResponse } from "next/server";

import { saveAudioRecord } from "@/lib/server/audio-repository";

export const runtime = "nodejs";

type AudioRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: AudioRouteContext) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
    const audio = formData.get("audio");
    const durationSeconds = Number(formData.get("durationSeconds") ?? 0);

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    const recording = await saveAudioRecord({
      noteId: id,
      audio: Buffer.from(await audio.arrayBuffer()),
      mimeType: audio.type || "application/octet-stream",
      durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    });

    return NextResponse.json({ recording });
  } catch {
    return NextResponse.json({ error: "Unable to save audio" }, { status: 500 });
  }
}
