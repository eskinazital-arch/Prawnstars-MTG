// The Cock Magic Club mark: a gold rooster on a club-green tile, red comb and
// wattle, a three-feather tail. Flat colour only, so it reads at favicon size.
// public/favicon.svg carries the same drawing; keep the two in step.
import { BRAND_COLORS } from "@/themes/brand";

const { green, gold, red } = BRAND_COLORS.club;
const LIGHT_GOLD = "#F8D97A";
const INK = "#191919";

export function ClubMarkPaths({ tile = true }: { tile?: boolean }) {
  return (
    <>
      {tile && <rect x="2" y="2" width="60" height="60" rx="16" fill={green} />}
      {/* tail feathers */}
      <path d="M24 40C12 36 8 24 12 10C18 20 24 28 29 35Z" fill={LIGHT_GOLD} />
      <path d="M27 37C19 27 19 15 25 5C28 17 30 25 32 33Z" fill={red} />
      <path d="M30 36C27 26 30 16 37 10C36 20 36 28 35 34Z" fill={LIGHT_GOLD} />
      {/* legs */}
      <path
        d="M30 48V56M27 56H32M37 48V56M34 56H39"
        stroke={gold}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* body and head */}
      <path
        d="M22 44C21 34 27 29 35 30C37 24 40 19 45 19C49 19 51 22 51 25L56 27.5L51 29.5C51 33 48 36 46 38C46 44 41 49 34 49H28C24 49 22 47 22 44Z"
        fill={gold}
      />
      {/* wing */}
      <path d="M28 40C31 36 37 36 41 39C37 43 32 44 28 40Z" fill={LIGHT_GOLD} />
      {/* comb and wattle */}
      <path
        d="M42 19C41 14 44.5 12.5 46 15.5C47 11.5 50.5 11.5 50.5 15.5C52.5 13.5 55 15.5 52.5 19Z"
        fill={red}
      />
      <ellipse cx="51" cy="31" rx="2" ry="3" fill={red} />
      {/* eye */}
      <circle cx="47" cy="22.5" r="1.7" fill={INK} />
    </>
  );
}

export function ClubMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ClubMarkPaths />
    </svg>
  );
}
