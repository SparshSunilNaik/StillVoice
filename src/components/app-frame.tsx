import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type AppFrameProps = {
  children?: React.ReactNode;
  className?: string;
};

export function AppFrame({ children, className }: AppFrameProps) {
  return (
    <main className={cn("min-h-dvh bg-stone-50 text-neutral-950 transition-colors duration-500 dark:bg-[#11100e] dark:text-stone-100", className)}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(250,250,249,0)_42%)] transition-opacity duration-500 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.055),rgba(17,16,14,0)_46%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(23,23,23,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(23,23,23,0.18)_1px,transparent_1px)] [background-size:72px_72px] dark:opacity-[0.045] dark:[background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-10">
        {children}
      </div>
    </main>
  );
}

export function QuietHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="group inline-flex items-center gap-3 rounded-full py-1 pr-3 text-sm font-semibold tracking-[-0.02em] text-neutral-950 transition-colors duration-300 dark:text-stone-100">
        <span className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-neutral-200/80 bg-white/70 shadow-sm shadow-neutral-950/[0.04] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-neutral-300 group-hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:shadow-black/30 dark:group-hover:border-white/20 dark:group-hover:bg-white/[0.08]">
          <Image src="/stillvoice-logo.png" alt="" width={28} height={28} className="size-7 object-cover" />
        </span>
        <span>StillVoice</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/notes" className="rounded-full px-4 py-2 text-sm text-neutral-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/80 hover:text-neutral-950 hover:shadow-sm hover:shadow-neutral-950/[0.03] dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-100 dark:hover:shadow-black/20">
          Notes
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
