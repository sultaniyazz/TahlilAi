"use client";

import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import {
  LandingCommunity,
  LandingDemo,
  LandingFeatures,
  LandingFooter,
  LandingOpenSource,
  LandingPricing,
} from "./landing-sections";

export function PresentationLandingPage() {
  return (
    <div className="min-h-full w-full bg-background text-foreground">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingOpenSource />
      <LandingDemo />
      <LandingPricing />
      <LandingCommunity />
      <LandingFooter />
    </div>
  );
}
