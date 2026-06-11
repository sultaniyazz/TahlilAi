"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Clock,
  ImageIcon,
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
        className="text-sm font-semibold text-muted-foreground"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={enter}
        className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl"
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
        className="mx-auto w-full max-w-[75vw] mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              "group rounded-2xl border border-border/50 bg-card/50 p-6",
              "transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg",
            )}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors duration-300 group-hover:bg-primary/10">
              <feature.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

// ─── TESTIMONIALS DATA ───────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Aziz Toshmatov",
    role: "Marketing menejeri",
    company: "TechUz",
    avatar: "AT",
    color: "from-violet-500 to-purple-600",
    text: "TahlilAi bilan 20 daqiqada mijozlarimiz uchun professional prezentatsiya tayyorladim. Avval bu ish yarim kun vaqt olardi. Infografika va grafiklar avtomatik chiqishi juda qulay!",
  },
  {
    name: "Dilnoza Yusupova",
    role: "Biznes tahlilchi",
    company: "Kapital Bank",
    avatar: "DY",
    color: "from-pink-500 to-rose-600",
    text: "Hisobotlarni tayyorlash uchun ideal vosita. AI statistik ma'lumotlarni o'zi grafikka aylantiradi, men faqat mazmuniga e'tibor beraman. Hamkasblarga albatta tavsiya qilaman.",
  },
  {
    name: "Jasur Rahimov",
    role: "Startup asoschisi",
    company: "GreenTech UZ",
    avatar: "JR",
    color: "from-emerald-500 to-teal-600",
    text: "Investorlar uchun pitch deck tayyorlashda TahlilAi'ni ishlatdim. Natija hayratlanarli — professional ko'rinish, aniq ma'lumotlar. Investorlar ham taqdimot sifatini alohida ta'kidladi.",
  },
  {
    name: "Malika Karimova",
    role: "O'qituvchi",
    company: "TATU",
    avatar: "MK",
    color: "from-amber-500 to-orange-600",
    text: "Talabalarim uchun dars materiallarini tayyorlashda foydalanam. Har bir mavzu uchun chiroyli, tushunarli slaydlar — va bularning hammasi bir necha daqiqada. Vaqtimni juda tejayapti.",
  },
  {
    name: "Sardor Mirzayev",
    role: "Loyiha menejeri",
    company: "Uzum Market",
    avatar: "SM",
    color: "from-blue-500 to-indigo-600",
    text: "Haftalik hisobot prezentatsiyalarini avtomatlashtirdim. Endi jamoam bilan uchrashuvlarga doim tayyor bo'laman. Vaqt tejalishi — haftasiga kamida 3 soat.",
  },
  {
    name: "Nilufar Hasanova",
    role: "PR mutaxassisi",
    company: "MediaGroup",
    avatar: "NH",
    color: "from-cyan-500 to-sky-600",
    text: "Mijozlar uchun brend taqdimotlari, PR hisobotlar, media-kit — hammasi TahlilAi orqali. Dizayn sifati juda yuqori, mavzular professional ko'rinadi.",
  },
  {
    name: "Bobur Aliyev",
    role: "CEO",
    company: "StartupHub UZ",
    avatar: "BA",
    color: "from-orange-500 to-red-500",
    text: "Jamoamiz har haftada 4-5 ta taqdimot tayyorlaydi. TahlilAi bu jarayonni 10 barobarga tezlashtirdi. Endi dizayner kutmaymiz, AI hamma ishni qiladi.",
  },
  {
    name: "Zulfiya Normatova",
    role: "Moliya direktori",
    company: "Ipoteka Bank",
    avatar: "ZN",
    color: "from-teal-500 to-green-600",
    text: "Kvartal moliyaviy hisobotlarimizni tayyorlash uchun TahlilAi'dan foydalanamiz. Grafiklar va jadvallar avtomatik, aniq va chiroyli chiqadi.",
  },
] as const;

