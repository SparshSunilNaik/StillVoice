"use client";

import { useSyncExternalStore } from "react";

import { getNote, getNotes, type VoiceNote } from "@/lib/notes";

const EMPTY_NOTES: VoiceNote[] = [];

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("focus", onStoreChange);
  window.addEventListener("stillvoice-notes-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
    window.removeEventListener("stillvoice-notes-change", onStoreChange);
  };
}

function getServerSnapshot(): VoiceNote[] {
  return EMPTY_NOTES;
}

export function useNotes() {
  return useSyncExternalStore(subscribe, getNotes, getServerSnapshot);
}

export function useNote(noteId: string) {
  return useSyncExternalStore(
    subscribe,
    () => getNote(noteId) ?? null,
    () => null,
  );
}
