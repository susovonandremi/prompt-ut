// lib/gemini-prompts.ts

/**
 * Enhanced UI generation prompts with few-shot examples
 * and design system guidelines for DSL v2
 */

export const SYSTEM_PROMPT = `
You are a **World-Class UI/UX Design Engineer** (ex-Apple, Stripe, Vercel).
Your goal is to design **stunning, production-ready user interfaces** that delight users.

### YOUR PROCESS (Chain of Thought)
1.  **Analyze**: Understand the user's intent, vibe, and required functionality.
2.  **Plan**: Decide on the layout structure (Sidebar vs Top Nav, Card Grid vs List, etc.).
3.  **Design**: Choose a color palette (if not specified) and typography hierarchy.
4.  **Generate**: Output the JSON DSL.

### DSL SCHEMA (v2)
- **container**: Layout wrapper. Props: gap, padding, direction (horizontal/vertical/grid), cols, align, justify, style, maxWidth.
- **card**: Content box. Props: title, description, padding, variant (default/elevated/glass/flat), style, footer.
- **text**: Typography. Props: value, variant (h1-h4, body, small, muted, label, success, destructive), align.
- **button**: Interactive. Props: label, variant (primary/secondary/outline/ghost/destructive), icon, size.
- **input**: Form field. Props: label, placeholder, type.
- **textarea**: Multiline. Props: label, placeholder, rows.
- **image**: Visuals. Props: src, alt, aspectRatio, fit.
- **icon**: Vector icons. Props: name (Lucide), size, color.
- **badge**: Status. Props: label, variant (default/secondary/outline/destructive/success/warning).
- **avatar**: User profile. Props: src, initials, size.
- **separator**: Divider. Props: orientation.
- **chart**: Data Viz. Props: type (line/bar/area/pie), title, data (array of objects), xAxisKey, series (array of {key, color}), height.
- **table**: Data List. Props: headers (string[]), rows (object[]), variant (default/dense).

### DESIGN RULES (Strict)
1.  **Visual Hierarchy**: Use "h1" for page titles, "h2" for section headers. Use "muted" text for descriptions.
2.  **Whitespace**: Use "gap" and "padding" generously. Avoid cramped layouts. Use "xl" or "2xl" for section spacing.
3.  **Imagery**: ALWAYS include images or icons to break up text. Use "https://placehold.co/600x400" or Unsplash URLs.
4.  **Cards**: Use "card" for grouping related content. Use "grid" direction for collections.
5.  **Navigation**: If it's a full page, ALWAYS include a Header/Navbar.
6.  **Style**: Use "style.background" to add depth (e.g., "glass", "gradient-subtle").
7.  **Data**: Use "chart" for trends and "table" for dense lists. Use "success" variant for positive numbers.

### OUTPUT FORMAT
Return **ONLY** valid JSON. No markdown.
{
  "version": "2",
  "thinking": {
    "analysis": "...",
    "plan": "...",
    "design": "..."
  },
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
1.  **Analyze**: What is the user building? (Landing Page, Dashboard, Mobile App, etc.)
2.  **Vibe Check**: Modern, Corporate, Playful, Dark Mode?
3.  **Structure**: List key sections (Hero, Features, Stats, Testimonials).
4.  **Content**: Write catchy headlines and realistic data.

### OUTPUT FORMAT
Return a concise paragraph describing the UI. Start with "Create a [Type]...".
`;

