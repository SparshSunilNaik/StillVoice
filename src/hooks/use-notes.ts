"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  getNoteServerSnapshot,
  getNoteSnapshot,
  getNotesServerSnapshot,
  getNotesSnapshot,
  migrateLegacyStorage,
  refreshNote,
  refreshNotes,
  subscribeToNotes,
} from "@/lib/note-client";

export function useNotes() {
  useEffect(() => {
    void migrateLegacyStorage().finally(refreshNotes);
  }, []);

  return useSyncExternalStore(subscribeToNotes, getNotesSnapshot, getNotesServerSnapshot);
}

export function useNote(noteId: string) {
  useEffect(() => {
    void migrateLegacyStorage().finally(() => refreshNote(noteId));
  }, [noteId]);

  return useSyncExternalStore(subscribeToNotes, () => getNoteSnapshot(noteId), getNoteServerSnapshot);
}
