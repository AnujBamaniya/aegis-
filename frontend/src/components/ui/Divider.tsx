import type { ReactNode } from "react";

/**
 * Divider band (DESIGN 5.1 / 6.7): `py-12`, hairline glow centered at 3/4
 * width, optional padded content slot below the line. z-20 per the z-index map.
 */
export function Divider({ children }: { children?: ReactNode }) {
  return (
    <div className="z-20 w-full py-12">
      <div
        aria-hidden="true"
        className="mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-iron-filings to-transparent"
      />
      {children ? (
        <div className="mx-auto w-full max-w-7xl px-6 pt-8 md:px-12">
          {children}
        </div>
      ) : null}
    </div>
  );
}
