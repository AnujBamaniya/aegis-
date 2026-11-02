"use client";

import { useSearchParams } from "next/navigation";
import { mockCaseSchema, type MockCase } from "@/lib/schema";

/**
 * Reads the `?case=` scenario switch (mock mode) with a safe fallback.
 * `mockCaseSchema.catch()` runs through the same Zod schema as the data layer.
 */
export function useMockCase(): MockCase {
  const searchParams = useSearchParams();
  return mockCaseSchema
    .catch("ok")
    .parse(searchParams.get("case") ?? "ok");
}
