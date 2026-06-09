"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDuration, formatTime, getPreview, type VoiceNote } from "@/lib/notes";

type NoteCardProps = {
  note: VoiceNote;
  index?: number;
};

export function NoteCard({ note, index = 0 }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/notes/${note.id}`}>
        <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:bg-white hover:shadow-[0_24px_80px_rgba(24,24,27,0.09)]">
          <CardContent className="space-y-5 p-6 sm:p-7">
            <div className="flex items-start justify-between gap-6">
              <h3 className="line-clamp-2 text-lg font-medium leading-snug tracking-[-0.025em] text-neutral-950">
                {note.title}
              </h3>
              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                {formatDuration(note.durationSeconds)}
              </span>
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-neutral-500">{getPreview(note.transcript)}</p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>{formatDate(note.createdAt)}</span>
              <span className="size-1 rounded-full bg-neutral-300" />
              <span>{formatTime(note.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
