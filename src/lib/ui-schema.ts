// lib/ui-schema.ts (DSL v2)
import { z } from "zod";

/* ==================== TYPE DEFINITIONS ==================== */

export type SpacingKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type DirectionKey = "vertical" | "horizontal" | "grid";
export type AlignKey = "start" | "center" | "end" | "between";
export type MaxWidthKey = "sm" | "md" | "lg" | "xl" | "2xl" | "full";
export type TextVariant = "h1" | "h2" | "h3" | "h4" | "body" | "small" | "muted" | "label" | "success" | "destructive";
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type CardVariant = "default" | "elevated" | "glass" | "flat" | "bordered";
export type BadgeVariant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning";

// New Style Props
export interface StyleProps {
  background?: "default" | "muted" | "primary" | "secondary" | "glass" | "gradient-subtle" | "gradient-vibrant";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
  border?: boolean;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  className?: string; // Escape hatch for Tailwind
}

export type UIDSL =
  | {
    type: "container";
    props?: {
      gap?: SpacingKey;
      padding?: SpacingKey;
      direction?: DirectionKey;
      cols?: 1 | 2 | 3 | 4 | 6 | 12;
      maxWidth?: MaxWidthKey;
      align?: AlignKey;
      justify?: AlignKey;
      style?: StyleProps;
      [key: string]: any;
    };
    children?: UIDSL[];
  }
  | {
    type: "text";
    props: {
      value: string;
      variant?: TextVariant;
      align?: "left" | "center" | "right";
    };
  }
  | {
    type: "button";
    props: {
      label: string;
      variant?: ButtonVariant;
      icon?: string; // Lucide icon name
      size?: "sm" | "md" | "lg" | "icon";
      action?: string; // For future interactivity
    };
  }
  | {
    type: "input";
    props: {
      label?: string;
      placeholder?: string;
      type?: string;
      name?: string;
    };
  }
  | {
    type: "textarea";
    props: {
      label?: string;
      placeholder?: string;
      rows?: number;
    };
  }
  | {
    type: "card";
    props: {
      title?: string;
      description?: string;
      padding?: SpacingKey;
      variant?: CardVariant;
      style?: StyleProps;
      footer?: UIDSL[]; // New: explicit footer slot support (as children)
    };
    children?: UIDSL[];
  }
  | {
    type: "image";
    props: {
      src: string;
      alt?: string;
      aspectRatio?: "video" | "square" | "portrait" | "wide";
      fit?: "cover" | "contain";
    };
  }
  | {
    type: "icon";
    props: {
      name: string; // Lucide icon name
      size?: "sm" | "md" | "lg" | "xl";
      color?: "default" | "primary" | "muted" | "destructive";
    };
  }
  | {
    type: "badge";
    props: {
      label: string;
      variant?: BadgeVariant;
    };
  }
  | {
    type: "avatar";
    props: {
      src?: string;
      initials?: string;
      size?: "sm" | "md" | "lg";
    };
  }
  | {
    type: "separator";
    props: {
      orientation?: "horizontal" | "vertical";
    };
  }
  | {
    type: "chart";
    props: {
      type: "line" | "bar" | "area" | "pie";
      title?: string;
      data: Record<string, any>[];
      xAxisKey: string;
      series: { key: string; color?: string; name?: string }[];
      height?: string;
    };
  }
  | {
    type: "table";
    props: {
      headers: string[];
      rows: Record<string, any>[];
      variant?: "default" | "dense" | "striped";
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
  let rawType = (node.type ?? node.component ?? "").toString().toLowerCase();

  // Map aliases
  const typeMap: Record<string, string> = {
    "box": "container",
    "div": "container",
    "section": "container",
    "heading": "text",
    "p": "text",
    "span": "text",
    "label": "text",
    "img": "image",
    "field": "input",
    "graph": "chart"
  };

  if (typeMap[rawType]) rawType = typeMap[rawType];

  const validTypes = [
    "container", "card", "text", "button", "input", "textarea",
    "image", "icon", "badge", "avatar", "separator", "chart", "table"
  ];

  const type = validTypes.includes(rawType) ? rawType : "container";

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
          justify: normalizeAlign(node.props?.justify ?? node.justify),
          style: normalizeStyle(node.props?.style ?? node.style),
        },
        children,
      };
    }

    case "card": {
      return {
        type: "card",
        props: {
          title: node.props?.title ?? node.title,
          description: node.props?.description ?? node.description,
          padding: normalizeSpacing(node.props?.padding ?? node.padding),
          variant: normalizeCardVariant(node.props?.variant ?? node.variant),
          style: normalizeStyle(node.props?.style ?? node.style),
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
          align: ["left", "center", "right"].includes(node.props?.align) ? node.props.align : undefined,
        },
      };
    }

    case "button": {
      return {
        type: "button",
        props: {
          label: node.props?.label ?? node.label ?? node.text ?? "Button",
          variant: normalizeButtonVariant(node.props?.variant ?? node.variant),
          icon: node.props?.icon,
          size: ["sm", "md", "lg", "icon"].includes(node.props?.size) ? node.props.size : "md",
        },
      };
    }

    case "input": {
      return {
        type: "input",
        props: {
          label: node.props?.label,
          placeholder: node.props?.placeholder ?? node.placeholder ?? "",
          type: node.props?.type ?? node.inputType ?? "text",
        },
      };
    }

    case "textarea": {
      return {
        type: "textarea",
        props: {
          label: node.props?.label,
          placeholder: node.props?.placeholder ?? "",
          rows: typeof node.props?.rows === 'number' ? node.props.rows : 4,
        },
      };
    }

    case "image": {
      return {
        type: "image",
        props: {
          src: node.props?.src ?? node.src ?? "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
          alt: node.props?.alt ?? node.alt ?? "",
          aspectRatio: ["video", "square", "portrait", "wide"].includes(node.props?.aspectRatio) ? node.props.aspectRatio : "video",
          fit: ["cover", "contain"].includes(node.props?.fit) ? node.props.fit : "cover",
        },
      };
    }

    case "icon": {
      return {
        type: "icon",
        props: {
          name: node.props?.name ?? "circle",
          size: ["sm", "md", "lg", "xl"].includes(node.props?.size) ? node.props.size : "md",
        },
      };
    }

    case "badge": {
      return {
        type: "badge",
        props: {
          label: node.props?.label ?? node.label ?? "Badge",
          variant: ["default", "secondary", "outline", "destructive", "success", "warning"].includes(node.props?.variant) ? node.props.variant : "default",
        },
      };
    }

    case "avatar": {
      return {
        type: "avatar",
        props: {
          src: node.props?.src,
          initials: node.props?.initials ?? "U",
          size: ["sm", "md", "lg"].includes(node.props?.size) ? node.props.size : "md",
        },
      };
    }

    case "separator": {
      return {
        type: "separator",
        props: {
          orientation: node.props?.orientation === "vertical" ? "vertical" : "horizontal",
        },
      };
    }

    case "chart": {
      return {
        type: "chart",
        props: {
          type: ["line", "bar", "area", "pie"].includes(node.props?.type) ? node.props.type : "line",
          title: node.props?.title,
          data: Array.isArray(node.props?.data) ? node.props.data : [],
          xAxisKey: node.props?.xAxisKey ?? "name",
          series: Array.isArray(node.props?.series) ? node.props.series : [{ key: "value", color: "#8884d8" }],
          height: node.props?.height ?? "300px",
        },
      };
    }

    case "table": {
      return {
        type: "table",
        props: {
          headers: Array.isArray(node.props?.headers) ? node.props.headers : [],
          rows: Array.isArray(node.props?.rows) ? node.props.rows : [],
          variant: ["default", "dense", "striped"].includes(node.props?.variant) ? node.props.variant : "default",
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
  const allowed: SpacingKey[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
  return allowed.includes(val) ? val : "md";
}

function normalizeDirection(val: any): DirectionKey | undefined {
  if (!val) return undefined;
  const allowed: DirectionKey[] = ["vertical", "horizontal", "grid"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeCols(val: any): 1 | 2 | 3 | 4 | 6 | 12 | undefined {
  if (!val) return undefined;
  const num = parseInt(val);
  return [1, 2, 3, 4, 6, 12].includes(num) ? (num as any) : undefined;
}

function normalizeMaxWidth(val: any): MaxWidthKey | undefined {
  if (!val) return undefined;
  const allowed: MaxWidthKey[] = ["sm", "md", "lg", "xl", "2xl", "full"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeAlign(val: any): AlignKey | undefined {
  if (!val) return undefined;
  const allowed: AlignKey[] = ["start", "center", "end", "between"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeTextVariant(val: any): TextVariant | undefined {
  if (!val) return undefined;
  const allowed: TextVariant[] = ["h1", "h2", "h3", "h4", "body", "small", "muted", "label", "success", "destructive"];
  return allowed.includes(val) ? val : undefined;
}

function normalizeButtonVariant(val: any): ButtonVariant | undefined {
  if (!val) return undefined;
  const allowed: ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "destructive"];
  return allowed.includes(val) ? val : "primary";
}

function normalizeCardVariant(val: any): CardVariant | undefined {
  if (!val) return undefined;
  const allowed: CardVariant[] = ["default", "elevated", "glass", "flat", "bordered"];
  return allowed.includes(val) ? val : "default";
}

function normalizeStyle(val: any): StyleProps | undefined {
  if (!val || typeof val !== 'object') return undefined;
  return {
    background: ["default", "muted", "primary", "secondary", "glass", "gradient-subtle", "gradient-vibrant"].includes(val.background) ? val.background : undefined,
    shadow: ["none", "sm", "md", "lg", "xl"].includes(val.shadow) ? val.shadow : undefined,
    border: typeof val.border === 'boolean' ? val.border : undefined,
    radius: ["none", "sm", "md", "lg", "full"].includes(val.radius) ? val.radius : undefined,
  };
}

/* ==================== RESPONSE PROCESSING ==================== */

export function normalizeResponse(data: any): VariantsResponse {
  try {
    const variants = Array.isArray(data?.variants)
      ? data.variants.map((v: any) => {
        if (v?.root) return normalizeNode(v.root);
        return normalizeNode(v);
      })
      : [];

    return {
      version: data?.version ?? "2",
      variants: variants.filter((v: any) => v !== null),
    };
  } catch (error) {
    console.error("Normalization error:", error);
    return { version: "2", variants: [] };
  }
}