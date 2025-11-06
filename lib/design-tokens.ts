// lib/design-tokens.ts

/**
 * Unified design system for AI UI Generator
 * Spacing scale: 8/12/16/24/32/48/64
 */

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const spacingClasses = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16',
} as const;

export const paddingClasses = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
} as const;

export const containerMaxWidths = {
  sm: 'max-w-sm', // 384px
  md: 'max-w-2xl', // 672px
  lg: 'max-w-5xl', // 1024px
  xl: 'max-w-7xl', // 1280px
  full: 'max-w-full',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
  md: '0 4px 16px rgba(16, 24, 40, 0.06)',
  lg: '0 8px 24px rgba(16, 24, 40, 0.08)',
  xl: '0 12px 32px rgba(16, 24, 40, 0.10)',
  card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
} as const;

export const typography = {
  h1: {
    size: 'text-4xl md:text-5xl',
    weight: 'font-bold',
    tracking: 'tracking-tight',
    leading: 'leading-tight',
  },
  h2: {
    size: 'text-2xl md:text-3xl',
    weight: 'font-semibold',
    tracking: 'tracking-tight',
    leading: 'leading-snug',
  },
  h3: {
    size: 'text-xl md:text-2xl',
    weight: 'font-semibold',
    leading: 'leading-snug',
  },
  body: {
    size: 'text-base',
    weight: 'font-normal',
    leading: 'leading-relaxed',
  },
  small: {
    size: 'text-sm',
    weight: 'font-normal',
    leading: 'leading-normal',
  },
  muted: {
    size: 'text-sm',
    weight: 'font-normal',
    color: 'text-muted-foreground',
    leading: 'leading-relaxed',
  },
} as const;

export const gridCols = {
  1: 'grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Card variants with consistent styling
 */
export const cardVariants = {
  default: 'bg-white/95 border border-black/[0.08] rounded-xl shadow-card',
  elevated: 'bg-white/95 border border-black/[0.08] rounded-xl shadow-lg',
  glass: 'bg-white/60 backdrop-blur-md border border-white/40 rounded-xl shadow-md',
  flat: 'bg-white border border-black/[0.06] rounded-lg',
} as const;

/**
 * Animation presets
 */
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15 },
  },
  slideUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
    transition: { duration: 0.25 },
  },
} as const;

/**
 * Utility function to combine design token classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get spacing class by key
 */
export function getSpacing(key: keyof typeof spacingClasses): string {
  return spacingClasses[key] || spacingClasses.md;
}

/**
 * Get padding class by key
 */
export function getPadding(key: keyof typeof paddingClasses): string {
  return paddingClasses[key] || paddingClasses.md;
}