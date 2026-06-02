"use client";

import { generateImageAction } from "@/app/_actions/apps/image-studio/generate";
import { getImageFromPixabay } from "@/app/_actions/apps/image-studio/pixabay";
import { getImageFromUnsplash } from "@/app/_actions/apps/image-studio/unsplash";
import { updatePresentation } from "@/app/_actions/notebook/presentation/presentationActions";
import { generateSlideImageAction } from "@/app/_actions/presentation/generate-slide-image";
import {
  getMessageText,
  getToolInputArgs,
  getToolName,
  getToolOutput,
  getToolState,
  isToolPart,
} from "@/lib/ai/uiMessageParts";
import { isWebSearchToolName } from "@/lib/ai/tool-names";
import { DEFAULT_OPENROUTER_MODEL } from "@/lib/modelPicker";
import { createLogger } from "@/lib/observability/logger";
import { useDebouncedSave } from "@/hooks/presentation/useDebouncedSave";
import { usePresentationState } from "@/states/presentation-state";
import { useChat, useCompletion } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { SlideParser } from "../utils/parser";
import {
  serializeTemplateHintsForPrompt,
  serializeTemplatesForPrompt,
} from "../utils/template-serializer";

interface PresentationOutlineMessageMetadata {
  numberOfCards: number;
  language: string;
  modelId: string;
  modelProvider: "openai" | "ollama" | "lmstudio" | "openrouter";
  webSearch: boolean;
  presentationId: string | null;
  textContent: "minimal" | "concise" | "detailed" | "extensive";
  tone:
    | "auto"
    | "general"
    | "persuasive"
    | "inspiring"
    | "instructive"
    | "engaging";
  audience:
    | "auto"
    | "general"
    | "business"
    | "investor"
    | "teacher"
    | "student";
  scenario:
    | "auto"
    | "general"
    | "analysis-report"
    | "teaching-training"
  | "promotional-materials"
  | "public-speeches";
}

const generationLogger = createLogger("client:presentation-generation");

function stripXmlCodeBlock(input: string): string {
  let result = input.trim();
  if (result.startsWith("```xml")) {
    result = result.slice(6).trimStart();
  }
  if (result.endsWith("```")) {
    result = result.slice(0, -3).trimEnd();
  }
  return result;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof Response !== "undefined" && error instanceof Response) {
    return `${error.status} ${error.statusText}`;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error, Object.keys(error ?? {}), 2);
  } catch {
    return "An unknown error occurred.";
  }
}

function hasGeneratedOutline(outline: string[]): boolean {
  return outline.some((item) => item.trim().length > 0);
}

