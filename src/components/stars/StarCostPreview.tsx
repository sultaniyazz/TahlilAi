"use client";

import { calculateStarCost, type TextContentLevel } from "@/config/stars";
import { Star } from "lucide-react";

type StarCostPreviewProps = {
  slides: number;
  textContent: TextContentLevel;
  userStars: number | null;
};

export function StarCostPreview({
  slides,
  textContent,
  userStars,
}: StarCostPreviewProps) {
  const cost = calculateStarCost({ slides, textContent });
  const insufficient =
    userStars !== null && userStars < cost;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm dark:border-amber-800 dark:bg-amber-950">
        <Star className="h-4 w-4 text-amber-500" />
        <span>
          This presentation will use <strong>{cost} stars</strong>
        </span>
        {userStars !== null && (
          <span className="text-muted-foreground">({userStars} remaining)</span>
        )}
      </div>
      {insufficient && (
        <p className="text-sm text-destructive">
          Not enough stars. You need {cost} stars but only have {userStars}.
        </p>
      )}
    </div>
  );
}

export function StarBalanceBadge({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <Star className="h-3.5 w-3.5 fill-current" />
      <span>{stars} stars</span>
    </div>
  );
}
