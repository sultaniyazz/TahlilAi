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
    title: "The Future of Artificial Intelligence in Engineering",
    prompt:
      "Create a presentation on the future of artificial intelligence in engineering, covering automation, design optimization, and workforce impact.",
    slides: 5,
    language: "en-US",
  },
  {
    id: "climate",
    icon: "🌍",
    title: "Climate Change Solutions: A Global Perspective",
    prompt:
      "Build a presentation on climate change solutions from a global perspective, including renewable energy, policy, and community action.",
    slides: 5,
    language: "en-US",
  },
  {
    id: "startup",
    icon: "🎯",
    title: "Startup Pitch Deck: Tech Innovation",
    prompt:
      "Create a startup pitch deck for a tech innovation product covering problem, solution, market, traction, and ask.",
    slides: 5,
    language: "en-US",
  },
  {
    id: "ml-health",
    icon: "🤖",
    title: "Machine Learning in Healthcare Applications",
    prompt:
      "Present machine learning applications in healthcare: diagnostics, imaging, patient outcomes, and ethical considerations.",
    slides: 5,
    language: "en-US",
  },
  {
    id: "energy",
    icon: "🌱",
    title: "Sustainable Energy Technologies",
    prompt:
      "Explain sustainable energy technologies including solar, wind, storage, and grid modernization with real-world examples.",
    slides: 5,
    language: "en-US",
  },
  {
    id: "security",
    icon: "🔒",
    title: "Digital Security Best Practices",
    prompt:
      "Outline digital security best practices for teams: authentication, encryption, incident response, and user training.",
    slides: 5,
    language: "en-US",
  },
];
