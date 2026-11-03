import type { SVGProps } from "react";

/**
 * Inline SVG icon set. DESIGN §2.5 forbids runtime icon fetching, so the app
 * renders these small components instead of @iconify/react. Only add icons
 * that are actually used somewhere.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}

/** Aegis logo mark (shield carried over the nav circle). */
export function ShieldIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-3.6 8-10V5.2L12 2.5 4 5.2V12c0 6.4 8 10 8 10z" />
      <path d="M12 8.5v3.5" />
      <path d="m12 15.2.01 0" />
    </Svg>
  );
}

/** Tropical cyclone (TC filter + event type). */
export function CycloneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 15a8.5 8.5 0 0 0 17 0" />
      <path d="M20.5 9a8.5 8.5 0 0 0-17 0" />
      <path d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z" />
    </Svg>
  );
}

/** Flood (FL filter + event type). */
export function FloodIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5S6.5 10 6.5 14.5a5.5 5.5 0 0 0 11 0C17.5 10 12 3.5 12 3.5z" />
      <path d="M3 20c1.2 0 1.2 1 2.4 1s1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1 1.2-1 2.4-1 1.2 1 2.4 1" />
    </Svg>
  );
}

/** Wildfire (WF filter + event type). */
export function FlameIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 10.5A2.5 2.5 0 0 0 11.5 8c0-1.38-.5-2.1-1-3-1.07-2.14 2.5-2.5 4.5-4.5.5 2.5 1 3.9 3 5.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  );
}

/** Arrow used for CTAs and link affordances. */
export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Svg>
  );
}

/** Manual retry on an errored data region. */
export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12a9 9 0 0 1 15.5-6.34L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.34L3 16" />
      <path d="M3 21v-5h5" />
    </Svg>
  );
}

/** Scroll cue chevron. */
export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

/** Section eyebrow / feed activity. */
export function ActivityIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  );
}

/** Impact / map section eyebrow. */
export function MapPinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}
