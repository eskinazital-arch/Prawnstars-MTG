import { cn } from "@/lib/utils";
import { ClubMarkPaths } from "./ClubMark";

// Kept under its upstream name so every existing usage (top bar, loading gate,
// design-system pages) shows The Cock Magic Club without further edits.
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
  const label = decorative ? undefined : "The Cock Magic Club";
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
        <ClubMarkPaths />
      </svg>
    );
  }
  const withMark = variant === "horizontal";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-2.5 leading-none", className)}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative || undefined}
      style={{ height }}
    >
      {withMark && (
        <svg
          viewBox="0 0 64 64"
          width={height * 0.8}
          height={height * 0.8}
          aria-hidden="true"
          focusable="false"
        >
          <ClubMarkPaths />
        </svg>
      )}
      <span
        className="font-sans font-medium tracking-[-0.02em] text-current"
        style={{ fontSize: height * 0.38 }}
      >
        The Cock Magic Club
      </span>
    </span>
  );
}
