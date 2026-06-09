import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { NextResponse } from "next/server";

import { WHISPER_MODEL, WHISPER_PYTHON_PATH } from "@/lib/whisper-config";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

export async function POST(request: Request) {
  let directory: string | undefined;

  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }

    directory = await mkdtemp(path.join(tmpdir(), "stillvoice-"));
    const inputPath = path.join(directory, audio.name || "recording.webm");
    const scriptPath = path.join("scripts", "transcribe.py");
    const buffer = Buffer.from(await audio.arrayBuffer());

    await writeFile(inputPath, buffer);

    const { stdout } = await execFileAsync(WHISPER_PYTHON_PATH, [scriptPath, inputPath], {
      env: {
        ...process.env,
        STILLVOICE_WHISPER_MODEL: WHISPER_MODEL,
      },
      maxBuffer: 1024 * 1024 * 10,
      timeout: 1000 * 60 * 15,
    });

    const parsed = JSON.parse(stdout) as { transcript?: unknown; error?: unknown };

    if (typeof parsed.error === "string") {
      return NextResponse.json({ error: parsed.error }, { status: 500 });
    }

    const transcript = typeof parsed.transcript === "string" ? parsed.transcript.trim() : "";

    return NextResponse.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (directory) {
      await rm(directory, { force: true, recursive: true });
    }
  }
}
