import type { AudioRecording, Note } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import type { VoiceNote } from "@/lib/notes";

type NoteInput = {
  id?: string;
  title: string;
  transcript: string;
  durationSeconds: number;
  createdAt?: string;
  updatedAt?: string;
};

type NoteWithAudio = Note & { audioRecording?: AudioRecording | null };

function toVoiceNote(note: NoteWithAudio): VoiceNote {
  return {
    id: note.id,
    title: note.title,
    transcript: note.transcript,
    audioRecording: note.audioRecording
      ? {
          id: note.audioRecording.id,
          noteId: note.audioRecording.noteId,
          audioPath: note.audioRecording.audioPath,
          mimeType: note.audioRecording.mimeType,
          fileSize: note.audioRecording.fileSize,
          durationSeconds: note.audioRecording.durationSeconds,
          createdAt: note.audioRecording.createdAt.toISOString(),
        }
      : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    durationSeconds: note.durationSeconds,
  };
}

export async function listNotes() {
  const notes = await prisma.note.findMany({ include: { audioRecording: true }, orderBy: { createdAt: "desc" } });
  return notes.map(toVoiceNote);
}

export async function findNote(id: string) {
  const note = await prisma.note.findUnique({ where: { id }, include: { audioRecording: true } });
  return note ? toVoiceNote(note) : null;
}

export async function createNoteRecord(input: NoteInput) {
  const data = {
    title: input.title,
    transcript: input.transcript,
    durationSeconds: input.durationSeconds,
    ...(input.createdAt ? { createdAt: new Date(input.createdAt) } : {}),
    ...(input.updatedAt ? { updatedAt: new Date(input.updatedAt) } : {}),
  };

  const note = input.id
    ? await prisma.note.upsert({
        where: { id: input.id },
        create: { id: input.id, ...data },
        update: data,
      })
    : await prisma.note.create({ data });

  return toVoiceNote(note);
}

export async function updateNoteRecord(id: string, input: Partial<Pick<VoiceNote, "title" | "transcript" | "durationSeconds">>) {
  const note = await prisma.note.update({
    where: { id },
    data: input,
  });

  return toVoiceNote(note);
}

export async function deleteNoteRecord(id: string) {
  await prisma.note.delete({ where: { id } });
}
