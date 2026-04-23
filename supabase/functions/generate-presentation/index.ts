import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  prompt: string;
  slideCount?: number;
  tone?: "professional" | "casual" | "academic" | "creative" | "persuasive";
  language?: string;
  audience?: string;
}

interface SlideOut {
  heading: string;
  content: string;
  bullets?: string[];
  layout?:
    | "title"
    | "content"
    | "two-column"
    | "stat"
    | "quote"
    | "image-left"
    | "image-right"
    | "list";
  notes?: string;
}

interface PresentationOut {
  title: string;
  subtitle?: string;
  pages: SlideOut[];
  suggestedTheme?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontHeading: string;
    fontBody: string;
  };
}

const SYSTEM_PROMPT = `You are an expert presentation designer. Create well-structured, visually-balanced presentations.

Rules:
- Generate clear, concise slide content (no fluff)
- Each slide has a strong heading (max 8 words) and supporting content
- Use bullets for lists (3-5 items max per slide)
- Vary slide layouts for visual interest
- Suggest a cohesive theme matching the topic's mood
- First slide is always the title slide
- Last slide is conclusion/CTA
- Include speaker notes for each slide (1-2 sentences)
- Pick colors that match the topic mood (don't default to blue)
- Pick fonts that fit (e.g., serif for academic, sans for tech)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as GenerateRequest;
    const prompt = (body.prompt || "").trim();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slideCount = Math.min(Math.max(body.slideCount ?? 8, 3), 20);
    const tone = body.tone ?? "professional";
    const language = body.language ?? "auto-detect from the prompt";
    const audience = body.audience ?? "general audience";

    const userMsg = `Create a ${slideCount}-slide presentation.

Topic: ${prompt}
Tone: ${tone}
Audience: ${audience}
Language: ${language}

Return slides with strong headings, concise content, bullets where appropriate, varied layouts, and a cohesive theme.`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "build_presentation",
                description: "Return the structured presentation",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    subtitle: { type: "string" },
                    pages: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          heading: { type: "string" },
                          content: { type: "string" },
                          bullets: {
                            type: "array",
                            items: { type: "string" },
                          },
                          layout: {
                            type: "string",
                            enum: [
                              "title",
                              "content",
                              "two-column",
                              "stat",
                              "quote",
                              "image-left",
                              "image-right",
                              "list",
                            ],
                          },
                          notes: { type: "string" },
                        },
                        required: ["heading", "content"],
                      },
                    },
                    suggestedTheme: {
                      type: "object",
                      properties: {
                        primaryColor: { type: "string" },
                        accentColor: { type: "string" },
                        backgroundColor: { type: "string" },
                        fontHeading: { type: "string" },
                        fontBody: { type: "string" },
                      },
                      required: [
                        "primaryColor",
                        "accentColor",
                        "backgroundColor",
                        "fontHeading",
                        "fontBody",
                      ],
                    },
                  },
                  required: ["title", "pages"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "build_presentation" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, text);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await aiResponse.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (!argsStr) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured output" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const presentation = JSON.parse(argsStr) as PresentationOut;

    return new Response(JSON.stringify(presentation), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-presentation error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
