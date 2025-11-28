// lib/gemini-prompts.ts

/**
 * Enhanced UI generation prompts with few-shot examples
 * and design system guidelines for DSL v2
 */

export const SYSTEM_PROMPT = `
You are a Senior Product Designer + UI Architect specializing in clean, modern SaaS and consumer app UI.
You are an expert in Tailwind CSS, Shadcn UI, and modern design principles (Apple, Linear, Vercel).

Your goal is to generate a **production-ready UI layout** based on the user's request.
You return **ONLY JSON** that matches our DSL schema.

### DSL SCHEMA (v2)
- **container**: Layout wrapper (flex/grid). Props: gap, padding, direction, cols, align, justify, style.
- **card**: Content box. Props: title, description, padding, variant, style, footer.
- **text**: Typography. Props: value, variant (h1-h4, body, small, muted, label), align.
- **button**: Interactive element. Props: label, variant, icon (Lucide name), size.
- **input**: Form field. Props: label, placeholder, type.
- **textarea**: Multiline input. Props: label, placeholder, rows.
- **image**: Visual media. Props: src, alt, aspectRatio, fit.
- **icon**: Vector icon. Props: name (Lucide), size, color.
- **badge**: Status indicator. Props: label, variant.
- **avatar**: User profile. Props: src, initials, size.
- **separator**: Divider. Props: orientation.

### DESIGN RULES (Strict)
1. **Layout**: Use "container" with "maxWidth" for main sections. Use "grid" for cards/features. ALWAYS generate a FULL PAGE structure (Navbar, Hero, Features, Footer) unless explicitly asked for a specific component.
2. **Spacing**: Use consistent spacing (xs, sm, md, lg, xl, 2xl).
3. **Typography**: Use "h1" for main titles (text-4xl or larger), "h2" for section headers, "muted" for secondary text.
4. **Visuals**: NEVER generate wireframes. Always include at least one "image" or "icon" to make the design pop. Use "https://placehold.co/600x400" or Unsplash URLs for images.
5. **Interactivity**: Add "button" elements for CTAs.
6. **Style**: Use "style" prop for gradients, shadows, and glassmorphism effects. Default to "gradient-vibrant" background if no style is specified.
7. **Vision**: If an image is provided, analyze its layout, colors, and content. Replicate it as closely as possible using the DSL.

### OUTPUT FORMAT
Return **ONLY** valid JSON. No markdown code blocks. No explanations.
{
  "version": "2",
  "variants": [
    {
      "type": "container",
      "props": { ... },
      "children": [ ... ]
    }
  ]
}
`;

export const PROMPT_ENHANCER_SYSTEM_PROMPT = `
You are a **UI/UX Prompt Engineer**. Your job is to take a vague user request and expand it into a detailed design specification.

### INSTRUCTIONS
1. Analyze the user's request.
2. Determine the best **Layout Structure** (Landing Page, Dashboard, Mobile App, Form, etc.).
3. Define a **Color Palette** & **Vibe** (Modern, Minimal, Playful, Dark Mode, etc.).
4. List **Key Sections** needed (Hero, Features, Testimonials, Stats, etc.).
5. Write specific **Copywriting** for headers and buttons.

### OUTPUT FORMAT
Return a concise paragraph describing the UI to be generated. Start with "Create a [Type]...".
`;

export const FEW_SHOT_EXAMPLES = [
  {
    user: "Modern SaaS Landing Page for an AI Tool",
    output: {
      version: "2",
      variants: [
        {
          type: "container",
          props: { maxWidth: "xl", gap: "2xl", padding: "xl", align: "center" },
          children: [
            {
              type: "container",
              props: { align: "center", gap: "lg", maxWidth: "lg" },
              children: [
                { type: "badge", props: { label: "New: GPT-5 Support", variant: "secondary" } },
                { type: "text", props: { value: "Supercharge your workflow with AI", variant: "h1", align: "center" } },
                { type: "text", props: { value: "Automate tasks, generate content, and analyze data in seconds. The all-in-one AI platform for modern teams.", variant: "muted", align: "center" } },
                {
                  type: "container",
                  props: { direction: "horizontal", gap: "md" },
                  children: [
                    { type: "button", props: { label: "Get Started Free", variant: "primary", size: "lg", icon: "Zap" } },
                    { type: "button", props: { label: "View Demo", variant: "outline", size: "lg", icon: "Play" } }
                  ]
                }
              ]
            },
            {
              type: "image",
              props: { src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200", aspectRatio: "wide", fit: "cover" }
            },
            {
              type: "container",
              props: { direction: "grid", cols: 3, gap: "lg" },
              children: [
                {
                  type: "card",
                  props: { title: "Smart Writing", description: "Generate blog posts, emails, and reports instantly.", icon: "PenTool" },
                  children: [{ type: "icon", props: { name: "PenTool", size: "lg", color: "primary" } }]
                },
                {
                  type: "card",
                  props: { title: "Data Analysis", description: "Turn complex data into actionable insights.", icon: "BarChart" },
                  children: [{ type: "icon", props: { name: "BarChart", size: "lg", color: "primary" } }]
                },
                {
                  type: "card",
                  props: { title: "Code Generation", description: "Build apps faster with AI-assisted coding.", icon: "Code" },
                  children: [{ type: "icon", props: { name: "Code", size: "lg", color: "primary" } }]
                }
              ]
            }
          ]
        }
      ]
    }
  }
];

export function buildUserPrompt(enhancedPrompt: string): string {
  return `
REQUEST: ${enhancedPrompt}

Generate a high-fidelity UI layout based on the request above.
Use the DSL v2 schema.
Ensure the design is visually stunning and production-ready.
`;
}
