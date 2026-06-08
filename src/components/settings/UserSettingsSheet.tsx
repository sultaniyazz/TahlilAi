"use client";

import { getStarHistory, getUserStars } from "@/app/_actions/stars/starActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { INITIAL_STARS } from "@/config/stars";
import { cn } from "@/lib/utils";
import { useSettingsSheet, type SettingsTab } from "@/stores/useSettingsSheet";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Camera,
  ChevronRight,
  Clock,
  CreditCard,
  HelpCircle,
  History,
  LogOut,
  Mail,
  Palette,
  Shield,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profil", icon: <User className="h-4 w-4" /> },
  { id: "plan", label: "Reja va Stars", icon: <Star className="h-4 w-4" /> },
  { id: "history", label: "Tarix", icon: <History className="h-4 w-4" /> },
];

function StarRing({ percentage }: { percentage: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
      <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke="url(#starGrad)" strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PlanBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <Zap className="h-3 w-3" />
      {label}
    </span>
  );
}

export function UserSettingsSheet() {
  const { data: session, update } = useSession();
  const { isOpen, tab, close, setTab } = useSettingsSheet();

  const { data: starsData } = useQuery({
    queryKey: ["user-stars"],
    queryFn: getUserStars,
    enabled: isOpen,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["star-history"],
    queryFn: getStarHistory,
    enabled: isOpen && tab === "history",
  });

  const stars = starsData?.stars ?? INITIAL_STARS;
  const totalUsed = starsData?.totalStarsUsed ?? 0;
  const percentage = Math.round((stars / INITIAL_STARS) * 100);
  const planLabel = "FREE";

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <SheetTitle className="sr-only">Sozlamalar</SheetTitle>
        <SheetDescription className="sr-only">Profil, reja va faoliyat tarixini boshqaring</SheetDescription>

        {/* Header — gradient avatar card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pb-6 pt-8">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-white/10 shadow-xl">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Rasmni o'zgartirish"
              >
                <Camera className="h-3 w-3 text-white" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {user?.name ?? "Foydalanuvchi"}
                </p>
                <PlanBadge label={planLabel} />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-400">
                {user?.email}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-amber-300">
                  {stars} stars qoldi
                </span>
              </div>
            </div>
          </div>
          <SheetClose className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-muted-foreground hover:bg-white/10">
            <X className="h-4 w-4" />
            <span className="sr-only">Yopish</span>
          </SheetClose>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-background">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors",
                tab === item.id
                  ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && (
            <div className="space-y-1 p-4">

              {/* Account section */}
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hisob
              </p>

              <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" className="text-xs text-muted-foreground">
                    Ism familiya
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="display-name"
                      defaultValue={user?.name ?? ""}
                      className="pl-9"
                      onBlur={(e) => {
                        if (e.target.value !== user?.name) {
                          void update({ name: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-muted-foreground">
                    Email manzil
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user?.email ?? ""}
                      readOnly
                      className="bg-muted/50 pl-9 text-muted-foreground"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Google orqali kirish. Email o'zgartirilmaydi.
                  </p>
                </div>
              </div>

              {/* Settings links */}
              <p className="mb-2 mt-5 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sozlamalar
              </p>

              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {[
                  { icon: <Bell className="h-4 w-4" />, label: "Bildirishnomalar", sub: "Email va push" },
                  { icon: <Palette className="h-4 w-4" />, label: "Ko'rinish", sub: "Mavzu va til" },
                  { icon: <Shield className="h-4 w-4" />, label: "Maxfiylik", sub: "Ma'lumot va ruxsatlar" },
                  { icon: <HelpCircle className="h-4 w-4" />, label: "Yordam", sub: "Qo'llanma va murojaat" },
                ].map((item, i, arr) => (
                  <button
                    key={item.label}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      i < arr.length - 1 && "border-b"
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>

              {/* Sign out */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Hisobdan chiqish
                </button>
              </div>
            </div>
          )}

          {/* ── PLAN TAB ── */}
          {tab === "plan" && (
            <div className="space-y-4 p-4">

              {/* Stars ring card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-amber-950/30 dark:to-orange-950/30">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <StarRing percentage={percentage} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold tabular-nums sm:text-xl">{stars}</span>
                      <span className="text-xs text-muted-foreground">stars</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stars balansi</p>
                    <p className="mt-0.5 text-2xl font-bold">
                      {stars}
                      <span className="text-sm font-normal text-muted-foreground"> / {INITIAL_STARS}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Jami ishlatilgan: <span className="font-semibold text-foreground">{totalUsed}</span> stars
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {percentage}% qolgan
                  </p>
                </div>
              </div>

              {/* Star cost table */}
              <div className="rounded-xl border bg-card shadow-sm">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">Stars narxi</p>
                </div>
                {[
                  { label: "Oddiy prezentatsiya", cost: "10", sub: "5-10 slide, minimal matn" },
                  { label: "Batafsil prezentatsiya", cost: "15", sub: "10-15 slide, to'liq kontent" },
                  { label: "Katta prezentatsiya", cost: "20", sub: "15+ slide, keng qamrovli" },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className={cn("flex items-center justify-between px-4 py-3", i < arr.length - 1 && "border-b")}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{item.cost}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current plan */}
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Joriy reja</p>
                    <p className="mt-0.5 text-xl font-bold">Bepul</p>
                    <p className="mt-1 text-xs text-muted-foreground">100 boshlang'ich stars</p>
                  </div>
                  <PlanBadge label="FREE" />
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <p className="font-semibold">Pro rejaga o'ting</p>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-400">
                    Cheksiz stars, premium temalar va ustuvor qo'llab-quvvatlash oling.
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full bg-gradient-to-r from-amber-400 to-orange-500 font-semibold text-slate-900 hover:from-amber-500 hover:to-orange-600"
                    disabled
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Tez kunda...
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === "history" && (
            <div className="p-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Faoliyat yo'q</p>
                  <p className="text-sm text-muted-foreground">
                    Stars ishlatilganda bu yerda ko'rinadi
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    So'nggi {history.length} ta amal
                  </p>
                  {history.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          log.delta < 0
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-green-100 dark:bg-green-900/30",
                        )}
                      >
                        {log.delta < 0 ? (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {log.reason === "presentation_created"
                            ? "Prezentatsiya yaratildi"
                            : log.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "d MMM yyyy, HH:mm")}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                          log.delta < 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        )}
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {log.delta > 0 ? "+" : ""}
                        {log.delta}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
