/**
 * Shared section header (Inversa revamp). One editorial recipe for every
 * section: a surveyor index + hairline + mono lime eyebrow, then a large
 * light-weight Inter headline whose accent word drops to drift-ash. No
 * colored hairline bars, no centered text. Static markup is rendered on the
 * server; reveal motion is applied globally by components/motion/
 * SectionMotion.tsx via the data-gsap attributes.
 */
export function SectionHeader({
  index,
  eyebrow,
  title,
  accent,
  description,
  className = "",
}: {
  /** Two-digit surveyor index, e.g. "01". */
  index: string;
  eyebrow: string;
  title: string;
  /** Word that renders in drift-ash (defaults to the last word of `title`). */
  accent?: string;
  description?: string;
  className?: string;
}) {
  const accentWord = accent ?? title.split(" ").slice(-1)[0];
  const headWords = title.split(" ");
  const headMain = headWords.slice(0, -1).join(" ");

  return (
    <div
      data-gsap="reveal"
      className={`relative min-w-0 lg:max-w-xl ${className}`}
    >
      <p className="mb-5 flex items-center gap-3" data-gsap="mono">
        <span
          aria-hidden="true"
          className="font-mono text-[11px] tracking-[0.2em] text-lime-surveyor"
        >
          {index}
        </span>
        <span
          aria-hidden="true"
          className="h-px w-8 bg-iron-filings"
        />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-drift-ash">
          {eyebrow}
        </span>
      </p>
      <h2
        data-gsap="lines"
        className="text-3xl font-light leading-[1.05] tracking-[-0.03em] text-bone-vellum sm:text-5xl md:text-6xl"
      >
        {headMain.length > 0 ? <>{headMain} </> : null}
        <span className="text-drift-ash">{accentWord}</span>
      </h2>
      {description ? (
        <p data-gsap="words" className="mt-4 max-w-lg text-body font-light text-drift-ash">
          {description}
        </p>
      ) : null}
    </div>
  );
}
