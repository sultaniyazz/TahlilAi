"use server";

import { type LayoutType } from "@/components/presentation/utils/parser";
import { env } from "@/env";
import { requireOptionalIntegration } from "@/lib/env/optional-integrations";
import { auth } from "@/server/auth";

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    download_location: string;
  };
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

function simplifySearchQuery(query: string): string {
  const words = query
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 4) {
    return query.trim();
  }

  return words.slice(0, 4).join(" ");
}

async function searchUnsplashOnce(
  accessKey: string,
  query: string,
  orientation?: "landscape" | "portrait" | "squarish",
): Promise<string | null> {
  const orientationQuery = orientation
    ? `&orientation=${orientation}`
    : "";

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=1${orientationQuery}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status}`);
  }

  const data = (await response.json()) as UnsplashSearchResponse;
  const firstImage = data.results?.[0];

  return firstImage?.urls.regular ?? null;
}

export async function getImageFromUnsplash(
  query: string,
  layoutType?: LayoutType,
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  // Get the current session
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in to get images" };
  }

  const unsplashConfig = requireOptionalIntegration({
    integration: "Unsplash",
    envVar: "UNSPLASH_ACCESS_KEY",
    value: env.UNSPLASH_ACCESS_KEY,
    feature: "stock image search",
  });

  if (!unsplashConfig.ok) {
    return {
      success: false,
      error: unsplashConfig.error,
    };
  }

  const preferredOrientations: Array<"landscape" | "portrait" | undefined> =
    layoutType === "left" || layoutType === "right"
      ? ["portrait", "landscape", undefined]
      : ["landscape", undefined];

  const queries = [...new Set([query.trim(), simplifySearchQuery(query)].filter(Boolean))];

  try {
    for (const searchQuery of queries) {
      for (const orientation of preferredOrientations) {
        const imageUrl = await searchUnsplashOnce(
          unsplashConfig.value,
          searchQuery,
          orientation,
        );

        if (imageUrl) {
          return { success: true, imageUrl };
        }
      }
    }

    return {
      success: false,
      error: `No Unsplash images found for "${query}"`,
    };
  } catch (error) {
    console.error("Error getting Unsplash image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get image",
    };
  }
}
