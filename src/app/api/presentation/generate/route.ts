import {
  assertModelIsConfigured,
  DEFAULT_MODEL_PROVIDER,
  DEFAULT_OPENROUTER_MODEL,
  ensureModelIsReady,
  modelPicker,
} from "@/lib/modelPicker";
import { createLogger } from "@/lib/observability/logger";
import { guardAiRoute } from "@/lib/api-guards";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { fillTemplate } from "@/lib/ai/fillTemplate";

interface SlidesRequest {
  title: string;
  prompt: string;
  outline: string[];
  language: string;
  tone: string;
  modelId?: string;
  modelProvider?: "openai" | "ollama" | "lmstudio" | "openrouter";
  searchResults?: Array<{ query: string; results: unknown[] }>;
  textContent?: "minimal" | "ixcham" | "batafsil" | "kengaytirilgan";
  audience?: string;
  scenario?: string;
  imageSource?: "automatic" | "ai" | "stock";
  templateContext?: string;
  outlineTemplateHints?: Record<number, string>;
  selectedTemplateCount?: number; // Number of templates selected by user
}

const DEFAULT_LAYOUTS = `
## AVAILABLE LAYOUTS
Choose ONE different layout for each slide (use these exact XML tags so our parser recognizes them):

1. COLUMNS: For comparisons
\`\`\`xml
<COLUMNS>
  <DIV><H3>First Concept</H3><P>Description</P></DIV>
  <DIV><H3>Second Concept</H3><P>Description</P></DIV>
</COLUMNS>
\`\`\`

2. BULLETS: For key points
\`\`\`xml
<BULLETS>
  <DIV><H3>Main Point 1 </H3><P>Description</P></DIV>
  <DIV><H3>Main Point 2 </H3><P>Second point with details</P></DIV>
</BULLETS>
\`\`\`

3. ICONS: For concepts with symbols
\`\`\`xml
<ICONS>
  <DIV icon="rocket"><H3>Innovation</H3><P>Description</P></DIV>
  <DIV icon="shield"><H3>Security</H3><P>Description</P></DIV>
</ICONS>
\`\`\`

4. CYCLE: For processes and workflows
\`\`\`xml
<CYCLE>
  <DIV><H3>Research</H3><P>Initial exploration phase</P></DIV>
  <DIV><H3>Design</H3><P>Solution creation phase</P></DIV>
  <DIV><H3>Implement</H3><P>Execution phase</P></DIV>
  <DIV><H3>Evaluate</H3><P>Assessment phase</P></DIV>
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

5b. ARROW-VERTICAL: For vertical step-by-step flows
\`\`\`xml
<ARROW-VERTICAL>
  <DIV><H3>Discover</H3><P>Research & requirements.</P></DIV>
  <DIV><H3>Design</H3><P>UX & architecture.</P></DIV>
  <DIV><H3>Deliver</H3><P>Build, test, deploy.</P></DIV>
</ARROW-VERTICAL>
\`\`\`

6. TIMELINE: For chronological progression
\`\`\`xml
<TIMELINE sidedness="single|double" orientation="vertical|horizontal">
  <DIV><H3>2022</H3><P>Market research completed</P></DIV>
  <DIV><H3>2023</H3><P>Product development phase</P></DIV>
  <DIV><H3>2024</H3><P>Global market expansion</P></DIV>
</TIMELINE>
\`\`\`

7. PYRAMID: For hierarchical importance
\`\`\`xml
<PYRAMID isFunnel="true|false">
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
<BOXES boxType="outline|icon|solid|sideline|joined|leaf">
  <DIV><H3>Speed</H3><P>Faster delivery cycles.</P></DIV>
  <DIV><H3>Quality</H3><P>Automated testing & reviews.</P></DIV>
  <DIV><H3>Security</H3><P>Shift-left security practices.</P></DIV>
</BOXES>
\`\`\`

10. COMPARE: For side-by-side comparison
\`\`\`xml
<COMPARE>
  <DIV><H3>Solution A</H3><LI>Features 1</LI><LI>Features 2</LI></DIV>
  <DIV><H3>Solution B</H3><LI>Features 3</LI><LI>Features 4</LI></DIV>
</COMPARE>
\`\`\`

11. BEFORE-AFTER: For transformation snapshots
\`\`\`xml
<BEFORE-AFTER>
  <DIV><H3>Before</H3><P>Manual processes, scattered data.</P></DIV>
  <DIV><H3>After</H3><P>Automated workflows, unified insights.</P></DIV>
</BEFORE-AFTER>
\`\`\`

12. PROS-CONS: For trade-offs
\`\`\`xml
<PROS-CONS>
  <PROS><H3>Pros</H3><LI>Pro 1</LI><LI>Pro 2</LI></PROS>
  <CONS><H3>Cons</H3><LI>Con 1</LI><LI>Con 2</LI></CONS>
</PROS-CONS>
\`\`\`

13. SIDELINE: For highlighted single-column facts with a vertical accent line
\`\`\`xml
<SIDELINE>
  <DIV><H3>Key Insight</H3><P>Short explanation of the insight with context and implication.</P></DIV>
</SIDELINE>
\`\`\`

14. ARROW-BULLETS: For step lists with arrow markers and short explanations
\`\`\`xml
<ARROW-BULLETS>
  <LI><H3>Step 1</H3><P>What happens and why it matters.</P></LI>
  <LI><H3>Step 2</H3><P>Next action and expected outcome.</P></LI>
</ARROW-BULLETS>
\`\`\`

15. SIDE-QUOTE: For callouts or testimonials with an icon and attribution
\`\`\`xml
<SIDE-QUOTE icon="quote">
  <DIV><H3>"Concise impactful quote or user testimonial"</H3><P>— Author, Role</P></DIV>
</SIDE-QUOTE>
\`\`\`

16. TABLE: For tabular data
\`\`\`xml
<TABLE>
  <TR><TH>Header 1</TH><TH>Header 2</TH></TR>
  <TR><TD>Data 1</TD><TD>Data 2</TD></TR>
</TABLE>
\`\`\`

17. CHARTS: For data visualization — USE THESE FREQUENTLY for any topic with numbers, trends, or comparisons
\`\`\`xml
<CHART charttype="bar">
  <DATA><LABEL>Q1</LABEL><VALUE>24</VALUE></DATA>
  <DATA><LABEL>Q2</LABEL><VALUE>36</VALUE></DATA>
  <DATA><LABEL>Q3</LABEL><VALUE>48</VALUE></DATA>
</CHART>

<CHART charttype="line">
  <DATA><LABEL>2020</LABEL><VALUE>15</VALUE></DATA>
  <DATA><LABEL>2021</LABEL><VALUE>28</VALUE></DATA>
  <DATA><LABEL>2022</LABEL><VALUE>42</VALUE></DATA>
</CHART>

<CHART charttype="pie">
  <DATA><LABEL>Category A</LABEL><VALUE>40</VALUE></DATA>
  <DATA><LABEL>Category B</LABEL><VALUE>30</VALUE></DATA>
  <DATA><LABEL>Category C</LABEL><VALUE>30</VALUE></DATA>
</CHART>

<CHART charttype="area">
  <DATA><LABEL>Jan</LABEL><VALUE>20</VALUE></DATA>
  <DATA><LABEL>Feb</LABEL><VALUE>35</VALUE></DATA>
  <DATA><LABEL>Mar</LABEL><VALUE>55</VALUE></DATA>
</CHART>

<CHART charttype="radar">
  <DATA><LABEL>Speed</LABEL><VALUE>85</VALUE></DATA>
  <DATA><LABEL>Quality</LABEL><VALUE>70</VALUE></DATA>
  <DATA><LABEL>Cost</LABEL><VALUE>60</VALUE></DATA>
</CHART>

<CHART charttype="donut">
  <DATA><LABEL>Segment A</LABEL><VALUE>45</VALUE></DATA>
  <DATA><LABEL>Segment B</LABEL><VALUE>30</VALUE></DATA>
  <DATA><LABEL>Segment C</LABEL><VALUE>25</VALUE></DATA>
</CHART>

<CHART charttype="scatter">
  <DATA><X>10</X><Y>30</Y></DATA>
  <DATA><X>25</X><Y>55</Y></DATA>
  <DATA><X>40</X><Y>70</Y></DATA>
</CHART>

<CHART charttype="funnel">
  <DATA><LABEL>Awareness</LABEL><VALUE>1000</VALUE></DATA>
  <DATA><LABEL>Interest</LABEL><VALUE>600</VALUE></DATA>
  <DATA><LABEL>Decision</LABEL><VALUE>200</VALUE></DATA>
  <DATA><LABEL>Action</LABEL><VALUE>80</VALUE></DATA>
</CHART>

<CHART charttype="waterfall">
  <DATA><LABEL>Start</LABEL><VALUE>100</VALUE></DATA>
  <DATA><LABEL>Revenue</LABEL><VALUE>50</VALUE></DATA>
  <DATA><LABEL>Cost</LABEL><VALUE>-30</VALUE></DATA>
  <DATA><LABEL>Net</LABEL><VALUE>120</VALUE></DATA>
</CHART>
\`\`\`

**CHART SELECTION GUIDE — choose based on data type:**
- Trends over time → line or area
- Comparing categories → bar
- Parts of a whole → pie or donut
- Distribution/correlation → scatter
- Multiple dimensions → radar
- Process conversion → funnel
- Sequential gains/losses → waterfall
- Always use REALISTIC numbers relevant to the topic

18. STATS: For metrics and KPIs
\`\`\`xml
<STATS statstype="plain|circle|circle-bold|star|bar|dot-grid|dot-line">
  <DIV stat="85"><H3>Customer Satisfaction</H3><P>Based on Q4 surveys</P></DIV>
  <DIV stat="4.5"><H3>App Rating</H3><P>Across all platforms</P></DIV>
</STATS>
\`\`\`
`;

