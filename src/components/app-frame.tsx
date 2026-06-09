import Link from "next/link";

import { cn } from "@/lib/utils";

type AppFrameProps = {
  children?: React.ReactNode;
  className?: string;
};

export function AppFrame({ children, className }: AppFrameProps) {
  return (
    <main className={cn("min-h-dvh bg-stone-50 text-neutral-950", className)}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(250,250,249,0)_42%)]" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        {children}
      </div>
    </main>
  );
}

export function QuietHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-sm font-semibold tracking-[-0.02em] text-neutral-950">
        StillVoice
      </Link>
      <Link href="/notes" className="rounded-full px-4 py-2 text-sm text-neutral-500 transition-colors hover:bg-white hover:text-neutral-950">
        Notes
      </Link>
    </header>
  );
}
