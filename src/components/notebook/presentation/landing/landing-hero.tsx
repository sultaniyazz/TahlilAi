"use client";

import { getUserStars } from "@/app/_actions/stars/starActions";
import { StarCostPreview } from "@/components/stars/StarCostPreview";
import { Button } from "@/components/ui/button";
import { calculateStarCost } from "@/config/stars";
import { usePresentationState } from "@/states/presentation-state";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
import { Globe, Loader2, Shuffle, Wand2, FileText, Paperclip } from "lucide-react";
import { useFileAnalysis } from "@/hooks/presentation/useFileAnalysis";
import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useReducedMotion } from "motion/react";
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

const SLIDES_OPTIONS = Array.from({ length: 12 }, (_, index) => `${index + 1}`);

function FileUploadCard({
  fileName,
  isAnalyzing,
  onRemove,
}: {
  fileName: string;
  isAnalyzing: boolean;
  onRemove: () => void;
}) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isDocx = ext === "docx" || ext === "doc";
  const isImg = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

  const iconBg = isPdf
    ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
    : isDocx
    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
    : isImg
    ? "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
    : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";

  return (
    <div className="rounded-2xl border border-border/60 bg-background/90 px-4 py-4 text-sm text-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}>
          <FileText className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAnalyzing
              ? "Tahlil qilinmoqda..."
              : "Tahlil tugadi — taqdimot uchun tayyor."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted/90"
        >
          O'chirish
        </button>
      </div>
    </div>
  );
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

  const { status } = useSession();
  const { textContent } = usePresentationState();
  const { data: starsData } = useQuery({
    queryKey: ["user-stars"],
    queryFn: getUserStars,
    enabled: status === "authenticated",
  });

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const { analyzeFiles, isAnalyzing, analysisResult, clearAnalysis } = useFileAnalysis();

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? (Array.from(event.target.files) as File[]) : [];
    if (files.length === 0) return;

    setUploadedFileName(files[0]?.name ?? null);
    setPresentationInput("");

    const data = await analyzeFiles(files);
    if (!data) {
      setUploadedFileName(null);
    }

    event.target.value = "";
  };

  const removeUploadedFile = () => {
    clearAnalysis();
    setUploadedFileName(null);
  };

  const userStars = starsData?.stars ?? null;
  const starCost = calculateStarCost({ slides: numSlides, textContent });
  const insufficientStars =
    status === "authenticated" &&
    userStars !== null &&
    userStars < starCost;

  const enterVariant = shouldReduceMotion ? reducedFadeInUp : fadeInUp;
  const cardHover = shouldReduceMotion ? reducedHoverLift : hoverLift;
  const btnHover = shouldReduceMotion ? reducedHoverScale : hoverScale;

  const getLanguageLabel = (langCode: string) => {
    const lang = LANGUAGES.find(([value]) => value === langCode);
    return lang ? lang[1] : langCode;
  };

  const fileTypeLabel = (fileName: string | null) => {
    const extension = fileName?.split(".").pop()?.toLowerCase() ?? "";

    if (extension === "pdf") return "PDF";
    if (extension === "docx" || extension === "doc") return "Word";
    if (extension === "txt") return "Text";
    return "Fayl";
  };

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
      />

      <motion.div
        className="mx-auto w-full landing-container text-center"
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
          className="mx-auto mt-5 max-w-2xl text-pretty hidden sm:block text-sm text-muted-foreground sm:text-base"
        >
          G‘oyalaringizni zudlik bilan professional taqdimotlarga aylantiring. 
          Shunchaki mavzuni ta’riflang va qolganini sun’iy intellektga qo‘yib bering.
        </motion.p>

        <motion.div
          variants={enterVariant}
          className="mx-auto mt-10 max-w-3xl rounded-2xl border border-border/60 bg-card/80 p-4 shadow-lg backdrop-blur-sm transition-shadow duration-500 hover:shadow-xl sm:p-6"
        >
          <AnimatePresence mode="wait">
            {!uploadedFileName ? (
              <motion.div
                key="textarea"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="relative">
                  <Textarea
                    value={presentationInput}
                    onChange={(event) => setPresentationInput(event.target.value)}
                    placeholder={
                      analysisResult?.prompt
                        ? "Fayl tahlil qilindi. So‘rov faqat fayldan olinadi."
                        : "G‘oyani yozing, biz uni mukammal taqdimotga aylantiramiz."
                    }
                    className="min-h-[8rem] resize-none border-0 bg-transparent text-sm sm:text-base shadow-none focus-visible:ring-0 pr-12 placeholder:text-muted-foreground"
                    aria-label="Taqdimot mavzusi yoki kontenti"
                    disabled={Boolean(analysisResult?.prompt)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-sm transition-colors hover:bg-muted/80 hover:text-foreground"
                    aria-label="Fayl yuklash"
                  >
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="file-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <FileUploadCard
                  fileName={uploadedFileName ?? "Fayl"}
                  isAnalyzing={isAnalyzing}
                  onRemove={removeUploadedFile}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            className="hidden"
            onChange={handleUploadFile}
          />

          <div className="mt-2 text-right text-xs text-muted-foreground">
            {presentationInput.length}/{maxPromptLength} belgi
          </div>

          

          

          {status === "authenticated" && (
            <div className="mt-4 border-t border-border/50 pt-4">
              <StarCostPreview
                slides={numSlides}
                textContent={textContent}
                userStars={userStars}
              />
            </div>
          )}

          <div className="mt-4 border-t border-border/50 pt-4 sm:flex sm:items-center sm:justify-between sm:gap-3">
            <div className="flex  mt-1 min-w-0   flex-nowrap items-center p-1 gap-3 overflow-x-auto pb-1">
              <div className="min-w-[120px] flex-none">
                <Select
                  value={String(numSlides)}
                  onValueChange={(value) => setNumSlides(Number(value))}
                >
                  <SelectTrigger
                    className="w-[130px] text-sm bg-background transition-colors duration-300 hover:bg-muted/50 focus:outline-none focus-visible:ring-0 focus:border-transparent focus:ring-0 data-[state=open]:ring-0 data-[state=open]:outline-none data-[state=open]:shadow-none"
                    aria-label="Slaydlar soni"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLIDES_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} ta slayd
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="min-w-[120px] flex-none">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger
                    className="w-[130px] text-sm bg-background transition-colors duration-300 hover:bg-muted/50 focus:outline-none focus-visible:ring-0 focus:border-transparent focus:ring-0 data-[state=open]:ring-0 data-[state=open]:outline-none data-[state=open]:shadow-none"
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
              </div>

              <div className="min-w-[160px] flex-none">
                {/* Desktop / tablet: show icon + label + Switch */}
                <div className="hidden sm:flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm transition-colors duration-300 hover:bg-muted/50">
                  <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Qidiruv</span>
                  <div className="ml-2" />
                  <Switch
                    checked={webSearchEnabled}
                    onCheckedChange={setWebSearchEnabled}
                    aria-label="Web qidiruvni yoqish/o'chirish"
                  />
                </div>

                {/* Mobile: compact label + visual toggle (keeps Switch for accessibility) */}
                <div className="flex sm:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                    aria-pressed={webSearchEnabled}
                    aria-label={webSearchEnabled ? "Qidiruv yoqilgan" : "Qidiruv o'chirilgan"}
                    className={cn(
                      "flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm",
                      webSearchEnabled ? "ring-1 ring-emerald-300" : ""
                    )}
                  >
                    <span className="font-medium">Qidiruv</span>
                    <span className={cn("ml-2 inline-flex h-5 w-9 items-center rounded-full p-1", webSearchEnabled ? "bg-emerald-400/30" : "bg-gray-200")}> 
                      <span className={cn("block h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform", webSearchEnabled ? "translate-x-3 bg-emerald-500" : "translate-x-0 bg-gray-400")} />
                    </span>
                  </button>
                  <Switch
                    checked={webSearchEnabled}
                    onCheckedChange={setWebSearchEnabled}
                    className="sr-only"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:flex sm:justify-end">
              <motion.div
                whileHover={btnHover}
                whileTap={tapScale}
                transition={SPRING_BUTTON}
              >
                <Button
                  size="lg"
                  type="button"
                  className="w-full gap-2 bg-foreground text-background shadow-md transition-all duration-300 hover:bg-foreground/90 hover:shadow-lg sm:w-auto focus:outline-none focus-visible:ring-0"
                  disabled={
                    isCreating || (!(presentationInput.trim() || analysisResult?.prompt?.trim())) || insufficientStars
                  }
                  onClick={() => void createPresentation(analysisResult?.prompt)}
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
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}