// ============================================================================
// MAIN PROMPT TEMPLATE
// ============================================================================

const SLIDES_TEMPLATE = `You are a world-class data-driven presentation designer. Your presentations look like they were made by a senior McKinsey consultant combined with a professional infographic designer. Every slide must be visually rich, data-forward, and analytically compelling.

# PRESENTATION CONTEXT

- **Title**: {TITLE}
- **Request**: {PROMPT}
- **Date**: {CURRENT_DATE}
- **Language**: {LANGUAGE}
- **Tone**: {TONE}
- **Total Slides**: {TOTAL_SLIDES}
- **Text Content Level**: {TEXT_CONTENT}
- **Target Audience**: {AUDIENCE}
- **Scenario**: {SCENARIO}

## Outline Reference
\`\`\`md
{OUTLINE_FORMATTED}
\`\`\`

## Research Context
\`\`\`md
{SEARCH_RESULTS}
\`\`\`

---

{SELECTED_CHUNKS_CONTEXT}

# OUTPUT FORMAT

\`\`\`xml
<PRESENTATION>
<SECTION layout="left|right|vertical">
  <!-- ONE layout component per slide -->
</SECTION>
</PRESENTATION>
\`\`\`

**SECTION Layout Attribute:**
- \`layout="left"\` - Image/chart on left side
- \`layout="right"\` - Image/chart on right side
- \`layout="vertical"\` - Image at top (good for STATS/CHART-heavy slides)

---
**VISUAL POLICY**
- Every content slide MUST use one of the available layout tags: ICONS, BOXES, SIDELINE, SIDE-QUOTE, ARROWS, ARROW-VERTICAL, COLUMNS, COMPARE, PYRAMID, STAIRCASE, CHART, or STATS.
- Do NOT generate plain text slides using only raw paragraph text outside of these layouts.
- If a slide is not CHART or STATS, it MUST include exactly one \`<IMG query="..." />\` tag inside the slide section.
- For BOXES and ICONS slides, use \`icon="..."\` attributes when relevant.
- For quote-style callouts, use \`<SIDE-QUOTE icon="quote">\` and include a strong quote headline plus attribution.
- Every image query should be a detailed English stock/AI prompt that matches the slide topic.

**EXAMPLE SLIDE**
\`\`\`xml
<SECTION layout="left">
  <BOXES boxType="icon">
    <DIV icon="structure"><H3>Anime Story Arc</H3><P>Each season follows a clear three-act structure with character growth, conflict, and climax.</P></DIV>
  </BOXES>
  <IMG query="colorful anime series structure infographic with story arc, character development, and key plot points" />
</SECTION>
\`\`\`

---
**MANDATORY SLIDES**
- Slide 1: Introduction — title, 1-sentence summary, author name, strong image
- Last slide: Conclusion — key takeaways, next steps or call to action, image
{AVAILABLE_LAYOUTS}

---

# IMAGE QUERIES

{IMAGE_QUERY_STYLE}

---

{PER_SLIDE_REQUIREMENTS}

# CONTENT STRATEGY — READ CAREFULLY

## Text Content Levels:
- minimal: 1-2 short sentences per point
- ixcham: 2-3 sentences per point
- batafsil: 3-4 sentences per point
- kengaytirilgan: 4-5+ sentences per point

## Slide Visual Balance:
- Every slide must feel balanced — same text density, consistent structure
- Never one slide with 10 points and another with 2

## Slide Writing Requirements:
- Each slide must include at least one full paragraph of explanation for each main point.
- Do not rely on terse bullets alone; every concept must be accompanied by a clear sentence or two explaining why it matters, how it works, or what the result is.
- Use visual layout tags aggressively: ICONS, COLUMNS, COMPARE, PYRAMID, STAIRCASE, CHARTS, or STATS whenever possible.
- If a slide uses CHARTS or STATS, include a paragraph that interprets the numbers and explains the main insight.
- For conceptual slides, prefer ICONS, GRID-style layouts, COLUMNS, or comparison tables instead of only BULLETS.
- Avoid empty slide space: where possible, use compact side-by-side structures so related points sit together.

## ═══════════════════════════════════════════════════
## DATA VISUALIZATION STRATEGY — THE CORE PRINCIPLE
## ═══════════════════════════════════════════════════

**THE GOLDEN RULE: Data beats text. Charts beat bullets. Always.**

### MANDATORY DISTRIBUTION (strict — no exceptions):
For a presentation of N slides (excluding intro/conclusion):
- **≥ 70% of content slides MUST use CHART layout** — that means 3 out of 5, 4 out of 6, 5 out of 7, etc.
- **≥ 20% of content slides MUST use STATS layout** — key numbers, KPIs, metrics
- **≤ 20% of content slides may use BULLETS or COLUMNS** — only for concepts that cannot be charted

### WHEN TO USE EACH CHART TYPE:
| Data Type | Best Chart | Example |
|-----------|-----------|---------|
| Trend over time | line or area | "Revenue grew from $2M to $8M 2020-2024" |
| Category comparison | bar | "Market share: A=35%, B=28%, C=22%" |
| Parts of a whole | donut or pie | "Budget allocation by department" |
| Multiple dimensions | radar | "Performance across 5 criteria" |
| Correlation/distribution | scatter | "Investment vs. return scatter" |
| Sequential steps/conversion | funnel (use bar as fallback) | "1000 leads → 80 customers" |
| Gains and losses | waterfall (use bar as fallback) | "Revenue bridge analysis" |
| Multi-metric dashboard | stats | "KPIs: 94% satisfaction, $2.4M revenue, 38% growth" |

### REALISTIC DATA REQUIREMENT:
- ALL chart values must be realistic, domain-appropriate numbers
- Use real-world benchmarks (industry averages, typical ranges)
- For percentage charts: values must sum to 100 (or close)
- Add meaningful labels that tell a story — not "Category A, B, C"
- Include units in axis titles: "$M", "%", "users", "days"

### DATA-FIRST SLIDE WRITING PROCESS:
1. Ask: "What is the KEY INSIGHT of this slide?"
2. Ask: "Can this insight be shown as a number or chart?"
3. If YES → use CHART or STATS (mandatory)
4. If NO → use ICONS, CYCLE, ARROWS, or TIMELINE
5. ONLY use BULLETS/COLUMNS as absolute last resort

### CHART TITLE REQUIREMENT:
Every CHART slide must have a slide-level heading (H1 or TITLE tag) that states the insight:
- BAD: "Revenue Data"
- GOOD: "Revenue Grew 3x in 4 Years, Driven by Digital Sales"
- BAD: "Customer Satisfaction"
- GOOD: "94% Customer Satisfaction — Above Industry Average of 72%"

### STATS LAYOUT — USE FOR KPI SLIDES:
Use STATS when you have 3-6 key metrics. Always include:
- The metric VALUE (realistic number)
- A descriptive H3 label
- Context in P tag ("vs. 72% industry avg", "up 15% YoY")
- Use statstype="circle" for percentages, "plain" for raw numbers, "bar" for progress metrics

---

**Intro/Conclusion:**
- Intro: cover slide with title, 1-sentence description, author name, strong image
- Conclusion: key insights summary, next steps or call to action, image
- Always include both, even when outline is provided

---

# CRITICAL RULES

{CRITICAL_RULES}

---

Now generate the complete XML presentation with exactly {TOTAL_SLIDES} slides.
`

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatSearchResults(
  searchResults?: Array<{ query: string; results: unknown[] }>,
): string {
  if (!searchResults || searchResults.length === 0) {
    return "No research data available.";
  }

  const searchData = searchResults
    .map((searchItem, index: number) => {
      const query = searchItem.query || `Search ${index + 1}`;
      const results = Array.isArray(searchItem.results)
        ? searchItem.results
        : [];

      if (results.length === 0) return "";

      const formattedResults = results
        .map((result: unknown) => {
          const resultObj = result as Record<string, unknown>;
          return `- ${resultObj.title || "No title"}\n  ${resultObj.content || "No content"}\n  ${resultObj.url || "No URL"}`;
        })
        .join("\n");

      return `**Query ${index + 1}:** ${query}\n${formattedResults}`;
    })
    .filter(Boolean)
    .join("\n\n");

  return searchData || "No research data available.";
}

