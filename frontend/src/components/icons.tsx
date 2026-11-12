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

/** Health asset class (hospital, clinic). */
export function HealthIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v6" />
      <path d="M9 12h6" />
    </Svg>
  );
}

/** Emergency response asset class (fire_station, police). */
export function EmergencyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 8a2 2 0 0 0 1 -1.73A20 4 0 0 1 -4 0a2 2 0 0 1 -1 -1.73V8" />
      <path d="M6 8a6 6 0 0 1 12 0" />
      <path d="M6 12v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-9" />
      <path d="M9 12v5" />
      <path d="M15 12v5" />
    </Svg>
  );
}

/** Air & energy asset class (aerodrome, heliport, substation, plant). */
export function AirEnergyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M12 22V12" />
      <path d="M12 12l-4-2" />
      <path d="M12 12l4-2" />
    </Svg>
  );
}

/** Government audience. */
export function GovernmentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12" />
      <path d="M9 12h6" />
    </Svg>
  );
}

/** Institutes & Academia audience. */
export function AcademiaIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 10v10" />
      <path d="M6 12.5V10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.5" />
      <path d="M6 20v-7.5" />
      <path d="M18 20v-7.5" />
      <path d="M4 15h16" />
    </Svg>
  );
}

/** Society & NGOs audience. */
export function SocietyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

/** Chevron up for back to top. */
export function ChevronUpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m18 15-6-6-6 6" />
    </Svg>
  );
}

/** Chevron right for action links. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Svg>
  );
}

/** CPU/bolt for ingestion engine. */
export function CpuBoltIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M6 9h12M6 15h12" />
      <path d="M12 3v3M12 18v3" />
      <path d="M19 12l3-3-3-3" />
    </Svg>
  );
}

/** Shield check for spatial engine. */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-3.6 8-10V5.2L12 2.5 4 5.2V12c0 6.4 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </Svg>
  );
}

/** Shield star for forecast & briefing. */
export function ShieldStarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-3.6 8-10V5.2L12 2.5 4 5.2V12c0 6.4 8 10 8 10z" />
      <path d="M12 8l1.5 3 3.3.5-2.4 2.3.6 3.2L12 15.5 9.1 18.2l.6-3.2L6 11.5l3.3-.5z" />
    </Svg>
  );
}

/** Mobile navigation menu trigger. */
export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Svg>
  );
}

/** Mobile navigation close. */
export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}

/** Map panel: enter expanded (fullscreen) mode. */
export function ExpandIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="m21 3-7 7" />
      <path d="M3 21l7-7" />
    </Svg>
  );
}

/** Map panel: leave expanded (fullscreen) mode. */
export function CollapseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 9h-6V3" />
      <path d="M3 15h6v6" />
      <path d="m15 9 6-6" />
      <path d="M9 15l-6 6" />
    </Svg>
  );
}
