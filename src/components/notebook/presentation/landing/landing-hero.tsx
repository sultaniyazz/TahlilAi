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
import { useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { EXAMPLE_PROMPTS } from "./example-prompts";
import {
  fadeInUp,
  reducedFadeInUp,
  hoverLift,
  reducedHoverLift,
  hoverScale,
  reducedHoverScale,
  staggerContainer,
  tapScale,
  LANDING_EASE,
  SPRING_BUTTON,
} from "./landing-motion";
import { useLandingCreate } from "./use-landing-create";

const LANGUAGES = [
  ["uz-UZ", "O'zbekcha"],
  ["en-US", "Inglizcha"],
  ["ru", "Ruscha"],
  ["es", "Ispancha"],
  ["fr", "Fransuzcha"],
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

// Word-by-word hero headline
function AnimatedHeadline({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        {line1}
        <span className="block text-muted-foreground">{line2}</span>
      </h1>
    );
  }

  const words1 = line1.split(" ");
  const words2 = line2.split(" ");
  const totalWords1 = words1.length;

  return (
    <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
      <span
        style={{ display: "flex", flexWrap: "wrap", rowGap: "0.1em", justifyContent: "center" }}
        aria-label={line1}
      >
        {words1.map((word, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            style={{ display: "inline-block", marginRight: "0.28em" }}
            initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: (i * 100) / 1000,
              ease: LANDING_EASE,
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span
        className="block text-muted-foreground"
        style={{ display: "flex", flexWrap: "wrap", rowGap: "0.1em", justifyContent: "center" }}
        aria-label={line2}
      >
        {words2.map((word, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            style={{ display: "inline-block", marginRight: "0.28em" }}
            initial={{ filter: "blur(10px)", opacity: 0, y: 40 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: ((totalWords1 + i) * 100) / 1000,
              ease: LANDING_EASE,
            }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

export function LandingHero() {
  const shouldReduceMotion = useReducedMotion();

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

  const enterVariant = shouldReduceMotion ? reducedFadeInUp : fadeInUp;
  const cardHover = shouldReduceMotion ? reducedHoverLift : hoverLift;
  const btnHover = shouldReduceMotion ? reducedHoverScale : hoverScale;

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
        <motion.div variants={enterVariant}>
          <AnimatedHeadline
            line1="AI yordamida ajoyib"
            line2="taqdimotlarni soniyalarda yarating"
          />
        </motion.div>

        <motion.p
          variants={enterVariant}
          className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          G‘oyalaringizni zudlik bilan professional taqdimotlarga aylantiring. 
          Shunchaki mavzuni ta’riflang va qolganini sun’iy intellektga qo‘yib bering.
        </motion.p>

        <motion.div
          variants={enterVariant}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-card/80 p-4 shadow-lg backdrop-blur-sm transition-shadow duration-500 hover:shadow-xl sm:p-6"
        >
          <Textarea
            value={presentationInput}
            onChange={(event) => setPresentationInput(event.target.value)}
            placeholder="Taqdimot mavzusini ta'riflang yoki kontentingizni shu yerga joylang. AI uni mukammal taqdimot shakliga keltirib beradi."
            className="min-h-32 resize-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            aria-label="Taqdimot mavzusi yoki kontenti"
          />
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {presentationInput.length}/{maxPromptLength} belgi
          </div>

          <div className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(numSlides)}
                onValueChange={(value) => setNumSlides(Number(value))}
              >
                <SelectTrigger
                  className="w-[130px] bg-background transition-colors duration-300 hover:bg-muted/50"
                  aria-label="Slaydlar soni"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slidesOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} ta slayd
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  className="w-[130px] bg-background transition-colors duration-300 hover:bg-muted/50"
                  aria-label="Taqdimot tili"
                >
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
                <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  {webSearchEnabled ? "Yoqilgan" : "O‘chirilgan"}
                </span>
                <Switch
                  checked={webSearchEnabled}
                  onCheckedChange={setWebSearchEnabled}
                  aria-label="Web qidiruvni yoqish/o‘chirish"
                />
              </div>
            </div>

            <motion.div
              whileHover={btnHover}
              whileTap={tapScale}
              transition={SPRING_BUTTON}
            >
              <Button
                size="lg"
                type="button"
                className="w-full gap-2 bg-foreground text-background shadow-md transition-all duration-300 hover:bg-foreground/90 hover:shadow-lg sm:w-auto"
                disabled={isCreating || !presentationInput.trim()}
                onClick={() => void createPresentation()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Wand2 className="h-4 w-4" aria-hidden="true" />
                )}
                Taqdimot yaratish
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={enterVariant}
          className="mx-auto mt-14 max-w-5xl text-left"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Namunalarni sinab ko'ring</h2>
              <p className="text-sm text-muted-foreground">
                Boshlash uchun istalgan namunani bosing
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 transition-all duration-300 hover:border-primary/40 hover:bg-muted/60"
              onClick={() => setExamples(shuffle(EXAMPLE_PROMPTS))}
              aria-label="Namunalarni aralashtirish"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Aralashtirish
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
                variants={enterVariant}
                whileHover={cardHover}
                whileTap={tapScale}
                onClick={() =>
                  applyExample(example.prompt, example.slides, example.language)
                }
                className={cn(
                  "group flex flex-col rounded-xl border border-border/60 bg-card/60 p-4 text-left",
                  "shadow-sm transition-[border-color,box-shadow,background-color] duration-300",
                  "hover:border-primary/30 hover:bg-card hover:shadow-md",
                )}
                aria-label={`Namunadan foydalanish: ${example.title}`}
              >
                <span className="text-2xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  {example.icon}
                </span>
                <span className="mt-3 line-clamp-2 font-medium leading-snug">
                  {example.title}
                </span>
                <span className="mt-3 text-xs text-muted-foreground">
                  {example.slides} ta slayd | O'zbekcha
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}