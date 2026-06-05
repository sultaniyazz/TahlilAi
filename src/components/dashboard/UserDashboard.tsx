"use client";

import { deletePresentation } from "@/app/_actions/notebook/presentation/presentationActions";
import { fetchPresentations } from "@/app/_actions/notebook/presentation/fetchPresentations";
import { getStarHistory, getUserStars } from "@/app/_actions/stars/starActions";
import { togglePresentationPublicStatus } from "@/app/_actions/presentation/sharedPresentationActions";
import { StarBalanceBadge } from "@/components/stars/StarCostPreview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LandingHeader } from "@/components/notebook/presentation/landing/landing-header";
import { StarCostPreview } from "@/components/stars/StarCostPreview";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { calculateStarCost } from "@/config/stars";
import { useLandingCreate } from "@/components/notebook/presentation/landing/use-landing-create";
import { usePresentationState } from "@/states/presentation-state";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Plus,
  Presentation,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function UserDashboard() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const { textContent } = usePresentationState();
  const {
    presentationInput,
    setPresentationInput,
    language,
    setLanguage,
    numSlides,
    setNumSlides,
    webSearchEnabled,
    setWebSearchEnabled,
    isCreating,
    createPresentation,
    maxPromptLength,
  } = useLandingCreate();

  const { data: starsData } = useQuery({
    queryKey: ["user-stars"],
    queryFn: getUserStars,
  });

  const { data: starHistory = [] } = useQuery({
    queryKey: ["star-history"],
    queryFn: getStarHistory,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["presentations", page],
    queryFn: () => fetchPresentations(page),
  });

  const items = data?.items ?? [];
  const hasMore = data?.hasMore ?? false;
  const stars = starsData?.stars ?? 100;

  const starCostByPresentation = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of starHistory) {
      if (log.presentationId && log.delta < 0) {
        map.set(log.presentationId, Math.abs(log.delta));
      }
    }
    return map;
  }, [starHistory]);

  const starCost = calculateStarCost({ slides: numSlides, textContent });
  const insufficientStars = stars < starCost;

  const handleDelete = async (id: string) => {
    const result = await deletePresentation(id);
    if (result.success) {
      toast.success("Presentation deleted");
      void queryClient.invalidateQueries({ queryKey: ["presentations"] });
    } else {
      toast.error(result.message ?? "Failed to delete");
    }
  };

  const handleToggleShare = async (id: string, current: boolean) => {
    const result = await togglePresentationPublicStatus(id, !current);
    if (result.success) {
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["presentations"] });
    } else {
      toast.error(result.message ?? "Failed to update sharing");
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <LandingHeader />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your AI-generated presentations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StarBalanceBadge stars={stars} />
          <Button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Presentation
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create a new presentation</h2>
          <Textarea
            value={presentationInput}
            onChange={(e) => setPresentationInput(e.target.value)}
            placeholder="Describe your presentation topic..."
            className="min-h-28 resize-none"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {presentationInput.length}/{maxPromptLength}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Select
              value={String(numSlides)}
              onValueChange={(v) => setNumSlides(Number(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1} slides
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="uz-UZ">O&apos;zbekcha</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
              Web search
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <StarCostPreview
              slides={numSlides}
              textContent={textContent}
              userStars={stars}
            />
            <Button
              type="button"
              disabled={
                isCreating || !presentationInput.trim() || insufficientStars
              }
              onClick={() => void createPresentation()}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Presentation className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Create your first presentation</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Describe your topic and let AI generate beautiful slides in seconds.
          </p>
          <Button
            type="button"
            className="mt-6 gap-2"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            Get started
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const starCost = starCostByPresentation.get(item.id);
              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  <Link
                    href={`/presentation/${item.id}`}
                    className="flex flex-1 flex-col"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-muted">
                      {item.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Presentation className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 font-medium leading-snug">
                        {item.title || "Untitled Presentation"}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated{" "}
                        {formatDistanceToNow(new Date(item.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <div className="mt-auto flex items-center gap-2 pt-3">
                        {starCost !== undefined && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <Star className="h-3 w-3 fill-current" />
                            {starCost}
                          </span>
                        )}
                        {item.isPublic && (
                          <span className="text-xs text-muted-foreground">Public</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="absolute right-2 top-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/presentation/${item.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void handleToggleShare(item.id, item.isPublic)
                          }
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          {item.isPublic ? "Make private" : "Share publicly"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => void handleDelete(item.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>

          {(page > 0 || hasMore) && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
