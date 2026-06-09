import { createNoteTitle, updateNote } from "@/lib/notes";

export async function refineNoteTranscript(noteId: string, audio: Blob) {
  updateNote(noteId, { transcriptionStatus: "processing", transcriptionError: undefined });

  const formData = new FormData();
  formData.append("audio", audio, `stillvoice-${noteId}.webm`);

  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Faster-Whisper transcription failed");
    }

    const result = (await response.json()) as { transcript?: unknown };
    const transcript = typeof result.transcript === "string" ? result.transcript.trim() : "";

    if (!transcript) throw new Error("Faster-Whisper returned an empty transcript");

    updateNote(noteId, {
      title: createNoteTitle(transcript),
      transcript,
      finalTranscript: transcript,
      transcriptionStatus: "complete",
      transcriptionError: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Faster-Whisper transcription failed";
    updateNote(noteId, {
      transcriptionStatus: "failed",
      transcriptionError: message,
    });
    window.dispatchEvent(new CustomEvent("stillvoice-transcription-error", { detail: message }));
  }
}
