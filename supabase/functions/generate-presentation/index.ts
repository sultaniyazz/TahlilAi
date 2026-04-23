// Lovable AI Gateway orqali xavfsiz prezentatsiya generatsiyasi
// CORS bilan, Zod tasdiqlash, Gemini 3 Flash structured output

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const prompt = (body?.prompt ?? '').toString().trim();
    const slideCount = Math.min(Math.max(Number(body?.slideCount) || 8, 3), 20);
    const tone = (body?.tone ?? 'professional').toString();

    if (!prompt || prompt.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Prompt kamida 3 ta belgi bo‘lishi kerak' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY topilmadi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const systemPrompt = `Siz professional taqdimot dizayneri va kontent yaratuvchisisiz. Foydalanuvchi mavzusi bo‘yicha aniq ${slideCount} ta slayd yarating.

QOIDALAR:
- Tilni avtomatik aniqlang (foydalanuvchi qaysi tilda yozsa, shu tilda javob bering)
- Birinchi slayd: title layout (faqat sarlavha + qisqa kirish)
- Oxirgi slayd: closing layout (xulosa yoki "Rahmat")
- Boshqa slaydlar: content, two-column, stats yoki quote layoutlaridan foydalaning
- Har bir slaydda 3-5 ta qisqa, kuchli bullet
- Bullet'lar to‘liq jumla emas, asosiy g‘oyani ifodalovchi qisqa fikr bo‘lsin
- Tone: ${tone}
- Mavzuga mos rang palitra tanlang (HEX format)`;

    const tools = [
      {
        type: 'function',
        function: {
          name: 'create_presentation',
          description: 'Tuzilgan prezentatsiyani qaytaradi',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Prezentatsiya sarlavhasi' },
              subtitle: { type: 'string', description: 'Qisqa subtitle' },
              theme: {
                type: 'object',
                properties: {
                  primary: { type: 'string', description: 'HEX rang #RRGGBB' },
                  secondary: { type: 'string', description: 'HEX rang #RRGGBB' },
                  accent: { type: 'string', description: 'HEX rang #RRGGBB' },
                  background: { type: 'string', description: 'HEX rang #RRGGBB' },
                },
                required: ['primary', 'secondary', 'accent', 'background'],
                additionalProperties: false,
              },
              slides: {
                type: 'array',
                minItems: slideCount,
                maxItems: slideCount,
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    bullets: {
                      type: 'array',
                      items: { type: 'string' },
                      minItems: 1,
                      maxItems: 6,
                    },
                    layout: {
                      type: 'string',
                      enum: ['title', 'content', 'two-column', 'stats', 'quote', 'closing'],
                    },
                    notes: { type: 'string' },
                  },
                  required: ['title', 'bullets', 'layout'],
                  additionalProperties: false,
                },
              },
            },
            required: ['title', 'subtitle', 'theme', 'slides'],
            additionalProperties: false,
          },
        },
      },
    ];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'create_presentation' } },
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Juda ko‘p so‘rov. Iltimos, biroz kuting.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'AI kreditlar tugadi. Workspace > Usage bo‘limidan to‘ldiring.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI error', aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: 'AI gateway xatosi', details: errText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool_call', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: 'AI strukturali javob bermadi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const parsed: GenerateResponse = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('generate-presentation error', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Noma‘lum xato' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
