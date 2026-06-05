import { AllCommunityModule, ModuleRegistry } from "ag-charts-community";

let initialized = false;

// If running in the browser, register community modules immediately
// at module import time so that registration happens before any
// component layout effects (which run earlier than parent useEffect).
if (typeof window !== "undefined" && !initialized) {
  try {
    ModuleRegistry.registerModules([AllCommunityModule]);
    initialized = true;
  } catch (e) {
    // If registration fails for any reason, log a warning but
    // allow the app to continue. Components will still attempt
    // to call `initAgCharts()` if needed.
    // eslint-disable-next-line no-console
    console.warn("ag-charts community module registration failed:", e);
  }
}

/**
 * Backward-compatible init function. Calling this will ensure
 * modules are registered (no-op if already done).
 */
export function initAgCharts(): void {
  if (initialized) return;

  ModuleRegistry.registerModules([AllCommunityModule]);
  initialized = true;
}
