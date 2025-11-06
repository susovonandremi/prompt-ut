// lib/ui-schema.ts (Enhanced with post-processing and ranking)
import { z } from "zod";

/* ==================== TYPE DEFINITIONS ==================== */

export type SpacingKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type DirectionKey = "vertical" | "horizontal" | "grid";
export type AlignKey = "start" | "center" | "end";
export type MaxWidthKey = "sm" | "md" | "lg" | "xl" | "full";
export type TextVariant = "h1" | "h2" | "h3" | "body" | "small" | "muted";
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type CardVariant = "default" | "elevated" | "glass" | "flat";

export type UIDSL =
  | {
      type: "container";
      props?: {
        gap?: SpacingKey;
        padding?: SpacingKey;
        direction?: DirectionKey;
        cols?: 1 | 2 | 3 | 4;
        maxWidth?: MaxWidthKey;
        align?: AlignKey;
        [key: string]: any;
      };
      children?: UIDSL[];
    }
  | {
      type: "text";
      props: {
        value: string;
        variant?: TextVariant;
      };
    }
  | {
      type: "button";
      props: {
        label: string;
        variant?: ButtonVariant;
      };
    }
  | {
      type: "input";
      props: {
        placeholder?: string;
        type?: string;
      };
    }
  | {
      type: "card";
      props: {
        title: string;
        padding?: SpacingKey;
        variant?: CardVariant;
      };
      children?: UIDSL[];
    }
  | {
      type: "image";
      props: {
        src: string;
        alt?: string;
      };
    };

export type VariantsResponse = {
  version: string;
  variants: UIDSL[];
};

/* ==================== NORMALIZATION ==================== */

/**
 * Normalize loose/noisy Gemini output into strict UIDSL
 */
export function normalizeNode(node: any): UIDSL {
  if (!node || typeof node !== "object") {
    return { type: "text", props: { value: "" } };
  }

  // Handle Gemini aliases: component -> type, text -> value
  const rawType = (node.type ?? node.component ?? "").toString().toLowerCase();
  const type = ["container", "card", "text", "button", "input", "image"].includes(rawType)
    ? rawType
    : "container";

  // Extract children
  const children = Array.isArray(node.children)
    ? node.children.filter(Boolean).map(normalizeNode)
    : undefined;

  switch (type) {
    case "container": {
      return {
        type: "container",
        props: {
          gap: normalizeSpacing(node.props?.gap ?? node.gap),
          padding: normalizeSpacing(node.props?.padding ?? node.padding),
          direction: normalizeDirection(node.props?.direction ?? node.direction),
          cols: normalizeCols(node.props?.cols ?? node.cols),
          maxWidth: normalizeMaxWidth(node.props?.maxWidth ?? node.maxWidth),
          align: normalizeAlign(node.props?.align ?? node.align),
        },
        children,
      };
    }

    case "card": {
      return {
        type: "card",
        props: {
          title: node.props?.title ?? node.title ?? "Card",
          padding: normalizeSpacing(node.props?.padding ?? node.padding),
          variant: normalizeCardVariant(node.props?.variant ?? node.variant),
        },
        children,
      };
    }

    case "text": {
      return {
        type: "text",
        props: {
          value: node.props?.value ?? node.value ?? node.text ?? "",
          variant: normalizeTextVariant(node.props?.variant ?? node.variant),
        },
      };
    }

    case "button": {
      return {
        type: "button",
        props: {
          label: node.props?.label ?? node.label ?? node.text ?? "Button",
          variant: normalizeButtonVariant(node.props?.variant ?? node.variant),
        },
      };
    }

    case "input": {
      return {
        type: "input",
        props: {
          placeholder: node.props?.placeholder ?? node.placeholder ?? "",
          type: node.props?.type ?? node.inputType ?? node.fieldType ?? "text",
        },
      };
    }

    case "image": {
      return {
        type: "image",
        props: {
          src: node.props?.src ?? node.src ?? "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
          alt: node.props?.alt ?? node.alt ?? "",
        },
      };
    }

    default:
      return { type: "text", props: { value: "" } };
  }
}

/* ==================== NORMALIZERS ==================== */

