"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Mic } from "lucide-react";
import { motion } from "motion/react";

import { AppFrame, QuietHeader } from "@/components/app-frame";
import { NoteCard } from "@/components/note-card";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Home() {
  const notes = useNotes().slice(0, 3);
  const greeting = useSyncExternalStore(
    () => () => undefined,
    getGreeting,
    () => "Good Morning",
  );

  return (
    <AppFrame>
      <QuietHeader />

      <section className="flex flex-1 flex-col items-center justify-center py-20 text-center sm:py-28">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 text-sm font-medium tracking-[0.18em] text-neutral-400 uppercase"
        >
          {greeting}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-balance text-5xl font-medium leading-[0.96] tracking-[-0.07em] text-neutral-950 sm:text-7xl lg:text-8xl"
        >
          What are you thinking about today?
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <Button asChild size="lg" className="h-16 px-9 text-base">
            <Link href="/record">
              <Mic className="size-4" />
              Start Speaking
            </Link>
          </Button>
        </motion.div>
      </section>

      <section className="pb-8 sm:pb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-[0.16em] text-neutral-400 uppercase">Recent Notes</h2>
          {notes.length > 0 ? (
            <Link href="/notes" className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-950">
              View all <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        {notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {notes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-neutral-200 bg-white/45 p-10 text-center text-sm leading-7 text-neutral-400">
            Your saved thoughts will appear here, quiet and ready when you need them.
          </div>
        )}
      </section>
    </AppFrame>
  );
}