function parseOutlineItems(content: string): string[] {
  if (!/^#\s+/m.test(content)) {
    return [];
  }

  const sections = content.split(/^# /gm).filter(Boolean);
  return sections.length > 0
    ? sections.map((section) => `# ${section}`.trim())
    : [];
}

function usesStockSearchForPresentation(
  imageSource: "automatic" | "ai" | "stock",
): boolean {
  return imageSource === "automatic" || imageSource === "stock";
}

type RootImageGenerationResult = {
  success: boolean;
  image?: { url: string };
  error?: string;
  usedAiFallback?: boolean;
};

async function fetchStockRootImage(
  query: string,
  layoutType: string | undefined,
  stockImageProvider: string,
  imageSource: "automatic" | "ai" | "stock",
): Promise<RootImageGenerationResult> {
  if (imageSource === "stock" && stockImageProvider === "pixabay") {
    const pixabayResult = await getImageFromPixabay(query, layoutType);
    if (pixabayResult.success && pixabayResult.imageUrl) {
      return { success: true, image: { url: pixabayResult.imageUrl } };
    }
    return {
      success: false,
      error: pixabayResult.error ?? "No Pixabay images found",
    };
  }

  const unsplashResult = await getImageFromUnsplash(query, layoutType);
  if (unsplashResult.success && unsplashResult.imageUrl) {
    return { success: true, image: { url: unsplashResult.imageUrl } };
  }

  return {
    success: false,
    error: unsplashResult.error ?? "No Unsplash images found",
  };
}

export function PresentationGenerationManager() {
  const { resolvedTheme } = useTheme();
  const {
    numSlides,
    language,
    modelId,
    modelProvider,
    presentationInput,
    shouldStartOutlineGeneration,
    shouldStartPresentationGeneration,
    shouldStartImageSlideGeneration,
    webSearchEnabled,
    setIsGeneratingOutline,
    setShouldStartOutlineGeneration,
    setShouldStartPresentationGeneration,
    setShouldStartImageSlideGeneration,
    resetGeneration,
    setOutline,
    setSearchResults,
    setSlides,
    setIsGeneratingPresentation,
    setCurrentPresentation,
    currentPresentationId,
    imageModel,
    imageSource,
    rootImageGeneration,
    startRootImageGeneration,
    completeRootImageGeneration,
    failRootImageGeneration,
    isGeneratingPresentation,
    isGeneratingOutline,
    slides,
    textContent,
    tone,
    audience,
    scenario,
  } = usePresentationState();

  // Persist slide updates during generation using debounced saves to limit frequency
  const { save } = useDebouncedSave();

  // Create a ref for the streaming parser to persist between renders
  const streamingParserRef = useRef<SlideParser>(new SlideParser());
  // Add refs to track the animation frame IDs
  const slidesRafIdRef = useRef<number | null>(null);
  const outlineRafIdRef = useRef<number | null>(null);
  const outlineTransportRef = useRef<DefaultChatTransport<UIMessage> | null>(
    null,
  );
  const outlineBufferRef = useRef<string[] | null>(null);
  const searchResultsBufferRef = useRef<Array<{
    query: string;
    results: unknown[];
  }> | null>(null);
  // Track the last processed messages length to avoid unnecessary updates
  const lastProcessedMessagesLength = useRef<number>(0);
  // Track if title has already been extracted to avoid unnecessary processing
  const titleExtractedRef = useRef<boolean>(false);

  // Function to update slides using requestAnimationFrame
  const updateSlidesWithRAF = (): void => {
    const processedPresentationCompletion = stripXmlCodeBlock(
      presentationCompletion,
    );
    streamingParserRef.current.reset();
    streamingParserRef.current.parseChunk(processedPresentationCompletion);
    streamingParserRef.current.finalize();
    const allSlides = streamingParserRef.current.getAllSlides();
    // Merge any completed root image URLs from state into streamed slides
    const mergedSlides = allSlides.map((slide) => {
      const gen = rootImageGeneration[slide.id];
      if (gen?.status === "success" && slide.rootImage?.query) {
        return {
          ...slide,
          rootImage: {
            ...slide.rootImage,
            url: gen.url,
            imageSource: (imageSource === "stock" ? "search" : "generate") as
              | "search"
              | "generate",
          },
        };
      }
      return slide;
    });
    // For any slide that has a rootImage query but no url, ensure generation is tracked/started
    for (const slide of allSlides) {
      const slideId = slide.id;
      const rootImage = slide.rootImage;
      if (rootImage?.query && !rootImage.url) {
        const already = rootImageGeneration[slideId];
        if (!already || already.status === "error") {
          startRootImageGeneration(slideId, rootImage.query);
        }
      }
    }
    setSlides(mergedSlides);
    // Debounced save during generation to avoid excessive writes
    save();
    slidesRafIdRef.current = null;
  };

  // Function to extract title from content
  const extractTitle = (
    content: string,
  ): { title: string | null; cleanContent: string } => {
    const titleMatch = content.match(/<TITLE>(.*?)<\/TITLE>/i);
    if (titleMatch?.[1]) {
      const title = titleMatch[1].trim();
      const cleanContent = content.replace(/<TITLE>.*?<\/TITLE>/i, "").trim();
      return { title, cleanContent };
    }
    return { title: null, cleanContent: content };
  };

  const processMessages = (messages: typeof outlineMessages): void => {
    if (messages.length <= 1) return;
    const searchResults: Array<{ query: string; results: unknown[] }> = [];
    let latestTitle: string | null = null;
    let latestOutlineItems: string[] = [];

    for (const message of messages) {
      for (const part of message.parts) {
        if (!isToolPart(part)) {
          continue;
        }

        const invocation = {
          toolName: getToolName(part),
          state: getToolState(part),
          args: getToolInputArgs(part),
          result: getToolOutput(part),
        };

        if (
          isWebSearchToolName(invocation.toolName) &&
          invocation.state === "result" &&
          invocation.result
        ) {
          const argsRecord =
            typeof invocation.args === "object" && invocation.args !== null
              ? (invocation.args as Record<string, unknown>)
              : {};
          const query =
            typeof argsRecord.query === "string"
              ? argsRecord.query
              : "Unknown query";

          let parsedResult: unknown;
          try {
            parsedResult =
              typeof invocation.result === "string"
                ? JSON.parse(invocation.result)
                : invocation.result;
          } catch {
            parsedResult = invocation.result;
          }

          searchResults.push({
            query,
            results:
              parsedResult &&
              typeof parsedResult === "object" &&
              "results" in parsedResult &&
              Array.isArray(parsedResult.results)
                ? parsedResult.results
                : [],
          });
        }
      }

      if (message.role !== "assistant") {
        continue;
      }

      const assistantText = getMessageText(message);
      if (!assistantText) {
        continue;
      }

      const { title, cleanContent } = extractTitle(assistantText);
      if (title) {
        latestTitle = title;
      }

      const outlineItems = parseOutlineItems(cleanContent);
      if (outlineItems.length > 0) {
        latestOutlineItems = outlineItems;
      }
    }

    if (!titleExtractedRef.current && latestTitle) {
      setCurrentPresentation(currentPresentationId, latestTitle);
      titleExtractedRef.current = true;
    }

    if (searchResults.length > 0) {
      searchResultsBufferRef.current = searchResults;
    }

    if (latestOutlineItems.length > 0) {
      outlineBufferRef.current = latestOutlineItems;
    }
  };

  // Function to update outline and search results using requestAnimationFrame
  const updateOutlineWithRAF = (): void => {
    // Batch all updates in a single RAF callback for better performance

    // Update search results if available
    if (searchResultsBufferRef.current !== null) {
      setSearchResults(searchResultsBufferRef.current);
      searchResultsBufferRef.current = null;
    }

    // Update outline if available
    if (outlineBufferRef.current !== null) {
      setOutline(outlineBufferRef.current);
      outlineBufferRef.current = null;
    }

    // Clear the current frame ID
    outlineRafIdRef.current = null;
  };

  // Outline generation with or without web search
  if (outlineTransportRef.current === null) {
    outlineTransportRef.current = new DefaultChatTransport({
      api: "/api/presentation/outline",
    });
  }

  const {
    messages: outlineMessages,
    sendMessage: appendOutlineMessage,
    setMessages: setOutlineMessages,
  } = useChat({
    transport: outlineTransportRef.current,

    onFinish: () => {
      const {
        currentPresentationId,
        outline,
        searchResults,
        currentPresentationTitle,
        imageSource,
      } = usePresentationState.getState();

      setIsGeneratingOutline(false);
      setShouldStartOutlineGeneration(false);
      setShouldStartPresentationGeneration(false);

      if (!hasGeneratedOutline(outline)) {
        generationLogger.warn(
          "Presentation outline completed without any outline items",
          {
            presentationId: currentPresentationId,
            searchResultsCount: searchResults.length,
          },
        );
        toast.error(
          "Outline generation finished without producing an outline. Please try again.",
        );
        return;
      }

      generationLogger.info("Presentation outline completed", {
        presentationId: currentPresentationId,
        outlineItems: outline.length,
        searchResultsCount: searchResults.length,
        title: currentPresentationTitle,
        imageSource,
      });

      if (currentPresentationId) {
        void updatePresentation({
          id: currentPresentationId,
          outline,
          searchResults,
          prompt: presentationInput,
          title: currentPresentationTitle ?? "",
          imageSource,
        });
      }

      // Cancel any pending outline animation frame
      if (outlineRafIdRef.current !== null) {
        cancelAnimationFrame(outlineRafIdRef.current);
        outlineRafIdRef.current = null;
      }
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      generationLogger.error("Presentation outline generation failed", error, {
        presentationId: usePresentationState.getState().currentPresentationId,
        errorMessage,
      });
      setIsGeneratingOutline(false);
      setShouldStartOutlineGeneration(false);
      setShouldStartPresentationGeneration(false);

      if (/429|quota|rate limit/i.test(errorMessage)) {
        toast.error(
          "Failed to generate outline: quota or rate limit exceeded. Check your OpenRouter balance or try again later.",
        );
      } else {
        toast.error("Failed to generate outline: " + errorMessage);
      }

      resetGeneration();

      if (outlineRafIdRef.current !== null) {
        cancelAnimationFrame(outlineRafIdRef.current);
        outlineRafIdRef.current = null;
      }
    },
  });

  // Lightweight useEffect that only schedules RAF updates
  useEffect(() => {
    if (outlineMessages.length > 1) {
      lastProcessedMessagesLength.current = outlineMessages.length;
      processMessages(outlineMessages);
      if (outlineRafIdRef.current === null) {
        outlineRafIdRef.current = requestAnimationFrame(updateOutlineWithRAF);
      }
    }
  }, [outlineMessages, webSearchEnabled]);

  // Watch for outline generation start
  useEffect(() => {
    const startOutlineGeneration = async (): Promise<void> => {
      if (shouldStartOutlineGeneration) {
        try {
          titleExtractedRef.current = false;
          setOutlineMessages([]);
          outlineBufferRef.current = null;
          searchResultsBufferRef.current = null;
          lastProcessedMessagesLength.current = 0;

          const { presentationInput } = usePresentationState.getState();
          if (outlineRafIdRef.current === null) {
            outlineRafIdRef.current =
              requestAnimationFrame(updateOutlineWithRAF);
          }

          generationLogger.info("Presentation outline generation started", {
            presentationId: currentPresentationId,
            modelProvider,
            modelId: modelId || DEFAULT_OPENROUTER_MODEL,
            numSlides,
            language,
            webSearchEnabled,
            textContent,
            tone,
            audience,
            scenario,
          });

          await appendOutlineMessage({
            role: "user",
            metadata: {
              numberOfCards: numSlides,
              language,
              modelId,
              modelProvider,
              webSearch: webSearchEnabled,
              presentationId: currentPresentationId,
              textContent,
              tone,
              audience,
              scenario,
            } satisfies PresentationOutlineMessageMetadata,
            parts: [{ type: "text", text: presentationInput }],
          });
        } catch (error) {
          generationLogger.error(
            "Failed to start presentation outline generation",
            error,
            {
              presentationId: currentPresentationId,
            },
          );
        }
      }
    };

    void startOutlineGeneration();
  }, [shouldStartOutlineGeneration]);

  const { completion: presentationCompletion, complete: generatePresentation } =
    useCompletion({
      api: "/api/presentation/generate",
      onFinish: (_prompt, _completion) => {
        generationLogger.info("Presentation generation completed", {
          presentationId: currentPresentationId,
          generatedSlides: usePresentationState.getState().slides.length,
        });
        setIsGeneratingPresentation(false);
        setShouldStartPresentationGeneration(false);
        const { theme } = usePresentationState.getState();
        if (currentPresentationId) {
          updatePresentation({
            id: currentPresentationId,
            theme:
              theme ??
              (resolvedTheme === "dark" ? "ebony" : "mystique"),
          });
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        generationLogger.error("Presentation generation failed", error, {
          presentationId: usePresentationState.getState().currentPresentationId,
          errorMessage,
        });
        toast.error("Failed to generate presentation: " + errorMessage);
        resetGeneration();
        streamingParserRef.current.reset();

        // Cancel any pending animation frame
        if (slidesRafIdRef.current !== null) {
          cancelAnimationFrame(slidesRafIdRef.current);
          slidesRafIdRef.current = null;
        }
      },
    });

  // Image slides generation
  const { completion: imageSlidesCompletion, complete: generateImageSlides } =
    useCompletion({
      api: "/api/presentation/generate-image-slides",
      onFinish: (_prompt, _completion) => {
        generationLogger.info("Image slide generation completed", {
          presentationId: currentPresentationId,
          generatedSlides: usePresentationState.getState().slides.length,
        });
        setIsGeneratingPresentation(false);
        setShouldStartImageSlideGeneration(false);
        const { theme } = usePresentationState.getState();
        if (currentPresentationId) {
          updatePresentation({
            id: currentPresentationId,
            theme:
              theme ??
              (resolvedTheme === "dark" ? "ebony" : "mystique"),
          });
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        generationLogger.error("Image slide generation failed", error, {
          presentationId: usePresentationState.getState().currentPresentationId,
          errorMessage,
        });
        toast.error("Failed to generate image slides: " + errorMessage);
        resetGeneration();
        streamingParserRef.current.reset();

        // Cancel any pending animation frame
        if (slidesRafIdRef.current !== null) {
          cancelAnimationFrame(slidesRafIdRef.current);
          slidesRafIdRef.current = null;
        }
      },
    });

  useEffect(() => {
    if (presentationCompletion) {
      try {
        // Only schedule a new frame if one isn't already pending
        if (slidesRafIdRef.current === null) {
          slidesRafIdRef.current = requestAnimationFrame(updateSlidesWithRAF);
        }
      } catch (error) {
        generationLogger.error("Failed to process presentation XML stream", error, {
          presentationId: usePresentationState.getState().currentPresentationId,
        });
        toast.error("Error processing presentation content");
      }
    }
  }, [presentationCompletion]);

  // Handle image slides completion streaming
  useEffect(() => {
    if (imageSlidesCompletion) {
      try {
        const processedCompletion = stripXmlCodeBlock(imageSlidesCompletion);
        streamingParserRef.current.reset();
        streamingParserRef.current.parseChunk(processedCompletion);
        streamingParserRef.current.finalize();
        const allSlides = streamingParserRef.current.getAllSlides();

        // Mark all slides as image slides and start image generation
        const imageSlidesData = allSlides.map((slide) => {
          const gen = rootImageGeneration[slide.id];
          if (gen?.status === "success" && slide.rootImage?.query) {
            return {
              ...slide,
              isImageSlide: true,
              rootImage: {
                ...slide.rootImage,
                url: gen.url,
                imageSource: "generate" as const,
              },
            };
          }
          return { ...slide, isImageSlide: true };
        });

        // Start image generation for slides that need it
        for (const slide of allSlides) {
          const slideId = slide.id;
          const rootImage = slide.rootImage;
          if (rootImage?.query && !rootImage.url) {
            const already = rootImageGeneration[slideId];
            if (!already || already.status === "error") {
              startRootImageGeneration(slideId, rootImage.query);
            }
          }
        }

        setSlides(imageSlidesData);
        save();
      } catch (error) {
        generationLogger.error("Failed to process image slides XML stream", error, {
          presentationId: usePresentationState.getState().currentPresentationId,
        });
        toast.error("Error processing image slides content");
      }
    }
  }, [imageSlidesCompletion]);

  useEffect(() => {
    if (shouldStartPresentationGeneration) {
      const {
        outline,
        presentationInput,
        language,
        modelId,
        modelProvider,
        tone,
        currentPresentationTitle,
        searchResults: stateSearchResults,
        setThumbnailUrl,
        textContent,
        audience,
        scenario,
        imageSource,
        selectedSlideTemplates,
        outlineTemplateOverrides,
      } = usePresentationState.getState();

      if (!hasGeneratedOutline(outline)) {
        setShouldStartPresentationGeneration(false);
        setIsGeneratingPresentation(false);
        toast.error("Generate an outline before generating the presentation.");
        return;
      }

      // Serialize templates for AI if any are selected
      const templateContext =
        selectedSlideTemplates.length > 0
          ? serializeTemplatesForPrompt(selectedSlideTemplates)
          : undefined;
      const outlineTemplateHints =
        selectedSlideTemplates.length > 0 &&
        Object.keys(outlineTemplateOverrides).length > 0
          ? serializeTemplateHintsForPrompt(
              outlineTemplateOverrides,
              selectedSlideTemplates,
            )
          : undefined;

      // Reset the parser before starting a new generation
      streamingParserRef.current.reset();
      setIsGeneratingPresentation(true);
      setThumbnailUrl(undefined);
      generationLogger.info("Presentation generation started", {
        presentationId: currentPresentationId,
        title: currentPresentationTitle ?? presentationInput ?? "",
        outlineItems: outline.length,
        modelProvider,
        modelId: modelId || DEFAULT_OPENROUTER_MODEL,
        imageSource,
        templateCount: selectedSlideTemplates.length,
      });
      void generatePresentation(presentationInput ?? "", {
        body: {
          title: currentPresentationTitle ?? presentationInput ?? "",
          prompt: presentationInput ?? "",
          outline,
          searchResults: stateSearchResults,
          language,
          tone: tone,
          modelId,
          modelProvider,
          textContent,
          audience,
          scenario,
          imageSource,
          templateContext,
          outlineTemplateHints,
          selectedTemplateCount: selectedSlideTemplates.length,
        },
      });
    }
  }, [shouldStartPresentationGeneration]);

  // Watch for image slide generation start
  useEffect(() => {
    if (shouldStartImageSlideGeneration) {
      const {
        outline,
        presentationInput,
        language,
        modelId,
        modelProvider,
        currentPresentationTitle,
        setThumbnailUrl,
      } = usePresentationState.getState();

      if (!hasGeneratedOutline(outline)) {
        setShouldStartImageSlideGeneration(false);
        setIsGeneratingPresentation(false);
        toast.error("Generate an outline before generating image slides.");
        return;
      }

      // Reset the parser before starting a new generation
      streamingParserRef.current.reset();
      setIsGeneratingPresentation(true);
      setThumbnailUrl(undefined);
      generationLogger.info("Image slide generation started", {
        presentationId: currentPresentationId,
        title: currentPresentationTitle ?? presentationInput ?? "",
        outlineItems: outline.length,
        modelProvider,
        modelId: modelId || DEFAULT_OPENROUTER_MODEL,
      });

      void generateImageSlides(presentationInput ?? "", {
        body: {
          title: currentPresentationTitle ?? presentationInput ?? "",
          prompt: presentationInput ?? "",
          outline,
          language,
          modelId,
          modelProvider,
        },
      });
    }
  }, [shouldStartImageSlideGeneration]);

  // Listen for manual root image generation changes (when user manually triggers image generation)
  useEffect(() => {
    for (const [slideId, gen] of Object.entries(rootImageGeneration)) {
      if (gen.status === "queued") {
        // Next, set status to "pending"
        usePresentationState.getState().rootImageGeneration &&
          usePresentationState.setState((state) => ({
            rootImageGeneration: {
              ...state.rootImageGeneration,
              [slideId]: {
                ...(state.rootImageGeneration[slideId] ?? { query: gen.query }),
                status: "generating",
              },
            },
          }));

        const slide = slides.find((s) => s.id === slideId);
        if (slide?.rootImage?.query) {
          const usesStockSearch =
            usesStockSearchForPresentation(imageSource) && !slide.isImageSlide;
          generationLogger.info("Root image generation started", {
            presentationId: currentPresentationId,
            slideId,
            isImageSlide: Boolean(slide.isImageSlide),
            imageSource,
            imageModel,
            query: slide.rootImage.query,
          });
          void (async () => {
            try {
              let result: RootImageGenerationResult | undefined;
              let resolvedImageSource: "search" | "generate" = usesStockSearch
                ? "search"
                : "generate";

              if (usesStockSearch) {
                const { stockImageProvider } = usePresentationState.getState();
                result = await fetchStockRootImage(
                  slide.rootImage!.query,
                  slide.rootImage!.layoutType,
                  stockImageProvider,
                  imageSource,
                );

                if (!result.success && imageSource === "automatic") {
                  generationLogger.warn(
                    "Stock image search returned no results; falling back to AI generation",
                    {
                      presentationId: currentPresentationId,
                      slideId,
                      query: slide.rootImage!.query,
                      stockError: result.error,
                    },
                  );
                  result = await generateImageAction(
                    slide.rootImage!.query,
                    imageModel,
                  );
                  if (result.success && result.image?.url) {
                    result = { ...result, usedAiFallback: true };
                    resolvedImageSource = "generate";
                  }
                }
              } else if (slide?.isImageSlide) {
                result = await generateSlideImageAction(
                  slide.rootImage!.query,
                  imageModel,
                );
              } else {
                result = await generateImageAction(
                  slide.rootImage!.query,
                  imageModel,
                );
              }

              const imageUrl = result?.success ? result.image?.url : undefined;

              if (imageUrl) {
                generationLogger.info("Root image generation completed", {
                  presentationId: currentPresentationId,
                  slideId,
                  imageUrl,
                  mode: result?.usedAiFallback
                    ? "ai-fallback"
                    : usesStockSearch
                      ? "stock-search"
                      : "ai-generate",
                });
                completeRootImageGeneration(slideId, imageUrl);
                usePresentationState.getState().setSlides(
                  usePresentationState.getState().slides.map((s) =>
                    s.id === slideId
                      ? {
                          ...s,
                        rootImage: {
                          ...s.rootImage!,
                          url: imageUrl,
                          imageSource: resolvedImageSource,
                        },
                      }
                      : s,
                  ),
                );
                save();
              } else {
                const failureMessage =
                  result?.error ?? "No image url returned";
                generationLogger.warn(
                  "Root image generation failed without an image URL",
                  {
                    presentationId: currentPresentationId,
                    slideId,
                    mode: usesStockSearch ? "stock-search" : "ai-generate",
                    error: failureMessage,
                  },
                );
                failRootImageGeneration(slideId, failureMessage);
              }
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Image generation failed";
              generationLogger.error("Root image generation threw an error", err, {
                presentationId: currentPresentationId,
                slideId,
                mode: usesStockSearch ? "stock-search" : "ai-generate",
              });
              failRootImageGeneration(slideId, message);
            }
          })();
        }
      }
    }
  }, [
    rootImageGeneration,
    isGeneratingPresentation,
    isGeneratingOutline,
    slides,
    imageSource,
    imageModel,
    completeRootImageGeneration,
    failRootImageGeneration,
    setSlides,
  ]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (slidesRafIdRef.current !== null) {
        cancelAnimationFrame(slidesRafIdRef.current);
        slidesRafIdRef.current = null;
      }

      if (outlineRafIdRef.current !== null) {
        cancelAnimationFrame(outlineRafIdRef.current);
        outlineRafIdRef.current = null;
      }
    };
  }, []);

  return null;
}