export const FEW_SHOT_EXAMPLES = [
  {
    user: "Financial Stock Dashboard",
    output: {
      version: "2",
      thinking: {
        analysis: "User wants a Bloomberg-style financial dashboard. Needs charts, data tables, and live indicators.",
        plan: "Sidebar layout. Top ticker row. Main chart area. Watchlist table.",
        design: "Dark mode. Emerald green for gains, Rose red for losses. Glassmorphism cards."
      },
      variants: [
        {
          type: "container",
          props: { direction: "horizontal", style: { background: "default" }, height: "100vh" },
          children: [
            {
              type: "container",
              props: { width: "250px", padding: "lg", style: { border: true }, gap: "md" },
              children: [
                { type: "text", props: { value: "StockPulse", variant: "h3" } },
                { type: "separator" },
                { type: "button", props: { label: "Markets", variant: "ghost", icon: "BarChart2", align: "start" } },
                { type: "button", props: { label: "Portfolio", variant: "ghost", icon: "PieChart", align: "start" } },
                { type: "button", props: { label: "News", variant: "ghost", icon: "Newspaper", align: "start" } }
              ]
            },
            {
              type: "container",
              props: { padding: "xl", gap: "xl", style: { background: "muted" }, flex: 1 },
              children: [
                {
                  type: "container",
                  props: { direction: "grid", cols: 3, gap: "lg" },
                  children: [
                    {
                      type: "card",
                      props: { title: "S&P 500", description: "+1.2%", variant: "glass" },
                      children: [{ type: "text", props: { value: "4,567.89", variant: "h2", style: { color: "emerald-500" } } }]
                    },
                    {
                      type: "card",
                      props: { title: "NASDAQ", description: "-0.5%", variant: "glass" },
                      children: [{ type: "text", props: { value: "14,234.12", variant: "h2", style: { color: "rose-500" } } }]
                    },
                    {
                      type: "card",
                      props: { title: "DOW", description: "+0.8%", variant: "glass" },
                      children: [{ type: "text", props: { value: "35,123.45", variant: "h2", style: { color: "emerald-500" } } }]
                    }
                  ]
                },
                {
                  type: "container",
                  props: { direction: "grid", cols: 2, gap: "lg" },
                  children: [
                    {
                      type: "card",
                      props: { title: "Portfolio Performance", padding: "lg" },
                      children: [
                        {
                          type: "chart",
                          props: {
                            type: "area",
                            height: "300px",
                            data: [
                              { name: "Jan", value: 4000 }, { name: "Feb", value: 3000 },
                              { name: "Mar", value: 5000 }, { name: "Apr", value: 4500 },
                              { name: "May", value: 6000 }, { name: "Jun", value: 5500 }
                            ],
                            xAxisKey: "name",
                            series: [{ key: "value", color: "#10b981" }]
                          }
                        }
                      ]
                    },
                    {
                      type: "card",
                      props: { title: "Top Movers", padding: "lg" },
                      children: [
                        {
                          type: "table",
                          props: {
                            headers: ["Symbol", "Price", "Change"],
                            rows: [
                              { Symbol: "AAPL", Price: "$189.45", Change: "+1.2%" },
                              { Symbol: "TSLA", Price: "$234.12", Change: "-2.5%" },
                              { Symbol: "NVDA", Price: "$456.78", Change: "+3.4%" },
                              { Symbol: "AMD", Price: "$123.45", Change: "+0.8%" }
                            ]
                          }
                        }
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
    user: "SaaS Dashboard for Analytics",
    output: {
      version: "2",
      thinking: {
        analysis: "User wants a data-heavy dashboard. Needs clarity and hierarchy.",
        plan: "Sidebar layout. Top stats row. Main chart area. Recent activity list.",
        design: "Clean, white background with subtle borders. Primary color: Blue."
      },
      variants: [
        {
          type: "container",
          props: { direction: "horizontal", style: { background: "default" }, height: "100vh" },
          children: [
            {
              type: "container",
              props: { width: "250px", padding: "lg", style: { border: true }, gap: "md" },
              children: [
                { type: "text", props: { value: "Analytics", variant: "h3" } },
                { type: "separator" },
                { type: "button", props: { label: "Overview", variant: "ghost", icon: "LayoutDashboard", align: "start" } },
                { type: "button", props: { label: "Reports", variant: "ghost", icon: "FileText", align: "start" } },
                { type: "button", props: { label: "Settings", variant: "ghost", icon: "Settings", align: "start" } }
              ]
            },
            {
              type: "container",
              props: { padding: "xl", gap: "xl", style: { background: "muted" }, flex: 1 },
              children: [
                {
                  type: "container",
                  props: { direction: "horizontal", justify: "between", align: "center" },
                  children: [
                    { type: "text", props: { value: "Dashboard Overview", variant: "h2" } },
                    { type: "button", props: { label: "Export Data", variant: "outline", icon: "Download" } }
                  ]
                },
                {
                  type: "container",
                  props: { direction: "grid", cols: 3, gap: "lg" },
                  children: [
                    { type: "card", props: { title: "Total Revenue", description: "$45,231.89", icon: "DollarSign" } },
                    { type: "card", props: { title: "Active Users", description: "+2,345", icon: "Users" } },
                    { type: "card", props: { title: "Bounce Rate", description: "12.5%", icon: "Activity" } }
                  ]
                },
                {
                  type: "card",
                  props: { title: "Recent Transactions", padding: "lg" },
                  children: [
                    { type: "text", props: { value: "Stripe Payment - $120.00", variant: "body" } },
                    { type: "separator" },
                    { type: "text", props: { value: "PayPal Refund - $50.00", variant: "body" } }
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
    user: "Modern Landing Page for Coffee Shop",
    output: {
      version: "2",
      thinking: {
        analysis: "Consumer facing. Needs to be warm, inviting, and visual.",
        plan: "Hero with large image. Features grid. Testimonials. Footer.",
        design: "Warm tones (brown/orange). Large typography. Rounded corners."
      },
      variants: [
        {
          type: "container",
          props: { maxWidth: "full", style: { background: "default" } },
          children: [
            {
              type: "container",
              props: { direction: "horizontal", justify: "between", padding: "lg", maxWidth: "xl", align: "center" },
              children: [
                { type: "text", props: { value: "Brew & Co.", variant: "h3" } },
                {
                  type: "container",
                  props: { direction: "horizontal", gap: "md" },
                  children: [
                    { type: "button", props: { label: "Menu", variant: "ghost" } },
                    { type: "button", props: { label: "Locations", variant: "ghost" } },
                    { type: "button", props: { label: "Order Now", variant: "primary" } }
                  ]
                }
              ]
            },
            {
              type: "container",
              props: { padding: "2xl", align: "center", gap: "xl", style: { background: "gradient-subtle" } },
              children: [
                { type: "badge", props: { label: "New Seasonal Blend", variant: "secondary" } },
                { type: "text", props: { value: "Experience the Perfect Cup", variant: "h1", align: "center" } },
                { type: "text", props: { value: "Artisan roasted coffee delivered to your door.", variant: "muted", align: "center" } },
                {
                  type: "container",
                  props: { direction: "horizontal", gap: "md" },
                  children: [
                    { type: "button", props: { label: "Shop Coffee", variant: "primary", size: "lg" } },
                    { type: "button", props: { label: "Our Story", variant: "outline", size: "lg" } }
                  ]
                },
                {
                  type: "image",
                  props: { src: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200", aspectRatio: "wide", fit: "cover" }
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

Generate a **high-fidelity** UI layout based on the request above.
Follow the DSL v2 schema strictly.
Ensure the design is **visually stunning** and **production-ready**.
`;
}
