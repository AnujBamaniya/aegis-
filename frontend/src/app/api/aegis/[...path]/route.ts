const DEFAULT_BASE = "http://127.0.0.1:8000";

/**
 * The only network path to the Aegis API (avoids CORS and mixed content).
 * Forwards GET /api/aegis/<path>?<query> to server-side env AEGIS_API_URL.
 * Reads env + request URL per call, so it is uncached by default and stays
 * compatible with next.config.cacheComponents (no route segment config).
 * 404 is passed through untouched so callers can map it to the EMPTY state;
 * transport failures become 502.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const base = process.env.AEGIS_API_URL ?? DEFAULT_BASE;
  const target = new URL(base);
  target.pathname = `${target.pathname.replace(/\/$/, "")}/${path.join("/")}`;
  target.search = new URL(request.url).search;

  try {
    const upstream = await fetch(target, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { message: "Aegis upstream unavailable" },
      { status: 502 },
    );
  }
}
