"use client";

import { createEmptyPresentation } from "@/app/_actions/notebook/presentation/presentationActions";
import { ThemeBackground } from "@/components/notebook/presentation/components/theme/ThemeBackground";
import { Spinner } from "@/components/ui/spinner";
import { usePresentationState } from "@/states/presentation-state";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// ... getSlideCount funksiyasi o'zgarishsiz ...

function getSlideCount(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 5;
  }
  return Math.max(1, Math.floor(parsed));
}

export default function Page() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const params = useSearchParams();
  const handledRequestRef = useRef<string | null>(null);
  const themeMode = resolvedTheme === "dark" ? "dark" : "light";
  const createTheme = resolvedTheme === "dark" ? "ebony" : "mystique";
  const prompt = params.get("prompt")?.trim() ?? "";
  const language = params.get("language") ?? "en-US";
  const noOfSlides = getSlideCount(params.get("noOfSlides"));
  const webSearchEnabled = params.get("webSearch") === "true";
  
  const {
    setPresentationInput,
    setLanguage: setPresentationLanguage,
    setNumSlides,
    setCurrentPresentation,
    setIsGeneratingOutline,
    startOutlineGeneration,
    setWebSearchEnabled,
    setTheme: setPresentationTheme,
    consumePendingCreateRequest,
    textContent,
  } = usePresentationState();

  const queryClient = useQueryClient();

  const handleDirectGeneration = async (promptText: string, lang: string) => {
    try {
      setIsGeneratingOutline(true);
      setPresentationTheme(createTheme);

      const result = await createEmptyPresentation({
        title: promptText.substring(0, 50) || "Nomsiz taqdimot",
        theme: createTheme,
        language: lang,
        slides: noOfSlides,
        textContent,
      });

      if (result.success && result.presentation) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["user-stars"] }),
          queryClient.invalidateQueries({ queryKey: ["presentations"] }),
        ]);

        setCurrentPresentation(
          result.presentation.id,
          result.presentation.title,
        );

        startOutlineGeneration();
        router.replace(`/presentation/generate/${result.presentation.id}`);
      } else {
        setIsGeneratingOutline(false);
        toast.error(result.message || "Taqdimotni yaratishda xatolik yuz berdi");
        router.push("/presentation");
      }
    } catch (error) {
      setIsGeneratingOutline(false);
      console.error("Taqdimot yaratishda xatolik:", error);
      toast.error("Taqdimotni yaratishda xatolik yuz berdi");
      router.push("/presentation");
    }
  };

  useEffect(() => {
    if (handledRequestRef.current) {
      return;
    }

    const pendingCreateRequest = consumePendingCreateRequest();
    const promptText = prompt || pendingCreateRequest?.prompt?.trim();
    const requestLanguage = pendingCreateRequest?.language || language;
    const requestNumSlides = pendingCreateRequest?.numSlides ?? noOfSlides;
    const requestWebSearchEnabled =
      pendingCreateRequest?.webSearchEnabled ?? webSearchEnabled;

    if (!promptText) {
      router.replace("/presentation");
      return;
    }

    handledRequestRef.current = promptText;
    setPresentationInput(promptText);
    setPresentationLanguage(requestLanguage);
    setNumSlides(requestNumSlides);
    setWebSearchEnabled(requestWebSearchEnabled);
    handleDirectGeneration(promptText, requestLanguage);
  }, [consumePendingCreateRequest, handleDirectGeneration, language, noOfSlides, prompt, router, setNumSlides, setPresentationInput, setPresentationLanguage, setWebSearchEnabled, webSearchEnabled]);

  if (handledRequestRef.current || prompt) {
    return (
      <ThemeBackground
        themeOverride={createTheme}
        themeModeOverride={themeMode}
      >
        <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
          <div className="relative">
            <Spinner className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Taqdimot rejasi tayyorlanmoqda</h2>
            <p className="text-muted-foreground">Iltimos, bir oz kuting...</p>
          </div>
        </div>
      </ThemeBackground>
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Spinner size={32} />
      </div>
    </div>
  );
}