import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-full border border-neutral-200 bg-white/80 px-5 text-sm text-neutral-950 shadow-sm shadow-neutral-950/[0.02] outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-950/[0.04] dark:border-white/10 dark:bg-white/[0.055] dark:text-stone-100 dark:shadow-black/20 dark:placeholder:text-neutral-500 dark:focus:border-white/20 dark:focus:bg-white/[0.08] dark:focus:ring-white/[0.06]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
