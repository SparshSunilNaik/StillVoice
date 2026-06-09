"use client";

import { getAudioRecording } from "@/lib/audio-store";
import type { VoiceNote } from "@/lib/notes";

const LEGACY_NOTES_KEY = "stillvoice.notes";
const MIGRATION_KEY = "stillvoice.sqlite-migrated";
const EMPTY_NOTES: VoiceNote[] = [];

let notesCache: VoiceNote[] = EMPTY_NOTES;
const noteCache = new Map<string, VoiceNote | null>();
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function isVoiceNote(value: unknown): value is VoiceNote {
  if (!value || typeof value !== "object") return false;
  const note = value as Record<string, unknown>;

  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.transcript === "string" &&
    typeof note.createdAt === "string" &&
    typeof note.updatedAt === "string" &&
    typeof note.durationSeconds === "number"
  );
}

function readLegacyNotes() {
  try {
    const raw = window.localStorage.getItem(LEGACY_NOTES_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isVoiceNote) : [];
  } catch {
    return [];
  }
}

function setNotes(next: VoiceNote[]) {
  notesCache = next;
  next.forEach((note) => noteCache.set(note.id, note));
  emitChange();
}

export function subscribeToNotes(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNotesSnapshot() {
  return notesCache;
}

export function getNotesServerSnapshot() {
  return EMPTY_NOTES;
}

export function getNoteSnapshot(noteId: string) {
  return noteCache.get(noteId);
}

export function getNoteServerSnapshot() {
  return undefined;
}

export async function refreshNotes() {
  try {
    const response = await fetch("/api/notes", { cache: "no-store" });
    if (!response.ok) throw new Error("Unable to load notes");

    const payload = (await response.json()) as { notes?: VoiceNote[] };
    setNotes(payload.notes ?? []);
  } catch {
    setNotes(EMPTY_NOTES);
  }
}

export async function refreshNote(noteId: string) {
  try {
    const response = await fetch(`/api/notes/${noteId}`, { cache: "no-store" });
    if (response.status === 404) {
      noteCache.set(noteId, null);
      emitChange();
      return;
    }

    if (!response.ok) throw new Error("Unable to load note");

    const payload = (await response.json()) as { note?: VoiceNote };
    noteCache.set(noteId, payload.note ?? null);
    if (payload.note) {
      notesCache = [payload.note, ...notesCache.filter((note) => note.id !== noteId)].sort((a, b) => {
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      });
    }
    emitChange();
  } catch {
    noteCache.set(noteId, null);
    emitChange();
  }
}

export async function saveNote(note: VoiceNote) {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  if (!response.ok) throw new Error("Unable to save note");

  const payload = (await response.json()) as { note: VoiceNote };
  setNotes([payload.note, ...notesCache.filter((item) => item.id !== payload.note.id)]);
  return payload.note;
}

export async function updateNote(noteId: string, updates: Partial<VoiceNote>) {
  const persistedUpdates = {
    ...(typeof updates.title === "string" ? { title: updates.title } : {}),
    ...(typeof updates.transcript === "string" ? { transcript: updates.transcript } : {}),
    ...(typeof updates.durationSeconds === "number" ? { durationSeconds: updates.durationSeconds } : {}),
  };

  if (Object.keys(persistedUpdates).length === 0) {
    const existing = noteCache.get(noteId) ?? notesCache.find((note) => note.id === noteId);
    if (!existing) throw new Error("Unable to update note");

    const next = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    noteCache.set(noteId, next);
    setNotes(notesCache.map((note) => (note.id === noteId ? next : note)));
    return next;
  }

  const response = await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(persistedUpdates),
  });

  if (!response.ok) throw new Error("Unable to update note");

  const payload = (await response.json()) as { note: VoiceNote };
  const next = { ...payload.note, ...updates };
  setNotes(notesCache.map((note) => (note.id === noteId ? next : note)));
  noteCache.set(noteId, next);
  emitChange();
  return next;
}

export async function migrateLegacyStorage() {
  if (window.localStorage.getItem(MIGRATION_KEY) === "true") return;

  const legacyNotes = readLegacyNotes();
  if (legacyNotes.length === 0) {
    window.localStorage.setItem(MIGRATION_KEY, "true");
    return;
  }

  for (const note of legacyNotes) {
    await saveNote(note);

    const audio = await getAudioRecording(note.id).catch(() => undefined);
    if (audio) {
      const formData = new FormData();
      formData.append("audio", audio, `stillvoice-${note.id}.webm`);
      formData.append("durationSeconds", String(note.durationSeconds));
      await fetch(`/api/notes/${note.id}/audio`, { method: "POST", body: formData }).catch(() => undefined);
    }
  }

  window.localStorage.setItem(MIGRATION_KEY, "true");
  await refreshNotes();
}
