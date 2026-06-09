import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-full border border-neutral-200 bg-white/80 px-5 text-sm text-neutral-950 shadow-sm shadow-neutral-950/[0.02] outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:ring-4 focus:ring-neutral-950/[0.04]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
