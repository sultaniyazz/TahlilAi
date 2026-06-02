"use client";

import AllweoneText from "@/components/globals/allweone-logo";
import { Brain } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Github, Moon, Star, Sun } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { fadeIn } from "./landing-motion";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Community", href: "#community" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
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
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/presentation"
          className="group flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
        >
          <Brain className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
          <AllweoneText className="h-8 w-28" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium text-muted-foreground",
                "transition-colors duration-300 hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <HeaderThemeToggle />

          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium sm:flex"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>2.8k</span>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              asChild
              size="sm"
              className="gap-2 shadow-md transition-shadow duration-300 hover:shadow-lg"
            >
              <a
                href="https://github.com/allweone/presentation-ai"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Star one GitHub</span>
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
