import { streamText } from "ai";
import {
  assertModelIsConfigured,
  DEFAULT_MODEL_PROVIDER,
  DEFAULT_OPENROUTER_MODEL,
  modelPicker,
} from "@/lib/modelPicker";
import { createLogger } from "@/lib/observability/logger";
import { guardAiRoute } from "@/lib/api-guards";
import { NextResponse } from "next/server";
import { fillTemplate } from "@/lib/ai/fillTemplate";

interface GenerateSlideRequest {
  prompt: string;
  currentSlide?: string; // Serialized XML of current slide (optional context)
  theme?: string;
  language?: string;
  slideType?: "standard" | "image";
  imageStyle?: "3D" | "Sketch" | "Flat";
  textDensity?: "Minimal" | "Balanced" | "batafsil";
}

const singleSlideTemplate = `
You are a data-driven presentation designer. Create a SINGLE visually compelling slide.

## DECISION RULE — choose layout based on content:
- Has numbers, percentages, trends, comparisons → CHART or STATS (preferred)
- Has a process or steps → CYCLE or ARROWS
- Has a comparison → COLUMNS or COMPARE
- Has key facts → ICONS or BOXES
- Last resort only → BULLETS

## USER REQUEST
{PROMPT}

## CURRENT SLIDE CONTEXT (if provided)
{CURRENT_SLIDE}

## LANGUAGE
{LANGUAGE}

## OUTPUT FORMAT
Return ONLY the XML for a single slide.

\`\`\`xml
<SECTION layout="left|right|vertical">
  <!-- ONE layout component -->
</SECTION>
\`\`\`

## PRIORITY LAYOUTS (use these first):

**CHART** — for ANY data, trends, comparisons:
\`\`\`xml
<CHART charttype="bar|line|area|pie|donut|radar|scatter">
  <DATA><LABEL>Category 1</LABEL><VALUE>42</VALUE></DATA>
  <DATA><LABEL>Category 2</LABEL><VALUE>67</VALUE></DATA>
  <DATA><LABEL>Category 3</LABEL><VALUE>55</VALUE></DATA>
</CHART>
\`\`\`

**STATS** — for KPIs and key metrics:
\`\`\`xml
<STATS statstype="circle|plain|bar">
  <DIV stat="94"><H3>Customer Satisfaction</H3><P>vs. 72% industry avg</P></DIV>
  <DIV stat="38"><H3>Revenue Growth %</H3><P>Year-over-year increase</P></DIV>
  <DIV stat="2.4"><H3>Revenue $M</H3><P>Q4 2024 performance</P></DIV>
</STATS>
\`\`\`

**ICONS** — for concepts with symbols:
\`\`\`xml
<ICONS>
  <DIV icon="rocket"><H3>Innovation</H3><P>Description</P></DIV>
  <DIV icon="shield"><H3>Security</H3><P>Description</P></DIV>
</ICONS>
\`\`\`

**CYCLE** — for processes:
\`\`\`xml
<CYCLE>
  <DIV><H3>Step 1</H3><P>Description</P></DIV>
  <DIV><H3>Step 2</H3><P>Description</P></DIV>
</CYCLE>
\`\`\`

**COLUMNS** — for comparisons:
\`\`\`xml
<COLUMNS>
  <DIV><H3>Option A</H3><P>Description</P></DIV>
  <DIV><H3>Option B</H3><P>Description</P></DIV>
</COLUMNS>
\`\`\`

**BULLETS** — last resort only:
\`\`\`xml
<BULLETS>
  <DIV><H3>Point 1</H3><P>Description</P></DIV>
  <DIV><H3>Point 2</H3><P>Description</P></DIV>
</BULLETS>
\`\`\`

4. CYCLE: For processes and workflows
\`\`\`xml
<CYCLE>
  <DIV><H3>Research</H3><P>Initial exploration phase</P></DIV>
  <DIV><H3>Design</H3><P>Solution creation phase</P></DIV>
  <DIV><H3>Implement</H3><P>Execution phase</P></DIV>
</CYCLE>
\`\`\`

5. ARROWS: For cause-effect or flows
\`\`\`xml
<ARROWS>
  <DIV><H3>Challenge</H3><P>Current market problem</P></DIV>
  <DIV><H3>Solution</H3><P>Our innovative approach</P></DIV>
  <DIV><H3>Result</H3><P>Measurable outcomes</P></DIV>
</ARROWS>
\`\`\`

6. TIMELINE: For chronological progression
\`\`\`xml
<TIMELINE>
  <DIV><H3>2022</H3><P>Market research completed</P></DIV>
  <DIV><H3>2023</H3><P>Product development phase</P></DIV>
  <DIV><H3>2024</H3><P>Global market expansion</P></DIV>
</TIMELINE>
\`\`\`

7. PYRAMID: For hierarchical importance
\`\`\`xml
<PYRAMID>
  <DIV><H3>Vision</H3><P>Our aspirational goal</P></DIV>
  <DIV><H3>Strategy</H3><P>Key approaches to achieve vision</P></DIV>
  <DIV><H3>Tactics</H3><P>Specific implementation steps</P></DIV>
</PYRAMID>
\`\`\`

8. STAIRCASE: For progressive advancement
\`\`\`xml
<STAIRCASE>
  <DIV><H3>Basic</H3><P>Foundational capabilities</P></DIV>
  <DIV><H3>Advanced</H3><P>Enhanced features and benefits</P></DIV>
  <DIV><H3>Expert</H3><P>Premium capabilities and results</P></DIV>
</STAIRCASE>
\`\`\`

9. BOXES: For simple information tiles
\`\`\`xml
<BOXES>
  <DIV><H3>Speed</H3><P>Faster delivery cycles.</P></DIV>
  <DIV><H3>Quality</H3><P>Automated testing & reviews.</P></DIV>
  <DIV><H3>Security</H3><P>Shift-left security practices.</P></DIV>
</BOXES>
\`\`\`

10. COMPARE: For side-by-side comparison
\`\`\`xml
<COMPARE>
  <DIV><H3>Solution A</H3><LI>Feature 1</LI><LI>Feature 2</LI></DIV>
  <DIV><H3>Solution B</H3><LI>Feature 3</LI><LI>Feature 4</LI></DIV>
</COMPARE>
\`\`\`

11. PROS-CONS: For trade-offs
\`\`\`xml
<PROS-CONS>
  <PROS><H3>Pros</H3><LI>Pro 1</LI><LI>Pro 2</LI></PROS>
  <CONS><H3>Cons</H3><LI>Con 1</LI><LI>Con 2</LI></CONS>
</PROS-CONS>
\`\`\`

12. TABLE: For tabular data
\`\`\`xml
<TABLE>
  <TR><TH>Header 1</TH><TH>Header 2</TH></TR>
  <TR><TD>Data 1</TD><TD>Data 2</TD></TR>
</TABLE>
\`\`\`

13. CHART: For data visualization
\`\`\`xml
<CHART charttype="bar|pie|line|area|radar">
  <DATA><LABEL>Q1</LABEL><VALUE>24</VALUE></DATA>
  <DATA><LABEL>Q2</LABEL><VALUE>36</VALUE></DATA>
</CHART>
\`\`\`

14. SIMPLE CONTENT: Just headings and paragraphs
\`\`\`xml
<H1>Main Title</H1>
<P>Description paragraph with details.</P>
\`\`\`

## IMAGE QUERY
Include an image query in most slides:
\`\`\`xml
<IMG query="abstract background, minimalist design" />
\`\`\`

If you include an \`<IMG query="...">\` tag, the query text MUST always be in English for Unsplash compatibility, even if {LANGUAGE} is not English. Keep all other slide copy in {LANGUAGE}; only the image search query should be in English.

Now generate a single slide based on the user's request.
`;

