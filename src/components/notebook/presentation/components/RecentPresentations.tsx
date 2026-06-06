"use client";

import { fetchPresentations } from "@/app/_actions/notebook/presentation/fetchPresentations";
import { deletePresentation } from "@/app/_actions/notebook/presentation/presentationActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Globe,
  Grid3X3,
  Heart,
  LayoutList,
  Loader2,
  MoreHorizontal,
  Plus,
  Presentation,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// ─── Tab types ───────────────────────────────────────────────────────────────
type Tab = "all" | "recent" | "templates" | "favorites";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "Hammasi", icon: <Presentation className="h-3.5 w-3.5" /> },
  {
    id: "recent",
    label: "Yaqinda ko'rilgan",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  {
    id: "templates",
    label: "Shablonlar",
    icon: <Grid3X3 className="h-3.5 w-3.5" />,
  },
  {
    id: "favorites",
    label: "Sevimlilar",
    icon: <Star className="h-3.5 w-3.5" />,
  },
];

// ─── Gradient placeholders (for presentations without thumbnails) ─────────────
const PLACEHOLDER_GRADIENTS = [
  "from-indigo-900 via-purple-900 to-slate-900",
  "from-slate-800 via-slate-700 to-slate-900",
  "from-zinc-800 via-zinc-700 to-neutral-900",
  "from-gray-800 via-slate-800 to-gray-900",
  "from-stone-800 via-stone-700 to-neutral-900",
];

function getGradient(id: string) {
  const idx =
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    PLACEHOLDER_GRADIENTS.length;
  return PLACEHOLDER_GRADIENTS[idx];
}

