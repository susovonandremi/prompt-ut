// lib/local_archetypes.ts
import type { UIDSL } from "./ui-schema"; // <- relative to /lib

export function generateBestVariant(prompt: string, style = "apple-min"): UIDSL {
  return {
    type: "container",
    props: { gap: "lg" },
    children: [
      {
        type: "card",
        props: { title: "Hero" },
        children: [
          { type: "text", props: { value: "AI UI Generator", variant: "h1" } },
          { type: "text", props: { value: `Prompt: ${prompt}`, variant: "muted" } },
          { type: "button", props: { label: "Get Started" } },
        ],
      },
      {
        type: "card",
        props: { title: "Highlights" },
        children: [
          { type: "text", props: { value: "• Clean layout\n• Good spacing\n• Real components" } },
        ],
      },
      {
        type: "card",
        props: { title: "Call to action" },
        children: [
          { type: "button", props: { label: "Try Demo" } },
        ],
      },
    ],
  };
}
