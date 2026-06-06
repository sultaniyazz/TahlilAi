"use client";

import { useEffect } from "react";
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
import { RecentPresentations } from "@/components/notebook/presentation/components/RecentPresentations";
import { usePresentationState } from "@/states/presentation-state";

export function PresentationLandingPage() {
  const { currentPresentationId, setPresentationInput } = usePresentationState(
    (state) => ({
      currentPresentationId: state.currentPresentationId,
      setPresentationInput: state.setPresentationInput,
    }),
  );

  useEffect(() => {
    if (currentPresentationId) {
      setPresentationInput("");
    }
  }, [currentPresentationId, setPresentationInput]);

  return (
    <div className="min-h-full w-full bg-background text-foreground">
      <LandingHeader />
      <LandingHero />
      <RecentPresentations />
      <LandingFeatures />
      <LandingOpenSource />
      <LandingDemo />
      <LandingPricing />
      <LandingCommunity />
      <LandingFooter />
    </div>
  );
}