const singleImageSlideTemplate = `
You are an expert visual presentation designer. Create a SINGLE image-based slide in XML format.

## SLIDE REQUIREMENTS
1. Generate exactly ONE <SECTION> tag with isImageSlide="true"
2. The slide must be a full-bleed image with ALL text rendered inside the image itself (no H1/H2/H3/P/etc.)
3. Output ONLY an <IMG query="..."> tag inside the SECTION
4. The IMG query must be 60-120 words, highly descriptive, and include the exact on-image text in quotes
5. Do NOT include any other tags or wrapper elements

## USER REQUEST
{PROMPT}

## CURRENT SLIDE CONTEXT (if provided)
{CURRENT_SLIDE}

## LANGUAGE
{LANGUAGE}

## IMAGE STYLE
{IMAGE_STYLE}
{IMAGE_STYLE_GUIDANCE}

## TEXT DENSITY
{TEXT_DENSITY}
{TEXT_DENSITY_GUIDANCE}

## OUTPUT FORMAT
Return ONLY the XML for a single slide. No explanation, no wrapper tags.

\`\`\`xml
<SECTION isImageSlide="true">
  <IMG query="..." />
</SECTION>
\`\`\`

## IMAGE PROMPT GUIDELINES
- Describe the scene, composition, mood, color palette, and lighting
- Include typography guidance (font style, size, placement, contrast)
- Expand the prompt into the final copy for the slide (titles, subtitles, bullets, labels)
- Do NOT use placeholders, brackets, or vague references

Now generate the single image slide.
`;

