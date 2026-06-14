import type { PromptCategory } from "./types";

export interface CategoryMeta {
  id: PromptCategory;
  label: string;
  icon: string; // lucide icon name handled in UI
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "content", label: "Content Writing", icon: "PenLine", description: "Articles, blogs, essays" },
  { id: "coding", label: "Coding", icon: "Code2", description: "Code, debugging, reviews" },
  { id: "marketing", label: "Marketing", icon: "Megaphone", description: "Campaigns & copy" },
  { id: "business", label: "Business", icon: "Briefcase", description: "Strategy & plans" },
  { id: "study", label: "Study", icon: "GraduationCap", description: "Learning & summaries" },
  { id: "image", label: "Image Generation", icon: "Image", description: "Midjourney & visuals" },
  { id: "social", label: "Social Media", icon: "Share2", description: "Posts & captions" },
];

export interface PromptInput {
  category: PromptCategory;
  topic: string;
  goal: string;
  audience: string;
  style: string;
}

function clean(v: string, fallback: string) {
  return v.trim() || fallback;
}

export function generatePrompt(input: PromptInput): string {
  const topic = clean(input.topic, "the given subject");
  const goal = clean(input.goal, "produce a high-quality result");
  const audience = clean(input.audience, "a general audience");
  const style = clean(input.style, "clear and professional");

  switch (input.category) {
    case "content":
      return `Act as an expert content writer and editor. Write about "${topic}".

Objective: ${goal}
Target audience: ${audience}
Tone & style: ${style}

Requirements:
- Open with a hook that earns attention in the first two sentences.
- Use a logical structure with clear headings and short, scannable paragraphs.
- Support key claims with concrete examples or data where relevant.
- End with a strong takeaway or call to action.
- Keep the language ${style} and tailored to ${audience}.

Deliver the final piece only, formatted in Markdown.`;

    case "coding":
      return `Act as a senior software engineer and pair programmer. Help me with: "${topic}".

Goal: ${goal}
Context / stack: ${audience}
Constraints & preferences: ${style}

Requirements:
- Explain your approach briefly before writing any code.
- Provide clean, production-ready, well-commented code.
- Handle edge cases and errors gracefully.
- Note any trade-offs, assumptions, or follow-up improvements.
- If something is ambiguous, ask clarifying questions before coding.`;

    case "marketing":
      return `Act as a senior marketing strategist and copywriter. Create marketing content for "${topic}".

Goal: ${goal}
Target audience: ${audience}
Brand voice & style: ${style}

Requirements:
- Lead with a benefit-driven, emotionally resonant message.
- Address the audience's pain points and desires directly.
- Include a clear, compelling call to action.
- Provide 3 distinct variations (short, medium, long).
- Optimize for conversions while staying ${style}.`;

    case "business":
      return `Act as an experienced business consultant. Advise on "${topic}".

Objective: ${goal}
Stakeholders / audience: ${audience}
Style & format: ${style}

Requirements:
- Provide a structured, actionable analysis.
- Include opportunities, risks, and concrete next steps.
- Back recommendations with reasoning and, where possible, frameworks.
- Summarize key points in an executive summary at the top.
- Keep it ${style} and decision-ready.`;

    case "study":
      return `Act as an expert tutor and learning coach. Help me learn "${topic}".

Learning goal: ${goal}
My level / audience: ${audience}
Preferred style: ${style}

Requirements:
- Explain concepts simply, then progressively add depth.
- Use analogies and real-world examples.
- Provide a short summary, key takeaways, and 3 practice questions.
- Highlight common mistakes and how to avoid them.
- Keep explanations ${style}.`;

    case "image":
      return `${topic}, ${style} style, designed for ${audience}.

Detailed scene: ${goal}. Highly detailed, professional composition, balanced lighting, rich color palette, sharp focus, depth of field, 8k, ultra-realistic textures${style ? `, ${style}` : ""}.

Camera & rendering: cinematic angle, volumetric lighting, photorealistic rendering.
Negative prompt: blurry, low quality, distorted, watermark, extra limbs, text artifacts.
Aspect ratio: 16:9 --v 6 --style raw`;

    case "social":
      return `Act as a social media expert and creative copywriter. Create a post about "${topic}".

Goal: ${goal}
Platform / audience: ${audience}
Tone & style: ${style}

Requirements:
- Write a scroll-stopping hook as the first line.
- Keep it concise, punchy, and ${style}.
- Add a clear call to action.
- Suggest 5-8 relevant hashtags.
- Provide 2 caption variations and a short version for Stories.`;

    default:
      return `Write about "${topic}" with the goal to ${goal} for ${audience} in a ${style} style.`;
  }
}
