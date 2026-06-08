"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Clock,
  Code2,
  Github,
  Heart,
  ImageIcon,
  Lock,
  Palette,
  Pencil,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import * as motion from "motion/react-client";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  fadeInUp,
  reducedFadeInUp,
  hoverLift,
  reducedHoverLift,
  hoverScale,
  reducedHoverScale,
  imageEntrance,
  scaleIn,
  reducedScaleIn,
  staggerContainer,
  tapScale,
  SPRING_BUTTON,
  LANDING_EASE,
} from "./landing-motion";

function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const enter = shouldReduceMotion ? reducedFadeInUp : fadeInUp;

  return (
    <motion.div
      className={cn("mx-auto max-w-3xl text-center", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
    >
      <motion.p
        variants={enter}
        className="text-xs font-semibold text-muted-foreground sm:text-sm"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={enter}
        className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Zap,
    title: "AI yordamida kontent",
    description: "Ilg'or sun'iy intellekt texnologiyasi bilan har qanday mavzuda to'liq taqdimotlar yarating.",
  },
  {
    icon: Palette,
    title: "Maxsus mavzular",
    description: "Tayyor mavzularni tanlang yoki noldan o'zingiznikini yarating.",
  },
  {
    icon: ImageIcon,
    title: "Rasm generatsiyasi",
    description: "AI modellari yordamida avtomatik tarzda mos rasmlarni yarating.",
  },
  {
    icon: Users,
    title: "Auditoriyaga moslashuv",
    description: "Taqdimot uslublarini professional yoki erkin ko'rinishga o'zgartiring.",
  },
  {
    icon: Clock,
    title: "Real vaqtda yaratish",
    description: "Kontent yaratilayotganda taqdimotingiz jonli tarzda shakllanishini kuzating.",
  },
  {
    icon: Pencil,
    title: "To'liq tahrirlash",
    description: "Matnlar, shriftlar va dizayn elementlarini o'zingizga moslab o'zgartiring.",
  },
] as const;

export function LandingFeatures() {
  const shouldReduceMotion = useReducedMotion();
  const cardVariant = shouldReduceMotion ? reducedScaleIn : scaleIn;
  const cardHover = shouldReduceMotion ? reducedHoverLift : hoverLift;

  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Kuchli imkoniyatlar"
        title="Ajoyib taqdimotlar yaratish uchun barchasi mavjud"
      />

      <motion.div
        className="mx-auto w-full landing-container mt-14 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={staggerContainer}
      >
        {FEATURES.map((feature) => (
          <motion.article
            key={feature.title}
            variants={cardVariant}
            whileHover={cardHover}
            className={cn(
              "group rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-6",
              "transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg",
            )}
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-muted transition-colors duration-300 group-hover:bg-primary/10">
              <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-sm font-semibold sm:text-base">{feature.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:text-sm">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

const OPEN_SOURCE = [
  {
    icon: Lock,
    title: "Shaffoflik",
    description: "Kodimiz hamma uchun ochiq: ko'rishingiz, tekshirishingiz va yaxshilashingiz mumkin.",
  },
  {
    icon: Users,
    title: "Jamoa bilan birga",
    description: "Biz hamma uchun yaxshiroq dasturiy ta'minot yaratishda hamkorlik kuchiga ishonamiz.",
  },
  {
    icon: Code2,
    title: "Ta'lim",
    description: "Kodimizdan o'rganing, hissa qo'shing va o'z ko'nikmalaringizni oshiring.",
  },
  {
    icon: Heart,
    title: "Doimiy bepul",
    description: "Asosiy funksiyalarimiz doimo bepul va ochiq kodli bo'lib qoladi.",
  },
] as const;

export function LandingOpenSource() {
  const shouldReduceMotion = useReducedMotion();
  const enter = shouldReduceMotion ? reducedFadeInUp : fadeInUp;
  const btnHover = shouldReduceMotion ? reducedHoverScale : hoverScale;

  return (
    <section className="px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Ochiq kodli" title="Nega ochiq kodli loyihamiz?" />

      <motion.div
        className="mx-auto w-full landing-container mt-14 grid gap-8 sm:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {OPEN_SOURCE.map((item) => (
          <motion.div
            key={item.title}
            variants={enter}
            className="flex gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted transition-colors duration-300 hover:bg-primary/10">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-12 flex justify-center"
        initial={{ opacity: 0, filter: "blur(8px)", y: 16 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: LANDING_EASE }}
      >
        <motion.div
          whileHover={btnHover}
          whileTap={tapScale}
          transition={SPRING_BUTTON}
        >
          <Button asChild variant="outline" size="lg" className="gap-2">
              <a // GitHub havolasi to'g'irlandi
                href="https://github.com/sultaniyazz/TahlilAi"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub'da hissa qo'shish"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub'da hissa qo'shish
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function LandingDemo() {
  const shouldReduceMotion = useReducedMotion();
  const mediaVariant = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }
    : imageEntrance;

  return (
    <section id="demo" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Amalda ko'ring" title="Qanday ishlashini tomosha qiling" />

      <motion.div
        className="mx-auto w-full landing-container max-w-5xl mt-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={mediaVariant as any}
      >
        <div
          className={cn(
            "aspect-video w-full overflow-hidden rounded-2xl border border-border/60",
            "bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70",
            "shadow-2xl transition-shadow duration-500 hover:shadow-[0_24px_60px_-12px_hsl(var(--foreground)/0.35)]",
          )}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-background/90">
            <Sparkles className="h-10 w-10 opacity-80" aria-hidden="true" />
            <p className="text-lg font-medium">Demo video joyi</p>
            <p className="max-w-md text-sm opacity-70">
              Mahsulotingiz tayyor bo'lganda bu yerga demo videoni joylang.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const PLANS = [
  {
    name: "Bepul",
    description: "Endi boshlayotganlar uchun mukammal",
    price: "$0",
    cta: "Boshlash",
    highlighted: false,
    features: [
      "Oyiga 5 ta taqdimot",
      "Asosiy AI generatsiyasi",
      "Standart shablonlar",
      "PDF formatida eksport",
    ],
  },
  {
    name: "Pro",
    description: "Professional taqdimotlar uchun kerakli hamma narsa",
    price: "$9", // Pro plan uchun realroq narx yoki "Tez kunda"
    period: "oyiga",
    cta: "Bepul sinab ko'rish",
    highlighted: true,
    features: [
      "Cheksiz taqdimotlar",
      "Ilg'or AI generatsiyasi",
      "Premium shablonlar",
      "Ko'p formatli eksport",
      "Jamoaviy hamkorlik",
      "Ustuvor qo'llab-quvvatlash",
    ],
  },
  {
    name: "Enterprise",
    description: "Katta jamoalar uchun maxsus yechimlar",
    price: "Bog'lanish",
    cta: "Biz bilan bog'laning",
    highlighted: false,
    features: [
      "Pro'dagi barcha imkoniyatlar",
      "Maxsus shablonlar",
      "Yuqori darajadagi xavfsizlik",
      "Shaxsiy yordam",
      "Maxsus integratsiyalar",
      "Hajm bo'yicha chegirmalar",
    ],
  },
] as const;

export function LandingPricing() {
  const shouldReduceMotion = useReducedMotion();
  const cardVariant = shouldReduceMotion ? reducedScaleIn : scaleIn;
  const cardHover = shouldReduceMotion ? reducedHoverLift : hoverLift;

  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Narxlar"
        title="Oddiy va shaffof narxlar"
        className="mb-2"
      />
      <motion.p
        className="mx-auto max-w-xl text-center text-muted-foreground"
        initial={{ opacity: 0, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: LANDING_EASE }}
      >
        O'zingiz va jamoangiz uchun eng mos rejani tanlang.
      </motion.p>

      <motion.div
        className="mx-auto w-full landing-container mt-14 grid gap-6 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {PLANS.map((plan) => {
          const isExpanded = expandedPlan === plan.name;
          return (
            <motion.div
              key={plan.name}
              variants={cardVariant}
              whileHover={cardHover}
              className={cn(
                "flex flex-col rounded-2xl border p-6 transition-shadow duration-300",
                plan.highlighted
                  ? "border-foreground bg-card shadow-xl"
                  : "border-border/60 bg-card/50 hover:shadow-lg",
              )}
            >
              <h3 className="text-lg font-bold sm:text-xl">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-4 flex-1 space-y-1.5 text-xs sm:mt-6 sm:space-y-2 sm:text-sm">
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-primary" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.ul
                    key={`extra-features-${plan.name}`}
                    id={`plan-features-${plan.name}`}
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)", y: 10 }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", y: -6 }}
                    transition={{ duration: 0.3, ease: LANDING_EASE }}
                    className="mt-2 space-y-2 text-sm"
                  >
                    {plan.features.slice(3).map((feature) => ( // Kengaytirilgan funksiyalar ro'yxatidagi belgilash uchun aria-hidden qo'shildi
                      <li key={feature} className="flex gap-2 text-muted-foreground">
                        <span aria-hidden="true">✓</span>
                        {feature}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>

              {plan.features.length > 3 && (
                <button
                  type="button"
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.name)}
                  className="mt-3 text-left text-xs text-muted-foreground underline-offset-2 hover:underline"
                  aria-expanded={isExpanded}
                  aria-controls={`plan-features-${plan.name}`}
                >
                  {isExpanded ? "Yashirish" : `+${plan.features.length - 3} ta qo'shimcha funksiya`}
                </button>
              )}

              <div className="mt-8">
                <span className="text-3xl font-bold sm:text-4xl">{plan.price}</span>
                {"period" in plan && plan.period ? (
                  <span className="text-muted-foreground"> {plan.period}</span>
                ) : null}
              </div>
              <Button
                type="button"
                className={cn(
                  "mt-6 w-full transition-all duration-300",
                  plan.highlighted &&
                    "bg-foreground text-background hover:bg-foreground/90",
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
export function LandingCommunity() {
  const shouldReduceMotion = useReducedMotion();
  const enter = shouldReduceMotion ? reducedFadeInUp : fadeInUp;
  const btnHover = shouldReduceMotion ? reducedHoverScale : hoverScale;

  return (
    <section id="community" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h2 variants={enter} className="text-2xl font-bold sm:text-3xl md:text-4xl">
          Jamiyatimizga qo'shiling
        </motion.h2>
        <motion.p
          variants={enter}
          className="mt-4 text-muted-foreground sm:text-lg"
        >
          G'oyalaringizni ulashing, savollar bering va boshqa dasturchilar bilan hamkorlik qiling.
          AI veb-agentlari uchun eng tez o'sayotgan jamoa.
        </motion.p>
        <motion.div
          variants={enter}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.div
            whileHover={btnHover}
            whileTap={tapScale}
            transition={SPRING_BUTTON}
          >
            <Button
              asChild
              size="lg"
              className="gap-2 bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
            >
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord serverimizga qo'shiling"
              >
                Discord'ga qo'shilish
              </a>
            </Button>
          </motion.div>
          <motion.div
            whileHover={btnHover}
            whileTap={tapScale}
            transition={SPRING_BUTTON}
          >
            <Button asChild size="lg" variant="outline" className="gap-2">
              <a
                href="https://x.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Our X (Twitter) profile"
              >
                Kuzatish
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-12 text-sm text-muted-foreground transition-colors duration-300 dark:border-border/30 sm:px-6">
      <div className="mx-auto w-full landing-container text-center">
        <p>© {new Date().getFullYear()} TahlilAi. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}