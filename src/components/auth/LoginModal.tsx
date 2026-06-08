"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoginModal } from "@/stores/useLoginModal";
import { BarChart3, CheckCircle2, Layers, Sparkles, Zap } from "lucide-react";
import { signIn } from "next-auth/react";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: <Sparkles className="h-4 w-4 text-amber-500" />,
    label: "AI bilan prezentatsiya yarating",
    sub: "Sekundlar ichida chiroyli slidlar",
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
    label: "Grafik va infografika",
    sub: "50+ vizualizatsiya turlari",
  },
  {
    icon: <Layers className="h-4 w-4 text-violet-500" />,
    label: "38 ta tayyor mavzu",
    sub: "Professional dizayn shablonlar",
  },
  {
    icon: <Zap className="h-4 w-4 text-green-500" />,
    label: "100 ta bepul stars",
    sub: "Ro'yxatdan o'tishda sovg'a",
  },
] as const;

export function LoginModal() {
  const { isOpen, close } = useLoginModal();

  const handleGoogleSignIn = () => {
    void signIn("google", { callbackUrl: "/presentation" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[420px] sm:rounded-2xl">

        {/* Top gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 pt-8 pb-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg font-bold tracking-tight text-white">TahlilAi</span>
              <span className="inline-flex h-5 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 text-xs font-medium text-amber-300">
                <Sparkles className="h-2.5 w-2.5" />
                AI
              </span>
            </div>

            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-xl font-bold leading-tight text-white sm:text-2xl">
                Ajoyib prezentatsiyalar yarating
              </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 sm:text-sm">
                Kirish qiling va daqiqalar ichida professional slidlar tayyorlang.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Features list */}
        <div className="bg-muted/30 px-8 py-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border">
                  {f.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight truncate">{f.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-8 py-6 space-y-4 bg-background">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3 border text-sm font-medium shadow-sm hover:bg-muted/50 transition-all"
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Google bilan davom eting
          </Button>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Kredit karta shart emas
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Darhol bepul boshlash
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Davom etish orqali{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Foydalanish shartlari
            </a>{" "}
            va{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Maxfiylik siyosati
            </a>
            ga rozisiz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
