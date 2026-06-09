import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/server/prisma";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const AUDIO_DIRECTORY = path.join(DATA_DIRECTORY, "audio");

function getAudioExtension(mimeType: string) {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg")) return "mp3";
  return "webm";
}

function safeFileName(noteId: string, mimeType: string) {
  return `note_${noteId.replace(/[^a-zA-Z0-9_-]/g, "_")}.${getAudioExtension(mimeType)}`;
}

export async function saveAudioRecord(input: {
  noteId: string;
  audio: Buffer;
  mimeType: string;
  durationSeconds: number;
}) {
  await mkdir(AUDIO_DIRECTORY, { recursive: true });

  const existing = await prisma.audioRecording.findUnique({ where: { noteId: input.noteId } });
  if (existing) await deleteAudioFile(existing.audioPath);

  const fileName = safeFileName(input.noteId, input.mimeType);
  const absolutePath = path.join(AUDIO_DIRECTORY, fileName);
  const audioPath = path.join("data", "audio", fileName);

  await writeFile(absolutePath, input.audio);

  return prisma.audioRecording.upsert({
    where: { noteId: input.noteId },
    create: {
      noteId: input.noteId,
      audioPath,
      mimeType: input.mimeType,
      fileSize: input.audio.byteLength,
      durationSeconds: input.durationSeconds,
    },
    update: {
      audioPath,
      mimeType: input.mimeType,
      fileSize: input.audio.byteLength,
      durationSeconds: input.durationSeconds,
    },
  });
}

export async function findAudioRecord(noteId: string) {
  return prisma.audioRecording.findUnique({ where: { noteId } });
}

export async function deleteAudioForNote(noteId: string) {
  const recording = await findAudioRecord(noteId);
  if (!recording) return;

  await deleteAudioFile(recording.audioPath);
  await prisma.audioRecording.delete({ where: { noteId } });
}

export async function deleteAudioFile(audioPath: string) {
  const absolutePath = path.resolve(process.cwd(), audioPath);
  await unlink(absolutePath).catch(() => undefined);
}
