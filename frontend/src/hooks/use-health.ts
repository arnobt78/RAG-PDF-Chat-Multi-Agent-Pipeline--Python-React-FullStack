/**
 * useHealth Hook
 *
 * Periodically polls the backend /health endpoint and exposes
 * the connection status so the UI can show a live indicator.
 */

import * as React from "react";
import { API_BASE_URL } from "@/lib/constants";

export type HealthStatus = "connected" | "disconnected" | "checking";

interface UseHealthReturn {
  status: HealthStatus;
}

const POLL_INTERVAL_MS = 15_000;

export function useHealth(): UseHealthReturn {
  const [status, setStatus] = React.useState<HealthStatus>("checking");

  React.useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
        if (!cancelled) setStatus(res.ok ? "connected" : "disconnected");
      } catch {
        if (!cancelled) setStatus("disconnected");
      }
    };

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { status };
}