const model = modelPicker(DEFAULT_MODEL_PROVIDER, DEFAULT_OPENROUTER_MODEL);

function getImageStyleGuidance(style?: string): string {
  switch (style) {
    case "3D":
      return "Use a cinematic 3D render with depth, realistic shadows, and depth of field.";
    case "Sketch":
      return "Use hand-drawn sketch textures, ink lines, and paper grain.";
    case "Flat":
      return "Use flat design with minimal shading and strong color blocks.";
    default:
      return "Use a cinematic 3D render with depth, realistic shadows, and depth of field.";
  }
}

function getTextDensityGuidance(density?: string): string {
  switch (density) {
    case "Minimal":
      return "Text should be minimal: a short title and one short supporting line.";
    case "batafsil":
      return "Text should be batafsil: title, subtitle, and 4-6 ixcham bullet lines or labels.";
    case "Balanced":
    default:
      return "Text should be balanced: title, subtitle, and 2-3 ixcham supporting lines.";
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeLogger = createLogger("api:presentation-generate-slide");

  try {
    routeLogger.info("Single slide generation request received", { requestId });
    const guard = await guardAiRoute();
    if (guard.error) {
      routeLogger.warn("Single slide generation request rejected", { requestId });
      return guard.error;
    }
    const { session } = guard;

    const {
      prompt,
      currentSlide,
      language,
      slideType,
      imageStyle,
      textDensity,
    } = (await req.json()) as GenerateSlideRequest;

    if (!prompt) {
      routeLogger.warn("Single slide generation request rejected: missing prompt", {
        requestId,
      });
      return NextResponse.json(
        { error: "Missing required prompt field" },
        { status: 400 },
      );
    }
    routeLogger.info("Validated single slide generation request", {
      requestId,
      slideType: slideType || "standard",
      language: language || "en-US",
      imageStyle: imageStyle || "3D",
      textDensity: textDensity || "Balanced",
      promptLength: prompt.length,
      modelProvider: DEFAULT_MODEL_PROVIDER,
      modelId: DEFAULT_OPENROUTER_MODEL,
    });
    try {
      assertModelIsConfigured(DEFAULT_MODEL_PROVIDER, DEFAULT_OPENROUTER_MODEL);
    } catch (error) {
      routeLogger.error(
        "Single slide generation request rejected: invalid model configuration",
        error,
        {
          requestId,
          modelProvider: DEFAULT_MODEL_PROVIDER,
          modelId: DEFAULT_OPENROUTER_MODEL,
        },
      );
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid model configuration",
        },
        { status: 400 },
      );
    }

    const isImageSlide = slideType === "image";
    const promptTemplate = isImageSlide
      ? singleImageSlideTemplate
      : singleSlideTemplate;

    const filledPrompt = fillTemplate(promptTemplate, {
      PROMPT: prompt,
      CURRENT_SLIDE: currentSlide || "No current slide context provided.",
      LANGUAGE: language || "en-US",
      IMAGE_STYLE: imageStyle || "3D",
      IMAGE_STYLE_GUIDANCE: getImageStyleGuidance(imageStyle),
      TEXT_DENSITY: textDensity || "Balanced",
      TEXT_DENSITY_GUIDANCE: getTextDensityGuidance(textDensity),
    });

    routeLogger.info("Single slide generation started", {
      requestId,
      slideType: isImageSlide ? "image" : "standard",
    });

    const result = streamText({
      model,
      prompt: filledPrompt,
    });

    routeLogger.info("Single slide generation stream created", {
      requestId,
      slideType: isImageSlide ? "image" : "standard",
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    routeLogger.error("Single slide generation failed", error, { requestId });
    return NextResponse.json(
      { error: "Failed to generate slide" },
      { status: 500 },
    );
  }
}
