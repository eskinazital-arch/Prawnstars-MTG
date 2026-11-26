import { cn } from "@/lib/utils";
import { PrawnMarkPaths } from "./PrawnMark";

// Kept under its upstream name so every existing usage (top bar, loading gate,
// design-system pages) shows the Prawnstars logo without further edits.
export function ManaBrewLogo({
  variant = "horizontal",
  height = 56,
  className,
  decorative = false,
}: {
  variant?: "horizontal" | "symbol" | "wordmark";
  height?: number;
  className?: string;
  decorative?: boolean;
}) {
  const label = decorative ? undefined : "Prawnstars MTG";
  if (variant === "symbol") {
    return (
      <svg
        viewBox="0 0 64 64"
        width={height}
        height={height}
        className={cn("h-auto max-w-full", className)}
        role={decorative ? undefined : "img"}
        aria-label={label}
        aria-hidden={decorative || undefined}
        focusable="false"
      >
        <PrawnMarkPaths />
      </svg>
    );
  }
  const withMark = variant === "horizontal";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-2 leading-none", className)}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative || undefined}
      style={{ height }}
    >
      {withMark && (
        <svg
          viewBox="0 0 64 64"
          width={height * 0.82}
          height={height * 0.82}
          aria-hidden="true"
          focusable="false"
        >
          <PrawnMarkPaths />
        </svg>
      )}
      <span
        className="font-serif font-extrabold tracking-[-0.01em] text-foreground"
        style={{ fontSize: height * 0.46 }}
      >
        Prawnstars <span className="text-primary">MTG</span>
      </span>
    </span>
  );
}