// ─── Single presentation card ─────────────────────────────────────────────────
function PresentationCard({
  item,
  view,
  onDelete,
}: {
  item: {
    id: string;
    title: string;
    updatedAt: Date;
    thumbnailUrl?: string | null;
    favorites?: { id: string }[];
  };
  view: "grid" | "list";
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const { resolvedTheme: cardResolvedTheme } = useTheme();
  const isDarkCard = cardResolvedTheme === "dark";
  const isFavorited = (item.favorites?.length ?? 0) > 0;

  if (view === "list") {
    return (
      <div
        onClick={() => router.push(`/presentation/${item.id}`)}
        className={cn(
          "group flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200",
          isDarkCard
            ? "border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]"
            : "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300",
        )}
      >
        {/* Thumbnail small */}
        <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded-md">
          {item.thumbnailUrl ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className={cn(
                "h-full w-full bg-gradient-to-br",
                getGradient(item.id),
              )}
            />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-medium", isDarkCard ? "text-white/90" : "text-black") }>
            {item.title || "Untitled Presentation"}
          </p>
          <p className={cn("text-xs", isDarkCard ? "text-white/40" : "text-gray-500")}>
            {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {isFavorited && (
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  isDarkCard ? "text-white/40 hover:text-white/90" : "text-gray-600 hover:text-black",
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/10 bg-zinc-900"
            >
              <DropdownMenuItem
                className="cursor-pointer text-rose-400 focus:bg-rose-950 focus:text-rose-300"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => router.push(`/presentation/${item.id}`)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5",
        isDarkCard
          ? "border border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15] hover:shadow-xl hover:shadow-black/40"
          : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow",
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
              <div
            className={cn(
              "h-full w-full bg-gradient-to-br transition-transform duration-500 group-hover:scale-105",
              getGradient(item.id),
            )}
          >
            <div className="flex h-full items-center justify-center opacity-20">
              <Presentation className="h-10 w-10 text-white" />
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className={cn("absolute inset-0 transition-all duration-300", isDarkCard ? "bg-black/0 group-hover:bg-black/20" : "bg-transparent")} />

        {/* Favorite heart */}
        {isFavorited && (
          <div className={cn("absolute right-2.5 top-2.5 rounded-full p-1 backdrop-blur-sm", isDarkCard ? "bg-black/50" : "bg-white/80")}>
            <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
          </div>
        )}

        {/* Action menu — appears on hover */}
        <div
          className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-full backdrop-blur-sm",
                  isDarkCard ? "bg-black/50 text-white/80 hover:bg-black/70 hover:text-white" : "bg-white/90 text-black hover:opacity-90",
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-white/10 bg-zinc-900"
            >
              <DropdownMenuItem
                className="cursor-pointer text-rose-400 focus:bg-rose-950 focus:text-rose-300"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card footer */}
      <div className="px-3 py-2">
        <p className={cn("truncate text-sm font-medium", isDarkCard ? "text-white/85" : "text-black") }>
          {item.title || "Untitled Presentation"}
        </p>
        <p className={cn("mt-0.5 text-xs", isDarkCard ? "text-white/35" : "text-gray-500")}>
          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  const { resolvedTheme } = useTheme();
  const isDarkEmpty = resolvedTheme === "dark";

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div
        className={cn(
          "mb-3 rounded-lg p-4",
          isDarkEmpty
            ? "border border-white/[0.06] bg-white/[0.03]"
            : "border border-gray-200 bg-white",
        )}
      >
        <Presentation className={cn("h-7 w-7", isDarkEmpty ? "text-white/25" : "text-slate-500")} />
      </div>
      <p className={cn("mb-1 text-sm font-medium", isDarkEmpty ? "text-white/50" : "text-slate-950")}>Hali taqdimotlar yo'q</p>
      <p className={cn("mb-4 text-xs", isDarkEmpty ? "text-white/25" : "text-slate-500")}>Birinchi AI quvvatlaydigan taqdimotingizni yarating</p>
      <Button
        size="sm"
        onClick={onCreateNew}
        className={cn(
          "gap-2",
          isDarkEmpty ? "bg-white/10 text-white/80 hover:bg-white/15" : "bg-slate-950 text-white hover:bg-slate-900",
        )}
      >
        <Plus className="h-4 w-4" />
        Presentatsiya yaratish
      </Button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RecentPresentations({
  onCreateNew,
}: {
  onCreateNew?: () => void;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["presentations"],
    queryFn: () => fetchPresentations(0),
  });

  const allItems = data?.items ?? [];

  // Filter by tab
  const tabFiltered = allItems.filter((item) => {
    if (activeTab === "favorites")
      return (item.favorites?.length ?? 0) > 0;
    return true; // all & recent show everything (you can add "viewed" tracking later)
  });

  // Filter by search
  const items = tabFiltered.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      await deletePresentation(id);
      await queryClient.invalidateQueries({ queryKey: ["presentations"] });
      toast.success("Taqdimot o'chirildi");
    } catch {
      toast.error("Failed to delete presentation");
    }
  };

  const isDark = resolvedTheme === "dark";

  return (
    <section className="px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-[75vw]">
        <div
          className={cn(
            "rounded-2xl p-0.5 w-full",
            isDark ? "border border-white/[0.06] bg-white/[0.02]" : "border border-gray-200 bg-gray-50",
          )}
        >
      {/* ── Top toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium transition-all duration-150",
                isDark
                  ? activeTab === tab.id
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"
                  : activeTab === tab.id
                  ? "bg-gray-100 text-slate-950 shadow-sm"
                  : "text-slate-700 hover:bg-gray-100 hover:text-slate-950",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search
              className={cn(
                "absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                isDark ? "text-white/30" : "text-gray-400",
              )}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidiruv..."
              className={cn(
                "h-8 w-full pl-8 text-xs placeholder:text-gray-400 focus-visible:ring-0",
                isDark
                  ? "border-white/[0.06] bg-white/[0.03] text-white/80 placeholder:text-white/25"
                  : "border-gray-200 bg-white text-black placeholder:text-gray-400",
              )}
            />
          </div>

          {/* Create new */}
          <Button
            size="sm"
            onClick={onCreateNew}
            className={cn(
              "h-8 gap-1.5",
              isDark ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:opacity-90",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Yangisini yarating</span>
          </Button>

          {/* View toggle */}
          <div
            className={cn(
              "flex items-center rounded-lg p-0.5",
              isDark
                ? "border border-white/[0.06] bg-white/[0.03]"
                : "border border-gray-200 bg-white",
            )}
          >
            <button
              type="button"
              onClick={() => setView("grid")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                isDark
                  ? view === "grid"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                  : view === "grid"
                  ? "bg-slate-950/10 text-slate-950"
                  : "text-slate-700 hover:text-slate-950 hover:bg-gray-100",
              )}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                isDark
                  ? view === "list"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                  : view === "list"
                  ? "bg-slate-950/10 text-slate-950"
                  : "text-slate-700 hover:text-slate-950 hover:bg-gray-100",
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-2 my-2 h-px bg-white/[0.04]" />

      {/* ── Content ── */}
      <div className="px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState onCreateNew={onCreateNew ?? (() => router.push("/presentation/create"))} />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <PresentationCard
                key={item.id}
                item={item}
                view="grid"
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <PresentationCard
                key={item.id}
                item={item}
                view="list"
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
    </section>
  );
}