import { AllCommunityModule, ModuleRegistry } from "ag-charts-community";

let initialized = false;

/**
 * Registers AG Charts modules once per app load.
 * Enterprise loads only when NEXT_PUBLIC_AG_CHARTS_LICENSE_KEY is set.
 */
export function initAgCharts(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  const licenseKey = process.env.NEXT_PUBLIC_AG_CHARTS_LICENSE_KEY?.trim();

  if (!licenseKey) {
    ModuleRegistry.registerModules([AllCommunityModule]);
    return;
  }

  void import("ag-charts-enterprise").then(
    ({ AllEnterpriseModule, LicenseManager }) => {
      ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
      LicenseManager.setLicenseKey(licenseKey);
    },
  );
}
