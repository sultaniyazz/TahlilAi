"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const FEATURES = [
  "AI-powered slides",
  "100 free stars on signup",
  "Beautiful themes",
] as const;

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/presentation";
  const error = searchParams.get("error");
  const isNewUser = !searchParams.get("callbackUrl");

  const handleSignIn = () => {
    void signIn("google", { callbackUrl });
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white lg:flex">
        <Link href="/presentation" className="flex items-center gap-2">
          <span className="text-xl font-semibold">TahlilAi</span>
          <span className="inline-flex h-6 items-center justify-center rounded-full border border-white/20 px-2">
            <Sparkles className="h-3 w-3" />
          </span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Presentations that
            <br />
            impress instantly
          </h2>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Check className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="pointer-events-none absolute -right-20 top-1/3 h-64 w-64 rounded-3xl bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-1/4 h-48 w-48 rounded-full bg-primary/20 blur-2xl" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewUser ? "Get started free" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              Sign in with your Google account to continue
            </p>
          </div>

          {error && (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              Authentication failed. Please try again.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="h-12 w-full gap-3 border-border text-base font-medium shadow-sm"
            onClick={handleSignIn}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <p className="text-center text-xs text-muted-foreground lg:text-left">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
