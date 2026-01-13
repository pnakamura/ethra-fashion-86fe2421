import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-[hsl(42_85%_55%_/_0.25)] dark:bg-background/50 dark:shadow-[0_0_8px_hsl(42_85%_55%_/_0.06)]",
        "dark:focus-visible:border-[hsl(42_85%_55%_/_0.5)] dark:focus-visible:ring-[hsl(42_85%_55%_/_0.3)] dark:focus-visible:shadow-[0_0_18px_hsl(42_85%_55%_/_0.2)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
