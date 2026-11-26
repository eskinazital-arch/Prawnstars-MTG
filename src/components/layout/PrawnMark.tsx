// The Prawnstars mark: a curled prawn built from five bright shell segments,
// a fanned tail, antennae, and a star for an eye. Flat colour only, so it
// reads at favicon size and on the pink rail's plum tile alike.
// public/favicon.svg carries the same drawing; keep the two in step.

const SEGMENTS = [
  { d: "M35.8 16A17 17 0 0 0 22.6 16.7", color: "#FF5A7E" },
  { d: "M21.5 17.3A17 17 0 0 0 13.5 27.9", color: "#FF8A5C" },
  { d: "M13.3 29.1A17 17 0 0 0 16.3 42", color: "#9B74FF" },
  { d: "M17 42.9A17 17 0 0 0 28.8 49", color: "#16C7B7" },
  { d: "M30 49A17 17 0 0 0 40 45.8", color: "#FF5A7E" },
];

const LEGS = ["M18.7 30L22.6 30.7", "M19.6 36.9L23.2 35.2", "M24.3 42L26.3 38.5"];

const TAIL = [
  { angle: -25, color: "#9B74FF" },
  { angle: -65, color: "#16C7B7" },
  { angle: -105, color: "#9B74FF" },
];

export function PrawnMarkPaths() {
  return (
    <>
      {/* antennae */}
      <path
        d="M40 12C46 6 53 4 60 5"
        fill="none"
        stroke="#16C7B7"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M42 15C48 11 54 10 60 12"
        fill="none"
        stroke="#9B74FF"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* shell segments */}
      {SEGMENTS.map((segment) => (
        <path
          key={segment.d}
          d={segment.d}
          fill="none"
          stroke={segment.color}
          strokeWidth="11"
          strokeLinecap="butt"
        />
      ))}
      {/* legs on the inner curve */}
      {LEGS.map((d) => (
        <path key={d} d={d} fill="none" stroke="#FF8FA8" strokeWidth="2.2" strokeLinecap="round" />
      ))}
      {/* tail fan: three lobes pivoting from the last segment */}
      {TAIL.map((lobe) => (
        <ellipse
          key={lobe.angle}
          cx="41"
          cy="52"
          rx="3"
          ry="6.5"
          fill={lobe.color}
          transform={`rotate(${lobe.angle} 41 46)`}
        />
      ))}
      {/* head */}
      <circle cx="38.6" cy="16.6" r="8" fill="#FF5A7E" />
      {/* star eye */}
      <path
        d="M40.4 11.6l1.1 2.3 2.5.4-1.8 1.8.4 2.5-2.2-1.2-2.2 1.2.4-2.5-1.8-1.8 2.5-.4z"
        fill="#FFF6EC"
      />
    </>
  );
}

export function PrawnMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <PrawnMarkPaths />
    </svg>
  );
}