function getImageQueryStyle(imageSource?: string): string {
  const isStockImage =
    imageSource === "stock" || imageSource === "automatic" || !imageSource;

  if (isStockImage) {
    return `**STOCK IMAGE SEARCH**: Use SHORT keyword queries (1-4 words).
Important: Every \`<IMG query="...">\` value for stock image search MUST be written in English for Unsplash compatibility, even if the presentation language is not English. Keep the slide text/content in the requested presentation language; only the image search query must stay in English.
\`\`\`xml
<IMG query="smart city skyline" />
<IMG query="team collaboration" />
\`\`\``;
  }

  return `**AI IMAGE GENERATION**: Use batafsil descriptive prompts (60-120 words).

Create batafsil, artistic prompts that:
- Describe the visual scene, composition, and mood
- Include style references (photorealistic, illustration, cinematic, etc.)
- Mention lighting, colors, and atmosphere
- Are relevant to the slide topic
- Do NOT include on-image text unless explicitly required by the slide content
- Do NOT use placeholders, brackets, or vague references
- Do NOT mention AI tools, models, or generation technology

\`\`\`xml
<IMG query="cinematic wide-angle view of a futuristic smart city powered by renewable energy, gleaming solar arrays and vertical gardens, morning haze, warm sunlight cutting through glass towers, clean aerial composition with leading lines, crisp details, high contrast, optimistic mood" />
<IMG query="photorealistic scene of a diverse product team collaborating in a modern glass office, warm ambient lighting, soft shadows, laptops and whiteboards with sketched diagrams, shallow depth of field, candid expressions, balanced composition, professional yet inviting atmosphere" />
\`\`\``;
}

