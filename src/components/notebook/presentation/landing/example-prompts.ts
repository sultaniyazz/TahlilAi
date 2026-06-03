export interface ExamplePrompt {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  slides: number;
  language: string;
}

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: "ai-engineering",
    icon: "⚡",
    title: "Muhandislikda sun'iy intellektning kelajagi",
    prompt:
      "Muhandislikda sun'iy intellektning kelajagi haqida taqdimot yarating, unda avtomatlashtirish, dizaynni optimallashtirish va ishchi kuchiga ta'sirini qamrab oling.",
    slides: 5,
    language: "uz-UZ",
  },
  {
    id: "climate",
    icon: "🌍",
    title: "Iqlim o'zgarishi yechimlari: Global istiqbol",
    prompt:
      "Iqlim o'zgarishi yechimlari bo'yicha global istiqbolda taqdimot tuzing, jumladan qayta tiklanadigan energiya, siyosat va jamoatchilik harakatlari.",
    slides: 5,
    language: "uz-UZ",
  },
  {
    id: "startup",
    icon: "🎯",
    title: "Startup Pitch: Texnologik innovatsiya",
    prompt:
      "Texnologik innovatsiya mahsuloti uchun startup pitch deck yarating: muammo, yechim, bozor, rivojlanish va taklif qismlarini o'z ichiga olsin.",
    slides: 5,
    language: "uz-UZ",
  },
  {
    id: "ml-health",
    icon: "🤖",
    title: "Sog'liqni saqlashda mashinali o'qitish (ML)",
    prompt:
      "Sog'liqni saqlashda mashinali o'qitish dasturlarini taqdim eting: diagnostika, tasvirlash, bemorlar natijalari va axloqiy jihatlar.",
    slides: 5,
    language: "uz-UZ",
  },
  {
    id: "energy",
    icon: "🌱",
    title: "Barqaror energiya texnologiyalari",
    prompt:
      "Barqaror energiya texnologiyalarini tushuntiring, jumladan quyosh, shamol, saqlash va tarmoq modernizatsiyasi, real hayotiy misollar bilan.",
    slides: 5,
    language: "uz-UZ",
  },
  {
    id: "security",
    icon: "🔒",
    title: "Raqamli xavfsizlik bo'yicha eng yaxshi amaliyotlar",
    prompt:
      "Jamoalar uchun raqamli xavfsizlik bo'yicha eng yaxshi amaliyotlarni ko'rsatib bering: autentifikatsiya, shifrlash, hodisalarga javob berish va foydalanuvchilarni o'qitish.",
    slides: 5,
    language: "uz-UZ",
  },
];