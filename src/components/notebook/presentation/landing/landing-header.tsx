"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Github, Moon, Sparkles, Star, Sun } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { fadeIn } from "./landing-motion";

const NAV_ITEMS = [
  { label: "Xususiyatlar", href: "#features" },
  { label: "Jamoa", href: "#community" },
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
  const scrollToSection = (href: string) => {
    const section = document.querySelector(href);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
                href="https://github.com/sultaniyazz/TahlilAi"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
