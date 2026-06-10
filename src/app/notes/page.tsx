"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Mic } from "lucide-react";
import { motion } from "motion/react";

import { AppFrame, QuietHeader } from "@/components/app-frame";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";

export default function NotesPage() {
  const [query, setQuery] = useState("");
  const notes = useNotes();

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return notes;

    return notes.filter((note) => {
      return `${note.title} ${note.transcript}`.toLowerCase().includes(normalized);
    });
  }, [notes, query]);

  return (
    <AppFrame>
      <QuietHeader />

      <section className="py-14 sm:py-20">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-medium tracking-[-0.07em] text-neutral-950 transition-colors duration-500 sm:text-7xl dark:text-stone-100"
            >
              Notes
            </motion.h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-500 dark:text-neutral-400">
              A private archive of thoughts captured as they arrived.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/record">
              <Mic className="size-4" />
              Start Speaking
            </Link>
          </Button>
        </div>

        <div className="relative mt-10 max-w-xl">
          <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes"
            className="pl-12"
            aria-label="Search notes"
          />
        </div>
      </section>

      {filteredNotes.length > 0 ? (
        <section className="grid gap-4 pb-12 md:grid-cols-2">
          {filteredNotes.map((note, index) => (
            <NoteCard key={note.id} note={note} index={index} />
          ))}
        </section>
      ) : (
        <section className="flex flex-1 items-center justify-center pb-20">
          <div className="max-w-md rounded-[2rem] border border-dashed border-neutral-200 bg-white/50 p-8 text-center shadow-sm shadow-neutral-950/[0.02] transition-colors duration-500 sm:p-10 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-black/20">
            <h2 className="text-xl font-medium tracking-[-0.03em] text-neutral-900 dark:text-stone-100">
              {notes.length === 0 ? "No notes yet" : "No matches"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-neutral-500 dark:text-neutral-400">
              {notes.length === 0
                ? "Start with one quiet recording. The archive will build naturally from there."
                : "Try a different word or phrase from the note you remember."}
            </p>
          </div>
        </section>
      )}
    </AppFrame>
  );
}
