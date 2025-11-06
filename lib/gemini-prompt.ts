// lib/gemini-prompts.ts

/**
 * Enhanced UI generation prompts with few-shot examples
 * and design system guidelines
 */

export const SYSTEM_PROMPT = `
You are a Senior Product Designer + UI Architect specializing in clean, modern SaaS and consumer app UI.

You return **ONLY JSON** that matches our DSL schema:
- type: container | card | text | button | input | image
- props: object
- children: array of nodes

### DESIGN LANGUAGE RULES (must follow)
- Use a **12-column layout**
- Content width should max at **1220px**
- Use consistent spacing scale: xs(4), sm(8), md(12), lg(20), xl(32), 2xl(48)
- Always include a clear **visual hierarchy**:
  - h1 = brand/section title
  - h2 = section heading
  - body text is subtle
- Ensure **every card has padding and spacing**
- All images must have **rounded corners**
- Use **consistent button styling**: primary first, secondary minimal

### LAYOUT STRUCTURE PATTERN (important)
Return **exactly 1 strong layout** inside "variants", structured:

{
  "version": "1",
  "variants": [
    {
      "type": "container",
      "props": { "maxW": "lg", "gap": "xl" },
      "children": [
         { "type": "card", "props": {...}, "children": [...] },
         { "type": "container", "props": {...}, "children": [...] }
      ]
    }
  ]
}

### DO NOT:
- Do not add extra keys outside DSL
- Do not use raw px numbers, only spacing tokens
- Do not output multiple UI variants — provide only **one best UI**

### OUTPUT FORMAT (final and strict)
Return only:
{ "version": "1", "variants": [ <your final UI layout> ] }

No text before or after.
`;

export const FEW_SHOT_EXAMPLES = [
  {
    title: "E-commerce Landing Page",
    output: {
      version: "1",
      variants: [
        {
          type: "container",
          props: { gap: "xl", padding: "lg", maxWidth: "lg" },
          children: [
            {
              type: "container",
              props: { gap: "md", padding: "xl", align: "center" },
              children: [
                { type: "text", props: { value: "Premium Wireless Headphones", variant: "h1" } },
                { type: "text", props: { value: "Immersive sound. All-day comfort. Studio-quality audio.", variant: "muted" } },
                {
                  type: "container",
                  props: { direction: "horizontal", gap: "sm" },
                  children: [
                    { type: "button", props: { label: "Shop Now", variant: "primary" } },
                    { type: "button", props: { label: "Learn More", variant: "outline" } }
                  ]
                }
              ]
            },
            {
              type: "image",
              props: {
                src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                alt: "Premium headphones product shot"
              }
            },
            {
              type: "container",
              props: { gap: "lg" },
              children: [
                { type: "text", props: { value: "Features", variant: "h2" } },
                {
                  type: "container",
                  props: { direction: "grid", cols: 3, gap: "md" },
                  children: [
                    {
                      type: "card",
                      props: { title: "Active Noise Cancellation", padding: "md" },
                      children: [
                        { type: "text", props: { value: "Block out the world with advanced ANC technology", variant: "body" } }
                      ]
                    },
                    {
                      type: "card",
                      props: { title: "40-Hour Battery", padding: "md" },
                      children: [
                        { type: "text", props: { value: "All-day listening with fast charging support", variant: "body" } }
                      ]
                    },
                    {
                      type: "card",
                      props: { title: "Premium Materials", padding: "md" },
                      children: [
                        { type: "text", props: { value: "Crafted with aluminum and memory foam", variant: "body" } }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    title: "SaaS Dashboard",
    output: {
      version: "1",
      variants: [
        {
          type: "container",
          props: { gap: "lg", padding: "md" },
          children: [
            {
              type: "container",
              props: { direction: "horizontal", gap: "md" },
              children: [
                { type: "text", props: { value: "Analytics Dashboard", variant: "h2" } },
                { type: "button", props: { label: "Export Report", variant: "secondary" } }
              ]
            },
            {
              type: "container",
              props: { direction: "grid", cols: 4, gap: "md" },
              children: [
                {
                  type: "card",
                  props: { title: "Total Revenue", padding: "md" },
                  children: [
                    { type: "text", props: { value: "$124,563", variant: "h3" } },
                    { type: "text", props: { value: "+18.2% from last month", variant: "muted" } }
                  ]
                },
                {
                  type: "card",
                  props: { title: "Active Users", padding: "md" },
                  children: [
                    { type: "text", props: { value: "8,239", variant: "h3" } },
                    { type: "text", props: { value: "+12.5% from last month", variant: "muted" } }
                  ]
                },
                {
                  type: "card",
                  props: { title: "Conversion Rate", padding: "md" },
                  children: [
                    { type: "text", props: { value: "3.4%", variant: "h3" } },
                    { type: "text", props: { value: "+0.8% from last month", variant: "muted" } }
                  ]
                },
                {
                  type: "card",
                  props: { title: "Avg Session", padding: "md" },
                  children: [
                    { type: "text", props: { value: "4m 32s", variant: "h3" } },
                    { type: "text", props: { value: "-2.1% from last month", variant: "muted" } }
                  ]
                }
              ]
            },
            {
              type: "card",
              props: { title: "Recent Activity", padding: "lg" },
              children: [
                { type: "text", props: { value: "New user signup: john@example.com", variant: "body" } },
                { type: "text", props: { value: "Payment processed: $299.00", variant: "body" } },
                { type: "text", props: { value: "Support ticket opened: #1234", variant: "body" } }
              ]
            }
          ]
        }
      ]
    }
  }
];

export function buildUserPrompt(userInput: string, style: string): string {
  const styleGuidance = {
    "apple-min": "Apple Minimal Style: Use generous whitespace, soft shadows, subtle borders, san-serif typography, and a calm, sophisticated color palette.",
    "market": "Marketplace Style: Product-focused with prominent images, price displays, clear CTAs, grid layouts for items, and trust signals (ratings, reviews).",
    "minimal": "Ultra Minimal Style: Maximum whitespace, essential elements only, monochrome palette, clean typography, and subtle interactions."
  };

  return `
USER REQUEST: ${userInput}

DESIGN STYLE: ${styleGuidance[style as keyof typeof styleGuidance] || styleGuidance["apple-min"]}

REQUIREMENTS:
1. Generate exactly 3 distinct, high-quality variants
2. Each variant must include:
   - Hero section with h1 title, subtitle, and CTA
   - 2-3 feature/content sections
   - Clear visual hierarchy
   - Realistic, contextual content
   - At least one image
3. Follow the spacing system (xs/sm/md/lg/xl)
4. Use appropriate typography variants (h1/h2/h3/body/muted)
5. Organize content with cards and containers
6. Ensure mobile-friendly layouts (use grid cols: 2-3)

Return ONLY the JSON object. No markdown, no explanations.
`;
}