function buildAvailableLayouts(
  templateContext: string | undefined,
  selectedTemplateCount: number,
  totalSlides: number,
): string {
  // No templates selected - use all default layouts and choose them automatically
  if (!templateContext) {
    return `${DEFAULT_LAYOUTS}

> **AUTOMATIC TEMPLATE SELECTION**
> The user did not choose specific slide templates. You must automatically choose the most appropriate layout from the AVAILABLE LAYOUTS for each slide.
> Use the available templates aggressively and do not fall back to plain BULLETS unless absolutely necessary.
> Treat this as a required instruction: choose the right layout for every slide without asking the user.`;
  }

  // Fewer templates selected than slides - show both selected templates AND default layouts
  if (selectedTemplateCount < totalSlides) {
    return `## AVAILABLE LAYOUTS

### 🔒 SELECTED TEMPLATES (Priority - You MUST include all of these)
The user selected the following ${selectedTemplateCount} template(s). You MUST use each of these at least once in your presentation.

${templateContext}

---

### 📋 ADDITIONAL LAYOUTS (For remaining ${totalSlides - selectedTemplateCount} slides)
For the slides not covered by selected templates above, you may use ANY of these standard layouts:

${DEFAULT_LAYOUTS}

> **NOTE**: You have ${totalSlides} slides total but only ${selectedTemplateCount} selected template(s). 
> Use all selected templates first, then fill remaining slides with layouts from the additional options above.`;
  }

  // Templates >= slides - strict mode, only selected templates allowed
  return `## AVAILABLE LAYOUTS

> **⚠️ TEMPLATE CONSTRAINT MODE ACTIVE**
> 
> You are **STRICTLY LIMITED** to ONLY the layout templates listed below.
> Using ANY other layout tag will cause **IMMEDIATE PARSING FAILURE**.
> 
> **DO NOT** use: BULLETS, ICONS, CYCLE, ARROWS, TIMELINE, PYRAMID, STAIRCASE, BOXES, COMPARE, BEFORE-AFTER, PROS-CONS, TABLE, CHART, STATS, COLUMNS, or any tag NOT shown below.

**Rules:**
1. Use ONLY the exact XML structures shown below
2. Copy the layout tag structure exactly as shown
3. You may add \`<IMG query="..." />\` for images - this is the ONLY allowed modification
4. Each slide MUST use one of these templates - no exceptions

**YOUR ALLOWED LAYOUTS:**

${templateContext}`;
}

