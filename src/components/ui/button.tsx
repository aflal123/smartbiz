import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-black text-white dark:bg-white dark:text-black shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98]",
        destructive: "bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs hover:bg-rose-600 dark:hover:bg-rose-400 active:scale-[0.98]",
        outline: "border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300",
        ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white active:bg-slate-200",
        link: "text-slate-900 dark:text-white underline-offset-4 hover:underline",
        success: "bg-black dark:bg-white text-white dark:text-black shadow-xs hover:bg-emerald-600 dark:hover:bg-emerald-400 active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-xl px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
