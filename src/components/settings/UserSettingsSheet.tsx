"use client";

import { getStarHistory, getUserStars } from "@/app/_actions/stars/starActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
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
import { useSession } from "next-auth/react";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "plan", label: "Plan & Stars" },
  { id: "history", label: "Star History" },
];

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
  const planLabel = session?.user?.hasAccess ? "FREE" : "FREE";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your profile, plan, and star usage.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-1 border-b px-4 py-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4">
          {tab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>
                    {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session?.user?.name ?? "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  defaultValue={session?.user?.name ?? ""}
                  onBlur={(e) => {
                    if (e.target.value !== session?.user?.name) {
                      void update({ name: e.target.value });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session?.user?.email ?? ""}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Current plan</p>
                <p className="text-2xl font-bold">{planLabel}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stars remaining</span>
                  <span className="font-medium">
                    {stars} / {INITIAL_STARS}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-amber-400 transition-all"
                    style={{ width: `${(stars / INITIAL_STARS) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Each presentation uses 10–20 stars
                </p>
                <p className="text-xs text-muted-foreground">
                  Lifetime used: {totalUsed} stars
                </p>
              </div>

              <Button type="button" className="w-full" disabled>
                Upgrade to Pro (coming soon)
              </Button>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No star activity yet.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Action</th>
                        <th className="px-3 py-2 text-right font-medium">Stars</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((log) => (
                        <tr key={log.id} className="border-b last:border-0">
                          <td className="px-3 py-2 text-muted-foreground">
                            {format(new Date(log.createdAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-3 py-2">{log.reason}</td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right font-medium",
                              log.delta < 0 ? "text-destructive" : "text-green-600",
                            )}
                          >
                            {log.delta > 0 ? "+" : ""}
                            {log.delta}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
