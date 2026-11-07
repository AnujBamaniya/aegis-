/**
 * Suspense fallback for the data-board region (loading state skeleton).
 * Flat hairline panels with the shared shimmer sweep.
 */
export function BoardSkeleton() {
  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-[90rem] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="relative min-h-120 overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40 md:col-span-8">
            <div aria-hidden="true" className="flex flex-col gap-4 p-8">
              <div className="h-4 w-24 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
              <div className="h-7 w-2/3 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
              <div className="h-4 w-1/2 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent"
            />
          </div>
          <div className="flex flex-col gap-6 md:col-span-4">
            {[0, 1].map((index) => (
              <div
                key={index}
                className="relative min-h-57 overflow-hidden border border-iron-filings/70 bg-obsidian-loam/40"
              >
                <div aria-hidden="true" className="flex flex-col gap-4 p-8">
                  <div className="h-4 w-24 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
                  <div className="h-7 w-2/3 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
                  <div className="h-4 w-1/2 animate-pulse rounded-[3.6px] bg-bone-vellum/5" />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute inset-0 z-0 -translate-x-full animate-shimmer-effect bg-gradient-to-r from-transparent via-bone-vellum/5 to-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
