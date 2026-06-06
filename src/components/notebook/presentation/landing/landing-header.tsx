"use client";

import { getUserStars } from "@/app/_actions/stars/starActions";
import { StarBalanceBadge } from "@/components/stars/StarCostPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLoginModal } from "@/stores/useLoginModal";
import { useSettingsSheet } from "@/stores/useSettingsSheet";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Moon, Settings, Sparkles, Star, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import * as motion from "motion/react-client";
import Link from "next/link";
import { fadeIn } from "./landing-motion";

const NAV_ITEMS = [
  { label: "Xususiyatlari", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Narxlar", href: "#pricing" },
] as const;

function HeaderThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 transition-all duration-300 dark:hidden" />
      <Moon className="hidden h-4 w-4 transition-all duration-300 dark:block" />
    </Button>
  );
}

export function LandingHeader() {
  const { data: session, status } = useSession();
  const { open: openLoginModal } = useLoginModal();
  const { open: openSettings } = useSettingsSheet();

  const { data: starsData } = useQuery({
    queryKey: ["user-stars"],
    queryFn: getUserStars,
    enabled: status === "authenticated",
  });

  const scrollToSection = (href: string) => {
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stars = starsData?.stars ?? 100;
  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-[75vw] items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/presentation"
          className="flex items-center gap-3 rounded-full transition duration-500 ease-out hover:text-foreground"
        >
          <span className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            TahlilAi
          </span>
          <span className="inline-flex h-6 items-center justify-center rounded-full border border-amber-300/40 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-600 dark:border-amber-400/20 dark:text-amber-200">
            <Sparkles className="h-3 w-3" />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.href);
              }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-all duration-500 ease-out transform",
                "hover:text-foreground hover:tracking-wide",
              )}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderThemeToggle />

          {isLoggedIn ? (
            <>
              <StarBalanceBadge stars={stars} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback>
                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/presentation">My Presentations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openSettings("profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openSettings("plan")}>
                    Billing & Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openSettings("history")}>
                    <Star className="mr-2 h-4 w-4" />
                    Star History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/presentation" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openLoginModal}
              >
                Log in
              </Button>
              <Button type="button" size="sm" onClick={openLoginModal}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
