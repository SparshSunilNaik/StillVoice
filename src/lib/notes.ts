export type VoiceNote = {
  id: string;
  title: string;
  transcript: string;
  roughTranscript?: string;
  finalTranscript?: string;
  transcriptionStatus?: "rough" | "processing" | "complete" | "failed";
  transcriptionError?: string;
  createdAt: string;
  updatedAt: string;
  durationSeconds: number;
};

const STORAGE_KEY = "stillvoice.notes";
let cachedRaw: string | null = null;
let cachedNotes: VoiceNote[] = [];

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

export function getNotes(): VoiceNote[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      if (cachedRaw === null) return cachedNotes;
      cachedRaw = null;
      cachedNotes = [];
      return cachedNotes;
    }
    if (raw === cachedRaw) return cachedNotes;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    cachedRaw = raw;
    cachedNotes = parsed.filter(isVoiceNote).sort((a, b) => {
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return cachedNotes;
  } catch {
    return [];
  }
}

export function getNote(id: string): VoiceNote | undefined {
  return getNotes().find((note) => note.id === id);
}

export function saveNote(note: VoiceNote) {
  const notes = getNotes();
  const next = [note, ...notes.filter((item) => item.id !== note.id)];
  writeNotes(next);
}

export function updateNote(id: string, updates: Partial<VoiceNote>) {
  const notes = getNotes();
  const next = notes.map((note) => {
    if (note.id !== id) return note;

    return {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  });

  writeNotes(next);
}

function writeNotes(next: VoiceNote[]) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedNotes = next;
  window.localStorage.setItem(STORAGE_KEY, raw);
  window.dispatchEvent(new Event("stillvoice-notes-change"));
}

export function createNote(transcript: string, durationSeconds: number): VoiceNote {
  const now = new Date().toISOString();
  const title = createNoteTitle(transcript);

  return {
    id: crypto.randomUUID(),
    title,
    transcript: transcript.trim(),
    roughTranscript: transcript.trim(),
    transcriptionStatus: "rough",
    createdAt: now,
    updatedAt: now,
    durationSeconds,
  };
}

export function createNoteTitle(transcript: string) {
  const firstLine = transcript.trim().split(/\n|\./)[0]?.trim();
  return firstLine ? firstLine.slice(0, 72) : "Untitled thought";
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function getPreview(text: string, maxLength = 160) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).trim()}...`;
}