// ─── PARTNERS DATA ────────────────────────────────────────────────
const PARTNERS = [
  { name: "Uzum Market", abbr: "U", color: "from-violet-600 to-purple-700" },
  { name: "Kapital Bank", abbr: "KB", color: "from-blue-600 to-indigo-700" },
  { name: "TechUz", abbr: "T", color: "from-emerald-600 to-teal-700" },
  { name: "TATU", abbr: "T", color: "from-amber-600 to-orange-700" },
  { name: "Ipoteka Bank", abbr: "IB", color: "from-sky-600 to-blue-700" },
  { name: "GreenTech UZ", abbr: "G", color: "from-green-600 to-emerald-700" },
  { name: "MediaGroup", abbr: "MG", color: "from-rose-600 to-pink-700" },
  { name: "StartupHub UZ", abbr: "SH", color: "from-orange-600 to-red-700" },
  { name: "Digital UZ", abbr: "D", color: "from-indigo-600 to-violet-700" },
  { name: "Agrobank", abbr: "AG", color: "from-lime-600 to-green-700" },
] as const;

function StarRating() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 yulduz">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:w-[400px]">
      <StarRating />
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t pt-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-xs font-bold text-white`}>
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingOpenSource() {
  return (
    <section className="overflow-hidden py-20" id="testimonials">
      <SectionHeading
        eyebrow="Foydalanuvchilar fikri"
        title="Minglar ishonadi, siz ham sinab ko'ring"
      />

      <motion.div
        className="mx-auto mt-10 flex justify-center gap-3 px-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {[
          { value: "10,000+", label: "Foydalanuvchi" },
          { value: "5", label: "O'rtacha baho" },
          { value: "50,000+", label: "Prezentatsiya" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card/60 px-5 py-3 text-center">
            <p className="text-xl font-bold sm:text-2xl">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Row 1 — chap tomonga */}
      <div className="relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4 animate-marquee-left" style={{ animationDuration: "38s" }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 — o'ng tomonga */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4 animate-marquee-right" style={{ animationDuration: "44s" }}>
            {[...[...TESTIMONIALS].reverse(), ...[...TESTIMONIALS].reverse()].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPartners() {
  return (
    <section className="overflow-hidden border-y bg-muted/20 py-16" id="partners">
      <motion.div
        className="px-4 text-center"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ishonchli hamkorlar
        </p>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">
          Yetakchi kompaniyalar tanlagan vosita
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          O'zbekistondagi yirik bank, startup va ta'lim tashkilotlari TahlilAi'dan foydalanadi.
        </p>
      </motion.div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
        <div className="flex gap-4 overflow-hidden">
          <div className="flex gap-4 animate-marquee-left" style={{ animationDuration: "22s" }}>
            {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((p, i) => (
              <div key={i} className="flex shrink-0 items-center gap-3 rounded-2xl border bg-card px-5 py-3 shadow-sm">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-xs font-bold text-white`}>
                  {p.abbr}
                </div>
                <span className="whitespace-nowrap text-sm font-semibold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 px-4 sm:grid-cols-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {[
          { value: "10+", label: "Hamkor kompaniya" },
          { value: "98%", label: "Mamnunlik darajasi" },
          { value: "5x", label: "Vaqt tejalishi" },
          { value: "24/7", label: "Qo'llab-quvvatlash" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card px-4 py-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
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
        className="mx-auto w-full max-w-[80vw] sm:max-w-[70vw] mt-12"
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
        className="mx-auto w-full max-w-[75vw] mt-14 grid gap-6 lg:grid-cols-3"
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
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-2 text-sm">
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
                <span className="text-4xl font-bold">{plan.price}</span>
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
        <motion.h2 variants={enter} className="text-3xl font-bold sm:text-4xl">
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
                href="https://t.me/+Zy-i2-HElzg4N2Yy"
                target="_blank"
                rel="noreferrer"
                aria-label="Discord serverimizga qo'shiling"
              >
                Telegramga qo'shilish
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
                href="https://t.me/+Zy-i2-HElzg4N2Yy"
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
      <div className="mx-auto w-full max-w-[75vw] text-center">
        <p>© {new Date().getFullYear()} TahlilAi. Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}