function buildPerSlideRequirements(
  templateContext?: string,
  outlineTemplateHints?: Record<number, string>,
): string {
  if (
    !templateContext ||
    !outlineTemplateHints ||
    Object.keys(outlineTemplateHints).length === 0
  ) {
    return "";
  }

  const hints = Object.entries(outlineTemplateHints)
    .map(
      ([index, templateName]) =>
        `- **Slide ${parseInt(index, 10) + 1}**: Use "${templateName}" layout (MANDATORY)`,
    )
    .join("\n");

  return `# PER-SLIDE TEMPLATE ASSIGNMENTS

> **⚠️ MANDATORY ASSIGNMENTS**
> These are **absolute requirements**. Use the EXACT template specified.

${hints}

For unlisted slides: Choose any layout from AVAILABLE LAYOUTS above.
---
`;
}

function buildCriticalRules(
  templateContext: string | undefined,
  selectedTemplateCount: number,
  totalSlides: number,
): string {
  // No templates - default rules
  if (!templateContext) {
    return `1. Generate **EXACTLY {TOTAL_SLIDES} slides** — no more, no less
2. **CHART QUOTA**: ≥70% of content slides MUST be CHART layout. Count your slides and enforce this.
3. **STATS QUOTA**: ≥20% of content slides MUST be STATS layout for KPIs and metrics.
4. **TEXT MAXIMUM**: ≤20% of content slides may use BULLETS or COLUMNS — use only for concepts that cannot be charted.
5. **LAST SLIDE MUST BE A CONCLUSION**: The final slide must be a conclusion slide with key takeaways, next steps or call to action, and an image.
6. **NO TWO CONSECUTIVE TEXT SLIDES**: After any BULLETS or COLUMNS slide, the next slide MUST be CHART, STATS, ICONS, CYCLE, ARROWS, SIDELINE, or SIDE-QUOTE.
7. **INSIGHT TITLES**: Every CHART slide heading must state the insight, not just describe the data. Example: "Revenue Grew 3x in 4 Years, Driven by Digital Sales" not "Revenue Chart".
8. **REALISTIC DATA**: All chart values must be realistic domain-appropriate numbers — never 1,2,3 placeholders.
9. **STATS CONTEXT**: Every STATS item must include a P tag with context ("vs. industry avg 72%", "up 18% YoY").
10. Vary SECTION layout="left/right/vertical" throughout for visual variety.
11. Use ONLY layout tags from AVAILABLE LAYOUTS — unlisted tags cause parsing failures.
12. Expand all outline points with real-world data, examples, and industry benchmarks.
13. **AUTOMATIC TEMPLATE SELECTION**: The user did not choose templates. Choose the best layout from AVAILABLE LAYOUTS for every slide automatically.
14. **VISUAL RICHNESS**: Use BOXES, ICONS, SIDELINE, SIDE-QUOTE, ARROWS, COMPARE, PYRAMID, or STAIRCASE for non-chart slides. Do not return plain text-only layouts.

IMAGE REQUIREMENT: Every non-CHART/STATS content slide MUST include exactly ONE <IMG query="..." /> tag placed appropriately for the slide layout. CHART or STATS slides do not require an image but MUST include a detailed chart interpretation paragraph.

TEXT DEPTH: For batafsil or kengaytirilgan content levels, EACH main point (a <DIV> with <H3> and <P>) MUST have 3–6 sentences in the <P> explaining the concept, implications, and an example or metric. For ixcham use 2–3 sentences, and minimal 1–2 sentences.
`;
  }

  // Partial template selection
  if (selectedTemplateCount < totalSlides) {
    return `1. Generate **EXACTLY {TOTAL_SLIDES} slides** — no more, no less
2. **MUST USE ALL SELECTED TEMPLATES**: You have ${selectedTemplateCount} selected template(s) — each MUST appear at least once
3. **REMAINING SLIDES**: Fill the other ${totalSlides - selectedTemplateCount} slides using layouts from ADDITIONAL LAYOUTS
4. Expand outline content — do NOT copy verbatim
5. IMAGE REQUIREMENT: Every non-CHART/STATS content slide MUST include exactly ONE <IMG query="..." /> tag placed to match the slide layout. CHART/STATS slides do not require an image but must include a detailed interpretation paragraph.
6. TEXT DEPTH: For batafsil/kengaytirilgan, each <P> must be 3–6 sentences. For ixcham use 2–3 sentences, minimal 1–2 sentences.
7. Vary SECTION layout attribute (left/right/vertical) throughout
8. For per-slide assignments: use the EXACT template specified
`;
  }

  // Full template constraint
  return `1. Generate **EXACTLY {TOTAL_SLIDES} slides** — no more, no less
2. **TEMPLATE CONSTRAINT**: Use ONLY layouts from AVAILABLE LAYOUTS. Any other tag = parsing failure
3. Expand outline content — do NOT copy verbatim
4. IMAGE REQUIREMENT: You may add ONE <IMG query="..." /> tag per slide when allowed by the template. If a selected template is a CHART/STATS type, omit the image and instead include a detailed chart interpretation paragraph.
5. TEXT DEPTH: For batafsil/kengaytirilgan, each <P> must be 3–6 sentences. For ixcham use 2–3 sentences, minimal 1–2 sentences.
6. Vary SECTION layout attribute (left/right/vertical) throughout
7. For per-slide assignments: use the EXACT template specified with NO structural changes
`;
    }

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeLogger = createLogger("api:presentation-generate");

  try {
    routeLogger.info("Presentation generation request received", { requestId });
    const guard = await guardAiRoute();
    if (guard.error) {
      routeLogger.warn("Presentation generation request rejected", { requestId });
      return guard.error;
    }
    const { session } = guard;

    const {
      title,
      prompt: userPrompt,
      outline,
      language,
      tone,
      modelId,
      modelProvider = DEFAULT_MODEL_PROVIDER,
      searchResults,
      textContent,
      audience,
      scenario,
      imageSource,
      templateContext,
      outlineTemplateHints,
      selectedTemplateCount,
    } = (await req.json()) as SlidesRequest;

    if (!title || !outline || !Array.isArray(outline) || !language) {
      routeLogger.warn(
        "Presentation generation request rejected: missing required fields",
        {
          requestId,
          hasTitle: Boolean(title),
          hasOutline: Array.isArray(outline),
          language,
        },
      );
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const totalSlides = outline.length;
    const templateCount = selectedTemplateCount ?? 0;

    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const filledPrompt = fillTemplate(SLIDES_TEMPLATE, {
      TITLE: title,
      PROMPT: userPrompt || "No specific prompt provided",
      CURRENT_DATE: currentDate,
      LANGUAGE: language,
      TONE: tone,
      OUTLINE_FORMATTED: outline.join("\n\n"),
      TOTAL_SLIDES: totalSlides.toString(),
      SEARCH_RESULTS: formatSearchResults(searchResults),
      SELECTED_CHUNKS_CONTEXT: "",
      TEXT_CONTENT: textContent || "ixcham",
      AUDIENCE: audience || "auto",
      SCENARIO: scenario || "auto",
      IMAGE_QUERY_STYLE: getImageQueryStyle(imageSource),
      AVAILABLE_LAYOUTS: buildAvailableLayouts(
        templateContext,
        templateCount,
        totalSlides,
      ),
      PER_SLIDE_REQUIREMENTS: buildPerSlideRequirements(
        templateContext,
        outlineTemplateHints,
      ),
      CRITICAL_RULES: buildCriticalRules(
        templateContext,
        templateCount,
        totalSlides,
      ),
    });

    routeLogger.info("Validated presentation generation request", {
      requestId,
      title,
      totalSlides,
      language,
      tone,
      modelProvider,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
      imageSource: imageSource || "automatic",
      templateCount,
    });
    try {
      assertModelIsConfigured(modelProvider, modelId);
    } catch (error) {
      routeLogger.error(
        "Presentation generation request rejected: invalid model configuration",
        error,
        {
          requestId,
          modelProvider,
          modelId: modelId || DEFAULT_OPENROUTER_MODEL,
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
    try {
      await ensureModelIsReady(modelProvider, modelId);
    } catch (error) {
      routeLogger.error(
        "Presentation generation request rejected: selected model could not be prepared",
        error,
        {
          requestId,
          modelProvider,
          modelId: modelId || DEFAULT_OPENROUTER_MODEL,
        },
      );
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to prepare selected model",
        },
        { status: 503 },
      );
    }
    const model = modelPicker(modelProvider, modelId);

    routeLogger.info("Presentation generation started", {
      requestId,
      title,
      totalSlides,
      modelProvider,
      modelId: modelId || DEFAULT_OPENROUTER_MODEL,
    });
    const result = streamText({
      model,
      prompt: filledPrompt,
    });

    routeLogger.info("Presentation generation stream created", {
      requestId,
      title,
      totalSlides,
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    routeLogger.error("Presentation generation failed", error, { requestId });
    return NextResponse.json(
      { error: "Failed to generate presentation slides" },
      { status: 500 },
    );
  }
}
