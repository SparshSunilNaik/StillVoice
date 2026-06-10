import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-[-0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:focus-visible:ring-white/20",
  {
    variants: {
      variant: {
        default: "bg-neutral-950 text-stone-50 shadow-[0_18px_45px_rgba(10,10,10,0.18)] hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-stone-100 dark:text-neutral-950 dark:shadow-[0_18px_55px_rgba(0,0,0,0.38)] dark:hover:bg-white",
        secondary: "border border-neutral-200 bg-white/70 text-neutral-900 shadow-sm shadow-neutral-950/[0.025] hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-stone-100 dark:shadow-black/25 dark:hover:border-white/20 dark:hover:bg-white/[0.09]",
        ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.07] dark:hover:text-stone-100",
      },
      size: {
        default: "h-11 px-5",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
