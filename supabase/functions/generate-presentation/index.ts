const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlideOutput {
  title: string;
  bullets: string[];
  layout: 'title' | 'content' | 'two-column' | 'stats' | 'quote' | 'closing';
  notes?: string;
}

interface GenerateResponse {
  title: string;
  subtitle: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  slides: SlideOutput[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = (body?.prompt ?? '').toString().trim();
    const slideCount = Math.min(Math.max(Number(body?.slideCount) || 8, 3), 20);
    const tone = (body?.tone ?? 'professional').toString();

    if (!prompt || prompt.length < 3) {
      return new Response(
        JSON.stringify({ error: "Prompt kamida 3 ta belgi bo'lishi kerak" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENROUTER_API_KEY topilmadi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const systemPrompt = `Siz professional taqdimot dizayneri va kontent yaratuvchisisiz. Foydalanuvchi mavzusi bo'yicha aniq ${slideCount} ta slayd yarating.

QOIDALAR:
- Tilni avtomatik aniqlang (foydalanuvchi qaysi tilda yozsa, shu tilda javob bering)
- Birinchi slayd: title layout (faqat sarlavha + qisqa kirish)
- Oxirgi slayd: closing layout (xulosa yoki "Rahmat")
- Boshqa slaydlar: content, two-column, stats yoki quote layoutlaridan foydalaning
- Har bir slaydda 3-5 ta qisqa, kuchli bullet
- Tone: ${tone}
- Mavzuga mos rang palitra tanlang (HEX format)

MUHIM: Faqat JSON qaytaring, boshqa hech narsa yozmang. Quyidagi formatda:
{
  "title": "...",
  "subtitle": "...",
  "theme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "slides": [
    {
      "title": "...",
      "bullets": ["...", "...", "..."],
      "layout": "title",
      "notes": "..."
    }
  ]
}`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nqoqlqtcaeepjvgufzfi.supabase.co',
        'X-Title': 'Presentation Generator',
      },
      body: JSON.stringify({
     model: 'openrouter/free',
        messages: [
          {
            role: 'user',
            content: systemPrompt + '\n\nMavzu: ' + prompt,
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({ error: 'OpenRouter xatosi', details: errText }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const aiData = await aiResponse.json();
    const rawText = aiData?.choices?.[0]?.message?.content ?? '';

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'AI JSON qaytarmadi', raw: rawText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const parsed: GenerateResponse = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Noma'lum xato" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});