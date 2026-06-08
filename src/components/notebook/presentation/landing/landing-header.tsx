"use client";

import { getUserStars } from "@/app/_actions/stars/starActions";
import { StarBalanceBadge } from "@/components/stars/StarCostPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useLoginModal } from "@/stores/useLoginModal";
import { useSettingsSheet } from "@/stores/useSettingsSheet";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sparkles, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
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
      <div className="mx-auto flex h-16 w-full landing-container landing-header-stack items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/presentation"
          className="flex items-center gap-3 rounded-full transition duration-500 ease-out hover:text-foreground"
          aria-label="TahlilAi bosh sahifasiga o'tish"
        >
          <AppLogo />
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
                "text-xs font-medium text-muted-foreground transition-all duration-500 ease-out transform sm:text-sm",
                "hover:text-foreground hover:tracking-wide",
              )}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <HeaderThemeToggle />

          {isLoggedIn ? (
            <>
              <StarBalanceBadge stars={stars} />

              <Button
                type="button"
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
                onClick={() => openSettings("profile")}
                aria-label="Profil sozlamalarini ochish"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback>
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
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
              <Button
                type="button"
                size="sm"
                onClick={openLoginModal}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
