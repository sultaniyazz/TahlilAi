"use client";

import { useEffect, useState, type ReactNode } from "react";
import { initAgCharts } from "@/lib/ag-charts-setup";

export default function AgChartsInitializer({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initAgCharts();
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
