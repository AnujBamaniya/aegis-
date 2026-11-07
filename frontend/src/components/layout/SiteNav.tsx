"use client";

import { Suspense, useEffect, useRef, useState, forwardRef } from "react";
import { DataModeBadge } from "@/components/ui/DataModeBadge";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { useHealth } from "@/hooks/useHealth";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/motion/SmoothScroll";

/**
 * Top navigation (nav + hero revamp, DESIGN "Top Navigation Bar"): minimal
 * transparent bar over the hero, thin iron-filings hairline once scrolled,
 * AEGIS MATRIX wordmark left, section links center (JetBrains Mono, small
 * caps), live intelligence status + Demo/Live badge right. Mobile: single
 * menu trigger opening a full-screen overlay with GSAP stagger.
 */
const NAV_LINKS = [
  ["Threats", "#threats"],
  ["Impact", "#impact"],
  ["Briefing", "#briefing"],
  ["Infrastructure", "#infrastructure"],
  ["Pipeline", "#pipeline"],
  ["Access", "#access"],
] as const;

const LINK_BASE =
  "font-mono text-sm uppercase tracking-tighter transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor";

function LiveStatus() {
  const health = useHealth();
  const pending = health.isPending;
  const online = health.data?.status === "online";
  const demo = health.data?.source === "demo";

  const label = pending
    ? "Intel syncing"
    : online
      ? demo
        ? "Intel live · demo feed"
        : "Intel live"
      : "Intel offline";

  return (
    <p
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-drift-ash"
      role="status"
    >
      <span
        aria-hidden="true"
        className={
          pending
            ? "h-1.5 w-1.5 animate-pulse rounded-full bg-white/50"
            : online
              ? "h-1.5 w-1.5 animate-pulse rounded-full bg-lime-surveyor"
              : "h-1.5 w-1.5 rounded-full bg-amber-500"
        }
      />
      <span className={online && !pending ? "text-lime-surveyor" : undefined}>
        {label}
      </span>
    </p>
  );
}

const NavLink = forwardRef<HTMLAnchorElement, {
  href: string;
  label: string;
  children?: React.ReactNode;
  isMobile?: boolean;
  onClick?: () => void;
}>(({ href, label, children, isMobile = false, onClick }, ref) => {
  const { scrollTo } = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href, { duration: 1.4 });
    }
    onClick?.();
  };

  const className = isMobile
    ? "flex items-baseline gap-4 font-sans text-3xl font-light tracking-tighter text-bone-vellum transition-colors hover:text-lime-surveyor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor"
    : `${LINK_BASE} text-drift-ash hover:text-bone-vellum`;

  return (
    <a
      ref={ref}
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children ?? label}
    </a>
  );
});

NavLink.displayName = "NavLink";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const { stop, start } = useLenis();

  // Hairline + glass once the page scrolls (replaces the old pill nav).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Entrance: bar drops in once (0.15s), clearProps leaves no inline residue.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(nav, {
        yPercent: -110,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
        clearProps: "all",
      });
    });
    return () => ctx.revert();
  }, []);

  // Menu overlay: mounted always, visibility controlled by GSAP autoAlpha so
  // it stays out of the tab order when closed and animates open/closed.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    gsap.set(overlay, { autoAlpha: 0 });
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const links = overlay.querySelectorAll("[data-menu-link]");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      stop();
      if (prefersReducedMotion()) {
        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(links, { opacity: 1, y: 0 });
      } else {
        gsap.timeline()
          .to(overlay, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
          .fromTo(
            links,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" },
            0.08,
          );
      }
      firstLinkRef.current?.focus();
    } else {
      start();
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: prefersReducedMotion() ? 0 : 0.25,
        ease: "power2.in",
      });
    }
    return () => {
      document.documentElement.style.overflow = "";
      start();
    };
  }, [open, stop, start]);

  // Escape closes the overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <nav
        ref={navRef}
        aria-label="Primary"
        className={`relative z-10 transition-colors duration-300 ${
          scrolled
            ? "border-b border-iron-filings/70 bg-obsidian-loam/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-4 md:px-6">
          {/* Brand */}
          <NavLink href="#top" label="Aegis Matrix" isMobile={false} />
          
          {/* Section links */}
          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map(([label, href]) => (
              <NavLink key={href} href={href} label={label} isMobile={false} />
            ))}
          </div>

          {/* Right cluster: live intelligence status + data-mode badge */}
          <div className="flex items-center gap-4 md:gap-5">
            <div className="hidden sm:block">
              <Suspense fallback={null}>
                <LiveStatus />
              </Suspense>
            </div>
            <div className="hidden md:block">
              <DataModeBadge />
            </div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="aegis-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 items-center justify-center border border-iron-filings rounded-md text-bone-vellum transition-colors hover:border-lime-surveyor/60 hover:text-lime-surveyor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-surveyor md:hidden"
            >
              {open ? (
                <CloseIcon className="h-4 w-4" />
              ) : (
                <MenuIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        ref={overlayRef}
        id="aegis-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="invisible fixed inset-0 z-40 flex flex-col justify-center bg-obsidian-loam/95 px-8 backdrop-blur-xl"
      >
        <ul className="flex flex-col gap-6">
          {NAV_LINKS.map(([label, href], index) => (
            <li key={href}>
              <NavLink
                ref={index === 0 ? firstLinkRef : undefined}
                data-menu-link
                href={href}
                label={label}
                isMobile={true}
                onClick={() => setOpen(false)}
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[10px] uppercase tracking-widest text-lime-surveyor"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div
          data-menu-link
          className="mt-12 flex flex-col gap-4 border-t border-iron-filings pt-6"
        >
          <Suspense fallback={null}>
            <LiveStatus />
          </Suspense>
          <DataModeBadge noteId="data-mode-note-mobile" />
        </div>
      </div>
    </div>
  );
}
