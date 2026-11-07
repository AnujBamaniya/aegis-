/**
 * Blueprint grid lines (P2): fixed vertical hairlines, z-[5] (under nav z-50,
 * under grain z-[9999]), pointer-events-none. Below md only the outer two
 * lines show.
 */
export function BlueprintGrid() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
      <div className="mx-auto flex h-full max-w-7xl justify-between px-6">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full w-px bg-bone-vellum/[0.06] ${
              index === 1 || index === 2 || index === 3 ? "hidden md:block" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
