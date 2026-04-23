// Lovable AI Gateway orqali xavfsiz prezentatsiya generatsiyasi
// CORS sarlavhalari barcha so'rovlar uchun ochiq
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
  // 1. CORS Preflight so'roviga darhol 200 OK javobini berish
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    const prompt = (body?.prompt ?? '').toString().trim();
    const slideCount = Math.min(Math.max(Number(body?.slideCount) || 8, 3), 20);
    const tone = (body?.tone ?? 'professional').toString();

    // Prompt tekshiruvi
    if (!prompt || prompt.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Prompt kamida 3 ta belgi bo‘lishi kerak' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // API Keyni olish
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY topilmadi. Secrets bo‘limini tekshiring.' }),
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
              title: { type: 'string' },
              subtitle: { type: 'string' },
              theme: {
                type: 'object',
                properties: {
                  primary: { type: 'string' },
                  secondary: { type: 'string' },
                  accent: { type: 'string' },
                  background: { type: 'string' },
                },
                required: ['primary', 'secondary', 'accent', 'background'],
              },
              slides: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    bullets: { type: 'array', items: { type: 'string' } },
                    layout: { type: 'string', enum: ['title', 'content', 'two-column', 'stats', 'quote', 'closing'] },
                    notes: { type: 'string' },
                  },
                  required: ['title', 'bullets', 'layout'],
                },
              },
            },
            required: ['title', 'subtitle', 'theme', 'slides'],
          },
        },
      },
    ];

    // AI Gateway'ga so'rov yuborish
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp', // Model nomi yangilandi
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'create_presentation' } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return new Response(
        JSON.stringify({ error: 'AI gateway xatosi', details: errText }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      return new Response(
        JSON.stringify({ error: 'AI strukturali javob bermadi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const parsed: GenerateResponse = JSON.parse(toolCall.function.arguments);

    // Muvaffaqiyatli javob
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Noma‘lum xato' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});