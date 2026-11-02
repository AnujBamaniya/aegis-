import { DataModeBadge } from "@/components/ui/DataModeBadge";
import { ShieldIcon } from "@/components/icons";

/**
 * Fixed pill nav (DESIGN 8.1), part of the §7.2 hero sequence at 0.5s.
 * Server component: anchor links plus the Demo/Live badge need no state.
 */
const NAV_LINKS = [
  ["Live Map", "#live-map"],
  ["Threats", "#threats"],
  ["Infrastructure", "#infrastructure"],
  ["Pipeline", "#pipeline"],
  ["Impact", "#impact"],
  ["Access", "#access"],
] as const;

export function SiteNav() {
  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 opacity-0 animate-slide-up [animation-delay:0.5s] md:top-6">
      <nav
        aria-label="Primary"
        className="glass flex w-full max-w-4xl items-center justify-between rounded-full py-2 pl-2 pr-4 shadow-2xl transition-all duration-300 md:pr-6"
      >
        <a
          href="#top"
          className="flex items-center gap-3 pl-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black">
            <ShieldIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-bricolage text-lg font-medium tracking-tight text-white">
            AEGIS MATRIX
          </span>
        </a>
        <div className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="flex max-w-[9rem] items-center sm:max-w-none">
          <DataModeBadge />
        </div>
      </nav>
    </div>
  );
}