function normalizeSpacing(val: any): SpacingKey | undefined {
  if (!val) return undefined;
  const allowed: SpacingKey[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  return allowed.includes(val) ? val : "md";
}

function normalizeDirection(val: any): DirectionKey | undefined {
  if (!val) return undefined;
  const allowed: DirectionKey[] = ["vertical", "horizontal", "grid"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeCols(val: any): 1 | 2 | 3 | 4 | undefined {
  if (!val) return undefined;
  const num = parseInt(val);
  return [1, 2, 3, 4].includes(num) ? (num as 1 | 2 | 3 | 4) : undefined;
}

function normalizeMaxWidth(val: any): MaxWidthKey | undefined {
  if (!val) return undefined;
  const allowed: MaxWidthKey[] = ["sm", "md", "lg", "xl", "full"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeAlign(val: any): AlignKey | undefined {
  if (!val) return undefined;
  const allowed: AlignKey[] = ["start", "center", "end"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeTextVariant(val: any): TextVariant | undefined {
  if (!val) return undefined;
  const allowed: TextVariant[] = ["h1", "h2", "h3", "body", "small", "muted"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeButtonVariant(val: any): ButtonVariant | undefined {
  if (!val) return undefined;
  const allowed: ButtonVariant[] = ["primary", "secondary", "outline", "ghost"];
  return allowed.includes(val) ? val : "primary";
}

function normalizeCardVariant(val: any): CardVariant | undefined {
  if (!val) return undefined;
  const allowed: CardVariant[] = ["default", "elevated", "glass", "flat"];
  return allowed.includes(val) ? val : "default";
}

/* ==================== RESPONSE PROCESSING ==================== */

/**
 * Process raw Gemini JSON response
 */
export function normalizeResponse(data: any): VariantsResponse {
  try {
    // Handle wrapped variants (Gemini sometimes returns { root: {...} })
    const variants = Array.isArray(data?.variants)
      ? data.variants.map((v: any) => {
          if (v?.root) return normalizeNode(v.root);
          return normalizeNode(v);
        })
      : [];

    return {
      version: data?.version ?? "1",
      variants: variants.filter((v: any) => v !== null),
    };
  } catch (error) {
    console.error("Normalization error:", error);
    return { version: "1", variants: [] };
  }
}

/* ==================== VARIANT RANKING ==================== */

interface NodeCounts {
  container: number;
  card: number;
  text: number;
  button: number;
  input: number;
  image: number;
  total: number;
  depth: number;
}

/**
 * Count nodes and calculate max depth
 */
function analyzeTree(node: UIDSL, depth = 0, counts: NodeCounts = {
  container: 0,
  card: 0,
  text: 0,
  button: 0,
  input: 0,
  image: 0,
  total: 0,
  depth: 0,
}): NodeCounts {
  counts[node.type as keyof NodeCounts] = (counts[node.type as keyof NodeCounts] || 0) + 1;
  counts.total++;
  counts.depth = Math.max(counts.depth, depth);

  if ("children" in node && node.children) {
    for (const child of node.children) {
      analyzeTree(child, depth + 1, counts);
    }
  }

  return counts;
}

/**
 * Check if tree contains specific text
 */
function containsText(node: UIDSL, search: string): boolean {
  if (node.type === "text" && node.props.value.toLowerCase().includes(search)) {
    return true;
  }
  if ("children" in node && node.children) {
    return node.children.some(child => containsText(child, search));
  }
  return false;
}

/**
 * Score a variant based on quality metrics
 */
function scoreVariant(variant: UIDSL, prompt: string): number {
  const counts = analyzeTree(variant);
  let score = 0;

  // Structure quality (40 points max)
  score += counts.card * 8; // Cards are good structure
  score += counts.container * 4; // Containers show organization
  score += Math.min(counts.image * 6, 12); // Images add visual interest (max 2)
  score += Math.min(counts.button * 5, 15); // CTAs are important (max 3)
  score += counts.input * 3; // Inputs show interactivity

  // Completeness (30 points max)
  const hasHero = containsText(variant, "hero") || counts.text >= 2;
  const hasCTA = counts.button >= 1;
  const hasImage = counts.image >= 1;
  const hasCards = counts.card >= 2;
  
  if (hasHero) score += 8;
  if (hasCTA) score += 10;
  if (hasImage) score += 6;
  if (hasCards) score += 6;

  // Size appropriateness (20 points max)
  if (counts.total >= 8 && counts.total <= 40) {
    score += 20;
  } else if (counts.total >= 6 && counts.total <= 50) {
    score += 10;
  } else if (counts.total > 60) {
    score -= 10; // Penalize overly complex trees
  }

  // Depth appropriateness (10 points max)
  if (counts.depth >= 2 && counts.depth <= 4) {
    score += 10;
  } else if (counts.depth > 5) {
    score -= 5; // Penalize too much nesting
  }

  // Prompt relevance bonus (contextual)
  const promptLower = prompt.toLowerCase();
  if (promptLower.includes("dashboard") && counts.card >= 3) score += 10;
  if (promptLower.includes("landing") && hasHero && hasCTA) score += 10;
  if (promptLower.includes("shop") && hasImage && counts.card >= 2) score += 10;
  if (promptLower.includes("form") && counts.input >= 2) score += 10;

  return score;
}

/**
 * Rank variants and return the best one
 */
export function selectBestVariant(variants: UIDSL[], prompt: string): UIDSL | null {
  if (variants.length === 0) return null;
  if (variants.length === 1) return variants[0];

  const scored = variants.map((variant, index) => ({
    variant,
    index,
    score: scoreVariant(variant, prompt),
  }));

  scored.sort((a, b) => b.score - a.score);

  console.log("[Variant Ranking]", scored.map(s => ({ idx: s.index, score: s.score })));

  return scored[0].variant;
}