"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pause, Square, Mic, Play, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { saveAudioRecording } from "@/lib/audio-store";
import { createNote, formatDuration, saveNote } from "@/lib/notes";
import { refineNoteTranscript } from "@/lib/transcribe-note";

export default function RecordingPage() {
  const router = useRouter();
  const recognition = useSpeechRecognition();
  const audioRecorder = useAudioRecorder();

  const handleStart = async () => {
    await audioRecorder.start();
    recognition.start();
  };

  const handlePause = () => {
    audioRecorder.pause();
    recognition.pause();
  };

  const handleResume = () => {
    audioRecorder.resume();
    recognition.resume();
  };

  const handleStop = async () => {
    recognition.stop();
    const audio = await audioRecorder.stop();

    if (!recognition.transcript.trim() && !audio) {
      router.push("/");
      return;
    }

    const note = createNote(recognition.transcript, recognition.elapsedSeconds);
    saveNote(note);
    router.push(`/notes/${note.id}`);

    if (audio && audio.size > 0) {
      void saveAudioRecording(note.id, audio);
      void refineNoteTranscript(note.id, audio);
    }
  };

  return (
    <main className="min-h-dvh overflow-hidden bg-neutral-950 text-stone-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.12),rgba(10,10,10,0)_38%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-sm">
          <Link href="/" className="rounded-full px-4 py-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white">
            <X className="size-4" />
          </Link>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-neutral-300">
            {recognition.status === "idle" ? "Ready" : recognition.status === "unsupported" ? "Unsupported" : formatDuration(recognition.elapsedSeconds)}
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-8">
          <motion.button
            type="button"
            onClick={recognition.status === "idle" || recognition.status === "stopped" ? handleStart : undefined}
            className="relative mb-14 flex size-36 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_120px_rgba(255,255,255,0.08)] outline-none transition-transform duration-300 hover:scale-[1.02] sm:size-44"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Start recording"
          >
            {recognition.isListening ? (
              <motion.span
                className="absolute inset-0 rounded-full border border-white/20"
                animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <Mic className="size-12 text-white sm:size-14" strokeWidth={1.4} />
          </motion.button>

          <div className="min-h-[34vh] w-full max-w-3xl text-center">
            <AnimatePresence mode="wait">
              {recognition.transcript ? (
                <motion.p
                  key="transcript"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="whitespace-pre-wrap text-balance text-3xl font-medium leading-[1.18] tracking-[-0.05em] text-stone-100 sm:text-5xl"
                >
                  {recognition.transcript}
                </motion.p>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto max-w-xl space-y-5"
                >
                  <p className="text-3xl font-medium tracking-[-0.05em] text-stone-100 sm:text-5xl">Speak freely.</p>
                  <p className="text-base leading-8 text-neutral-500">
                    Your words appear here in real time and stay on this device only.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <footer className="pb-5">
          {recognition.error ? (
            <p className="mb-4 text-center text-sm text-neutral-400">{recognition.error}</p>
          ) : audioRecorder.error ? (
            <p className="mb-4 text-center text-sm text-neutral-400">{audioRecorder.error}</p>
          ) : null}
          {recognition.status === "unsupported" ? (
            <p className="mx-auto max-w-md text-center text-sm leading-7 text-neutral-400">
              Speech recognition is not available in this browser. Try Chrome or Safari for the full StillVoice experience.
            </p>
          ) : (
            <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] p-2">
              {recognition.isListening ? (
                <Button type="button" variant="ghost" size="icon" className="text-neutral-300 hover:bg-white/10 hover:text-white" onClick={handlePause}>
                  <Pause className="size-4" />
                </Button>
              ) : (
                <Button type="button" variant="ghost" size="icon" className="text-neutral-300 hover:bg-white/10 hover:text-white" onClick={recognition.status === "paused" ? handleResume : handleStart}>
                  <Play className="size-4" />
                </Button>
              )}
              <Button type="button" className="flex-1 bg-stone-50 text-neutral-950 hover:bg-white" onClick={handleStop} disabled={recognition.status === "idle"}>
                <Square className="size-3.5 fill-current" />
                Save Note
              </Button>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
}
