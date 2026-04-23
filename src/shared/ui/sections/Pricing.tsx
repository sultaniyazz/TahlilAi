import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Zap, Building2 } from 'lucide-react';
import { Switch } from '@/shared/ui/switch';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ElementType;
  features: { text: string; included: boolean }[];
  limits: {
    exports: string;
    projects: string;
    storage: string;
  };
  isPopular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Sparkles,
    features: [
      { text: '3 exports per month', included: true },
      { text: '5 projects', included: true },
      { text: 'Basic templates', included: true },
      { text: '720p export quality', included: true },
      { text: 'PNG export only', included: true },
      { text: 'Premium templates', included: false },
      { text: 'Brand kit', included: false },
      { text: 'Team collaboration', included: false },
    ],
    limits: {
      exports: '3/month',
      projects: '5',
      storage: '100 MB',
    },
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious creators',
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: Zap,
    features: [
      { text: 'Unlimited exports', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'All templates', included: true },
      { text: '4K export quality', included: true },
      { text: 'PNG, PDF & SVG', included: true },
      { text: 'Premium templates', included: true },
      { text: 'Brand kit', included: true },
      { text: 'Team collaboration', included: false },
    ],
    limits: {
      exports: 'Unlimited',
      projects: 'Unlimited',
      storage: '10 GB',
    },
    isPopular: true,
    cta: 'Start Pro Trial',
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams and agencies',
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: Building2,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 team members', included: true },
      { text: 'Shared brand kits', included: true },
      { text: 'Collaborative editing', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'SSO authentication', included: true },
      { text: 'Custom integrations', included: true },
    ],
    limits: {
      exports: 'Unlimited',
      projects: 'Unlimited',
      storage: '100 GB',
    },
    cta: 'Contact Sales',
  },
];

function PriceDisplay({ monthlyPrice, yearlyPrice, isYearly }: { 
  monthlyPrice: number; 
  yearlyPrice: number; 
  isYearly: boolean;
}) {
  const price = isYearly ? yearlyPrice / 12 : monthlyPrice;
  const displayPrice = price === 0 ? '0' : price.toFixed(price % 1 === 0 ? 0 : 2);
  
  return (
    <div className="flex items-baseline gap-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={isYearly ? 'yearly' : 'monthly'}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-bold text-white"
        >
          ${displayPrice}
        </motion.span>
      </AnimatePresence>
      <span className="text-white/50">/month</span>
    </div>
  );
}

function PricingCard({ plan, isYearly, index }: { plan: PricingPlan; isYearly: boolean; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative glass-card p-6 lg:p-8 ${
        plan.isPopular ? 'lg:scale-105 lg:-my-4' : ''
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="gradient-border-animated px-4 py-1.5 rounded-full">
            <span className="text-sm font-medium text-white">Most Popular</span>
          </div>
        </div>
      )}
      
      {/* Plan Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          plan.isPopular 
            ? 'bg-gradient-to-br from-violet-500 to-pink-500' 
            : 'bg-white/10'
        }`}>
          <plan.icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          <p className="text-sm text-white/50">{plan.description}</p>
        </div>
      </div>
      
      {/* Price */}
      <div className="mb-6">
        <PriceDisplay monthlyPrice={plan.monthlyPrice} yearlyPrice={plan.yearlyPrice} isYearly={isYearly} />
        {isYearly && plan.yearlyPrice > 0 && (
          <p className="text-sm text-emerald-400 mt-1">
            Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toFixed(0)}/year
          </p>
        )}
      </div>
      
      {/* Limits */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-2 py-1 text-xs bg-white/5 rounded-lg text-white/60">
          {plan.limits.exports} exports
        </span>
        <span className="px-2 py-1 text-xs bg-white/5 rounded-lg text-white/60">
          {plan.limits.projects} projects
        </span>
        <span className="px-2 py-1 text-xs bg-white/5 rounded-lg text-white/60">
          {plan.limits.storage} storage
        </span>
      </div>
      
      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-white/20 flex-shrink-0 mt-0.5" />
            )}
            <span className={feature.included ? 'text-white/80' : 'text-white/30'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      
      {/* CTA Button */}
      <motion.button
        className={`w-full py-3 rounded-xl font-medium transition-all ${
          plan.isPopular
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

export function Pricing() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(false);
  
  return (
    <section id="pricing" className="relative py-20 lg:py-32" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-[#0F0F11]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-white/70">Simple Pricing</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your{' '}
            <span className="gradient-text-full">Creative Plan</span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Start free, upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-white/50'}`}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-white/50'}`}>
              Yearly
              <span className="ml-2 text-xs text-emerald-400">Save 20%</span>
            </span>
          </div>
        </motion.div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} isYearly={isYearly} index={index} />
          ))}
        </div>
        
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-sm mb-4">Trusted by 10,000+ creators worldwide</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {['Google', 'Meta', 'Amazon', 'Netflix', 'Spotify'].map((company) => (
              <span key={company} className="text-white/40 font-semibold">{company}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

