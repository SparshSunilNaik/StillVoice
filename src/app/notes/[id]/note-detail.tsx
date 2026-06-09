"use client";

import Link from "next/link";
import { ArrowLeft, Mic } from "lucide-react";
import { motion } from "motion/react";

import { AppFrame } from "@/components/app-frame";
import { Button } from "@/components/ui/button";
import { useNote } from "@/hooks/use-notes";
import { formatDate, formatDuration, formatTime } from "@/lib/notes";

type NoteDetailProps = {
  noteId: string;
};

export function NoteDetail({ noteId }: NoteDetailProps) {
  const note = useNote(noteId);

  if (note === undefined) {
    return <AppFrame />;
  }

  if (note === null) {
    return (
      <AppFrame>
        <div className="flex min-h-dvh flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-medium tracking-[-0.06em]">Note not found</h1>
          <Button asChild className="mt-8">
            <Link href="/notes">Return to notes</Link>
          </Button>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <header className="flex items-center justify-between">
        <Link href="/notes" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-neutral-500 transition-colors hover:bg-white hover:text-neutral-950">
          <ArrowLeft className="size-4" />
          Notes
        </Link>
        <Button asChild variant="secondary">
          <Link href="/record">
            <Mic className="size-4" />
            New Note
          </Link>
        </Button>
      </header>

      <article className="mx-auto w-full max-w-3xl py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
            <span>{formatDate(note.createdAt)}</span>
            <span className="size-1 rounded-full bg-neutral-300" />
            <span>{formatTime(note.createdAt)}</span>
            <span className="size-1 rounded-full bg-neutral-300" />
            <span>{formatDuration(note.durationSeconds)}</span>
          </div>
          <h1 className="text-balance text-5xl font-medium leading-[1.02] tracking-[-0.07em] text-neutral-950 sm:text-7xl">
            {note.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 whitespace-pre-wrap text-2xl leading-[1.65] tracking-[-0.035em] text-neutral-700 sm:text-3xl"
        >
          {note.transcript}
        </motion.div>
        {note.transcriptionStatus === "failed" && note.transcriptionError ? (
          <p className="mt-10 text-sm leading-7 text-neutral-400">
            Local transcription could not finish, so the original live transcript was kept.
          </p>
        ) : null}
      </article>
    </AppFrame>
  );
}
