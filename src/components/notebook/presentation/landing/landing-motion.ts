export const LANDING_EASE = [0.25, 0.46, 0.45, 0.94] as const;
export const SPRING_HOVER = { type: "spring", stiffness: 300, damping: 22 } as const;
export const SPRING_BUTTON = { type: "spring", stiffness: 400, damping: 20 } as const;

// Blur-slide-up: premium entrance — opacity + blur + y combined
export const fadeInUp = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 28 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.7, ease: LANDING_EASE },
  },
};

// Simple fade for header (no y movement)
export const fadeIn = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: LANDING_EASE },
  },
};

// Scale + blur entrance for cards
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: LANDING_EASE },
  },
};

// Image/media entrance — spring overshoot
export const imageEntrance = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

// Card hover — spring so'nib boruvchi
export const hoverLift = {
  y: -7,
  scale: 1.018,
  transition: SPRING_HOVER,
};

// Button hover — spring
export const hoverScale = {
  scale: 1.05,
  transition: SPRING_BUTTON,
};

export const tapScale = {
  scale: 0.97,
  transition: { duration: 0.15 },
};

// Reduced motion variants — faqat opacity, blur/scale/y yo'q
export const reducedFadeInUp = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

export const reducedScaleIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55 } },
};

export const reducedFadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const reducedHoverLift = { y: 0, scale: 1 };
export const reducedHoverScale = { scale: 1 };
