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
import {
  fadeInUp,
  hoverLift,
  scaleIn,
  staggerContainer,
  tapScale,
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
  return (
    <motion.div
      className={cn("mx-auto max-w-3xl text-center", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
    >
      <motion.p
        variants={fadeInUp}
        className="text-sm font-semibold text-muted-foreground"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={fadeInUp}
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
    title: "AI-Powered Content",
    description:
      "Generate complete presentations on any topic with advanced AI technology.",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description: "Choose from built-in themes or create your own from scratch.",
  },
  {
    icon: ImageIcon,
    title: "Image Generation",
    description: "Automatically generate relevant images using various AI models.",
  },
  {
    icon: Users,
    title: "Audience-Focused",
    description: "Switch between professional and casual presentation styles.",
  },
  {
    icon: Clock,
    title: "Real-Time Generation",
    description: "Watch your presentation build live as content is created.",
  },
  {
    icon: Pencil,
    title: "Full Editability",
    description: "Modify text, fonts, and design elements as needed.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Powerful Features"
        title="Everything you need to create amazing presentations"
      />

      <motion.div
        className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={staggerContainer}
      >
        {FEATURES.map((feature) => (
          <motion.article
            key={feature.title}
            variants={scaleIn}
            whileHover={hoverLift}
            className={cn(
              "rounded-2xl border border-border/50 bg-card/50 p-6",
              "transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg",
            )}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors duration-300 group-hover:bg-primary/10">
              <feature.icon className="h-5 w-5 text-foreground" />
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

const OPEN_SOURCE = [
  {
    icon: Lock,
    title: "Transparency",
    description:
      "Our code is open for everyone to see, review, and improve. No black boxes or hidden agendas.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "We believe in the power of community collaboration to create better software for everyone.",
  },
  {
    icon: Code2,
    title: "Education",
    description:
      "Learn from our codebase, contribute to it, and grow your skills while helping others.",
  },
  {
    icon: Heart,
    title: "Free Forever",
    description:
      "Our core features will always remain free and open source, ensuring accessibility for everyone.",
  },
] as const;

export function LandingOpenSource() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Open Source"
        title="Why we're open source"
      />

      <motion.div
        className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {OPEN_SOURCE.map((item) => (
          <motion.div
            key={item.title}
            variants={fadeInUp}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.25 }}
            className="flex gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted transition-colors duration-300 hover:bg-primary/10">
              <item.icon className="h-5 w-5" />
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
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <motion.div whileHover={hoverLift} whileTap={tapScale}>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a
              href="https://github.com/allweone/presentation-ai"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4" />
              Contribute on GitHub
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function LandingDemo() {
  return (
    <section id="demo" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="See it in action" title="Watch how it works" />

      <motion.div
        className="mx-auto mt-12 max-w-4xl"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.01 }}
      >
        <div
          className={cn(
            "aspect-video w-full overflow-hidden rounded-2xl border border-border/60",
            "bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70",
            "shadow-2xl transition-shadow duration-500 hover:shadow-[0_24px_60px_-12px_hsl(var(--foreground)/0.35)]",
          )}
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-background/90">
            <Sparkles className="h-10 w-10 opacity-80" />
            <p className="text-lg font-medium">Demo video placeholder</p>
            <p className="max-w-md text-sm opacity-70">
              Replace with your product demo embed when ready.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const PLANS = [
  {
    name: "Free",
    description: "Perfect for individuals getting started",
    price: "$0",
    cta: "Get Started",
    highlighted: false,
    features: [
      "5 presentations per month",
      "Basic AI generation",
      "Standard templates",
      "Export to PDF",
    ],
  },
  {
    name: "Pro",
    description: "Everything you need for professional presentations",
    price: "$0",
    period: "per month",
    cta: "Start Free Trial",
    highlighted: true,
    features: [
      "Unlimited presentations",
      "Advanced AI generation",
      "Premium templates",
      "Export to multiple formats",
      "Team collaboration",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "Custom solutions for larger teams",
    price: "Contact",
    cta: "Contact Us",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Custom templates",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "Volume discounts",
    ],
  },
] as const;

export function LandingPricing() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        className="mb-2"
      />
      <motion.p
        className="mx-auto max-w-xl text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Choose the plan that works best for you and your team.
      </motion.p>

      <motion.div
        className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {PLANS.map((plan) => (
          <motion.div
            key={plan.name}
            variants={scaleIn}
            whileHover={hoverLift}
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
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="text-primary">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <span className="text-4xl font-bold">{plan.price}</span>
              {"period" in plan && plan.period ? (
                <span className="text-muted-foreground"> {plan.period}</span>
              ) : null}
            </div>
            <Button
              className={cn(
                "mt-6 w-full transition-all duration-300",
                plan.highlighted && "bg-foreground text-background hover:bg-foreground/90",
              )}
              variant={plan.highlighted ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function LandingCommunity() {
  return (
    <section id="community" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeInUp} className="text-3xl font-bold sm:text-4xl">
          Join our Community
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mt-4 text-muted-foreground sm:text-lg"
        >
          Share your ideas, ask questions, and collaborate with other developers.
          The fastest growing community for AI web agents.
        </motion.p>
        <motion.div
          variants={fadeInUp}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.div whileHover={hoverLift} whileTap={tapScale}>
            <Button
              asChild
              size="lg"
              className="gap-2 bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
            >
              <a href="https://discord.com" target="_blank" rel="noreferrer">
                Join Discord
              </a>
            </Button>
          </motion.div>
          <motion.div whileHover={hoverLift} whileTap={tapScale}>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <a href="https://x.com/allweone" target="_blank" rel="noreferrer">
                Follow @allweone
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
    <footer className="border-t border-border/50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ALLWEONE®. All rights reserved.</p>
      </div>
    </footer>
  );
}
