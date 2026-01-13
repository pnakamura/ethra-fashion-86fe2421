import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:shadow-[0_0_8px_hsl(42_85%_55%_/_0.2)]",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:border-[hsl(42_85%_55%_/_0.15)]",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border dark:border-[hsl(42_85%_55%_/_0.3)] dark:shadow-[0_0_6px_hsl(42_85%_55%_/_0.1)]",
        success: "border-transparent bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400 dark:border dark:border-green-500/30",
        warning: "border-transparent bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 dark:border dark:border-amber-500/30",
        info: "border-transparent bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 dark:border dark:border-blue-500/30",
        premium: "border-[hsl(42_85%_55%_/_0.25)] bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary dark:shadow-[0_0_10px_hsl(42_85%_55%_/_0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
