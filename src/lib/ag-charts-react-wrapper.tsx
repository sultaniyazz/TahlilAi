import React, { forwardRef } from "react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { AgChartOptions, AgChartInstance } from "ag-charts-community";
import { AllCommunityModule, ModuleRegistry } from "ag-charts-community";
import * as AgChartsReact from "ag-charts-react";

let _initialized = false;
if (typeof window !== "undefined" && !_initialized) {
  try {
    ModuleRegistry.registerModules([AllCommunityModule]);
    _initialized = true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("Failed to register ag-charts community modules:", e);
  }
}

const ENTERPRISE_SERIES = new Set<string>([
  "sankey",
  "chord",
  "funnel",
  "cone-funnel",
  "pyramid",
  "treemap",
  "sunburst",
  "waterfall",
  "heatmap",
  "box-plot",
  "candlestick",
  "ohlc",
  "nightingale",
  "radial-column",
  "radial-bar",
  "range-bar",
  "range-area",
  "radar-area",
  "radar",
  "histogram",
]);

function containsEnterpriseOptions(options: any): boolean {
  if (!options) return false;
  try {
    const series = options.series;
    if (Array.isArray(series)) {
      for (const s of series) {
        if (s && typeof s.type === "string" && ENTERPRISE_SERIES.has(s.type))
          return true;
      }
    }
    const serialized = JSON.stringify(options);
    for (const t of ENTERPRISE_SERIES) {
      if (serialized.includes(`\"type\":\"${t}\"`)) return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

const Fallback = ({ message }: { message?: string }) => (
  <div
    style={{
      width: "100%",
      minHeight: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      borderRadius: 8,
      border: "1px solid rgba(0,0,0,0.06)",
      background: "transparent",
      color: "var(--presentation-text, #111)",
      fontSize: 12,
    }}
  >
    {message ?? "Enterprise chart (requires AG Charts Enterprise)"}
  </div>
);

type AgChartProps = any;

export const AgCharts: ForwardRefExoticComponent<
  AgChartProps & RefAttributes<AgChartInstance<AgChartOptions<any, unknown>>>
> = forwardRef<AgChartInstance<AgChartOptions<any, unknown>>, AgChartProps>(
  function AgCharts(props, ref) {
    if (containsEnterpriseOptions(props?.options)) {
      return <Fallback />;
    }
      // sanitize options to match community API expectations
      const forwardedProps = { ...props };
      try {
        const opts = forwardedProps.options as any;

        // Force-disable animation to avoid triggering enterprise AnimationModule checks
        if (opts) {
          forwardedProps.options = { ...opts, animation: { enabled: false } };
        }

        // Convert axes arrays to object keyed by position (community expects object form)
        const current = forwardedProps.options as any;
        if (current && Array.isArray(current.axes)) {
          const axesObj: Record<string, any> = {};
          for (const ax of current.axes) {
            if (ax && typeof ax.position === "string") {
              const copy = { ...ax };
              delete copy.position;
              axesObj[ax.position] = copy;
            }
          }
          forwardedProps.options = { ...current, axes: axesObj };
        }
        // Remove unsupported series properties that community build ignores (and which
        // can trigger module checks), e.g. `marker`.
        try {
          const sanitized = forwardedProps.options as any;
          if (sanitized && Array.isArray(sanitized.series)) {
            sanitized.series = sanitized.series.map((s: any) => {
              if (s && typeof s === "object") {
                const copy = { ...s };
                delete copy.marker;
                delete copy.item;
                return copy;
              }
              return s;
            });
            forwardedProps.options = { ...sanitized };
          }

          // Strip top-level gauge-like props that are not part of AgCharts options
          if (forwardedProps.options) {
            delete forwardedProps.options.needle;
            delete forwardedProps.options.bar;
            delete forwardedProps.options.scale;
          }
        } catch (e) {
          // ignore
        }
      } catch (e) {
        // ignore sanitization errors
      }

      // @ts-ignore - forward ref to real component
      return <AgChartsReact.AgCharts ref={ref} {...forwardedProps} />;
  },
);

export const AgGauge = forwardRef(function AgGauge(props: any, ref: any) {
  // gauges are community; forward to real AgGauge
  // @ts-ignore
  return <AgChartsReact.AgGauge ref={ref} {...props} />;
});

export * from "ag-charts-react";