import {
  assertModelIsConfigured,
  DEFAULT_MODEL_PROVIDER,
  DEFAULT_OPENROUTER_MODEL,
  ensureModelIsReady,
  modelPicker,
} from "@/lib/modelPicker";
import { createLogger } from "@/lib/observability/logger";
import { guardAiRoute } from "@/lib/api-guards";
import { streamText, type UIMessage } from "ai";
import { toModelMessages } from "@/lib/ai/uiMessageParts";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeLogger = createLogger("api:presentation-agent");

  try {
    const { id, messages, resumeData, modelProvider, modelId } =
      (await req.json()) as {
      id?: string;
      messages?: UIMessage[];
      resumeData?: Record<string, unknown>;
      modelProvider?: "openai" | "ollama" | "lmstudio" | "openrouter";
      modelId?: string;
    };

    if (!id) {
      routeLogger.warn("Presentation agent request rejected: missing presentation id", {
        requestId,
      });
      return new Response("Missing presentation id", { status: 400 });
    }

    routeLogger.info("Presentation agent request received", {
      requestId,
      presentationId: id,
      isResume: Boolean(resumeData),
      messageCount: Array.isArray(messages) ? messages.length : 0,
      modelProvider: modelProvider ?? DEFAULT_MODEL_PROVIDER,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
    });
    const guard = await guardAiRoute();
    if (guard.error) {
      routeLogger.warn("Presentation agent request rejected", {
        requestId,
        presentationId: id,
      });
      return guard.error;
    }
    const { session } = guard;

    try {
      assertModelIsConfigured(modelProvider ?? DEFAULT_MODEL_PROVIDER, modelId);
    } catch (error) {
      routeLogger.error(
        "Presentation agent request rejected: invalid model configuration",
        error,
        {
          requestId,
          presentationId: id,
          modelProvider: modelProvider ?? DEFAULT_MODEL_PROVIDER,
          modelId: modelId || DEFAULT_OPENROUTER_MODEL,
        },
      );
      return new Response(
        error instanceof Error ? error.message : "Invalid model configuration",
        { status: 400 },
      );
    }
    try {
      await ensureModelIsReady(modelProvider ?? DEFAULT_MODEL_PROVIDER, modelId);
    } catch (error) {
      routeLogger.error(
        "Presentation agent request rejected: selected model could not be prepared",
        error,
        {
          requestId,
          presentationId: id,
          modelProvider: modelProvider ?? DEFAULT_MODEL_PROVIDER,
          modelId: modelId || DEFAULT_OPENROUTER_MODEL,
        },
      );
      return new Response(
        error instanceof Error
          ? error.message
          : "Failed to prepare selected model",
        { status: 503 },
      );
    }

    const messagesArray = Array.isArray(messages) ? messages : [];
    if (messagesArray.length === 0) {
      routeLogger.error("Presentation agent request rejected: no messages", {
        requestId,
        presentationId: id,
      });
      return new Response("No messages provided", { status: 400 });
    }

    routeLogger.info("Presentation agent generation started", {
      requestId,
      presentationId: id,
      isResume: Boolean(resumeData),
      messageCount: messagesArray.length,
    });

    const result = streamText({
      model: modelPicker(modelProvider ?? DEFAULT_MODEL_PROVIDER, modelId),
      messages: toModelMessages(messagesArray),
    });

    routeLogger.info("Presentation agent stream created", {
      requestId,
      presentationId: id,
      isResume: Boolean(resumeData),
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    routeLogger.error("Presentation agent request failed", error, {
      requestId,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
