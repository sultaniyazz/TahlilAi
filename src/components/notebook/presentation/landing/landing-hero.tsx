"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Globe, Loader2, Shuffle, Wand2 } from "lucide-react";
import * as motion from "motion/react-client";
import { useMemo, useState } from "react";
import { EXAMPLE_PROMPTS } from "./example-prompts";
import {
  fadeInUp,
  hoverLift,
  staggerContainer,
  tapScale,
} from "./landing-motion";
import { useLandingCreate } from "./use-landing-create";

const LANGUAGES = [
  ["en-US", "English"],
  ["pt", "Portuguese"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["ru", "Russian"],
] as const;

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    const swap = copy[j];
    if (current !== undefined && swap !== undefined) {
      copy[i] = swap;
      copy[j] = current;
    }
  }
  return copy;
}

export function LandingHero() {
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
    applyExample,
    maxPromptLength,
  } = useLandingCreate();

  const [examples, setExamples] = useState(EXAMPLE_PROMPTS);
  const slidesOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => `${index + 1}`),
    [],
  );

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
      />

      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1
          variants={fadeInUp}
          className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          Create stunning presentations
          <span className="block text-muted-foreground">in seconds with AI</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          Transform your ideas into professional presentations instantly. Just
          describe your topic and let AI do the rest.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-card/80 p-4 shadow-lg backdrop-blur-sm transition-shadow duration-500 hover:shadow-xl sm:p-6"
        >
          <Textarea
            value={presentationInput}
            onChange={(event) => setPresentationInput(event.target.value)}
            placeholder="Describe your topic or paste your content here. Our AI will structure it into a compelling presentation."
            className="min-h-32 resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {presentationInput.length}/{maxPromptLength} characters
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(numSlides)}
                onValueChange={(value) => setNumSlides(Number(value))}
              >
                <SelectTrigger className="w-[130px] bg-background transition-colors duration-300 hover:bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slidesOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} slides
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[130px] bg-background transition-colors duration-300 hover:bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 transition-colors duration-300 hover:bg-muted/50">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {webSearchEnabled ? "Enabled" : "Disabled"}
                </span>
                <Switch
                  checked={webSearchEnabled}
                  onCheckedChange={setWebSearchEnabled}
                />
              </div>
            </div>

            <motion.div whileHover={hoverLift} whileTap={tapScale}>
              <Button
                size="lg"
                className="w-full gap-2 bg-foreground text-background shadow-md transition-all duration-300 hover:bg-foreground/90 hover:shadow-lg sm:w-auto"
                disabled={isCreating || !presentationInput.trim()}
                onClick={() => void createPresentation()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Generate Presentation
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mx-auto mt-14 max-w-5xl text-left"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Try these examples</h2>
              <p className="text-sm text-muted-foreground">
                Click any example to get started instantly
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-300 hover:border-primary/40 hover:bg-muted/60"
              onClick={() => setExamples(shuffle(EXAMPLE_PROMPTS))}
            >
              <Shuffle className="h-4 w-4" />
              Shuffle Examples
            </Button>
          </div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {examples.map((example) => (
              <motion.button
                key={example.id}
                type="button"
                variants={fadeInUp}
                whileHover={hoverLift}
                whileTap={tapScale}
                onClick={() =>
                  applyExample(example.prompt, example.slides, example.language)
                }
                className={cn(
                  "group flex flex-col rounded-xl border border-border/60 bg-card/60 p-4 text-left",
                  "shadow-sm transition-[border-color,box-shadow,background-color] duration-300",
                  "hover:border-primary/30 hover:bg-card hover:shadow-md",
                )}
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
                  {example.icon}
                </span>
                <span className="mt-3 line-clamp-2 font-medium leading-snug">
                  {example.title}
                </span>
                <span className="mt-3 text-xs text-muted-foreground">
                  {example.slides} slides | English
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
