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
  '3xl': 'p-16',
} as const;

export const containerMaxWidths = {
  sm: 'max-w-sm', // 384px
  md: 'max-w-2xl', // 672px
  lg: 'max-w-5xl', // 1024px
  xl: 'max-w-7xl', // 1280px
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
} as const;

export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
} as const;

export const backgrounds = {
  default: 'bg-background',
  muted: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  glass: 'bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20',
  'gradient-subtle': 'gradient-generate',
  'gradient-vibrant': 'lovable-gradient',
} as const;

export const typography = {
  h1: { size: 'text-4xl md:text-5xl lg:text-6xl', weight: 'font-bold', tracking: 'tracking-tight', leading: 'leading-tight' },
  h2: { size: 'text-3xl md:text-4xl', weight: 'font-semibold', tracking: 'tracking-tight', leading: 'leading-snug' },
  h3: { size: 'text-2xl md:text-3xl', weight: 'font-semibold', leading: 'leading-snug' },
  h4: { size: 'text-xl md:text-2xl', weight: 'font-medium', leading: 'leading-snug' },
  body: { size: 'text-base', weight: 'font-normal', leading: 'leading-relaxed' },
  small: { size: 'text-sm', weight: 'font-medium', leading: 'leading-normal' },
  muted: { size: 'text-sm', weight: 'font-normal', color: 'text-muted-foreground', leading: 'leading-relaxed' },
  label: { size: 'text-xs uppercase', weight: 'font-bold', tracking: 'tracking-wider', color: 'text-muted-foreground', leading: 'leading-none' }
} as const;

export const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-12',
} as const;

/**
 * Card variants with consistent styling
 */
export const cardVariants = {
  default: 'bg-card text-card-foreground border border-border rounded-xl shadow-sm',
  elevated: 'bg-card text-card-foreground border-none rounded-xl shadow-lg',
  glass: 'bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm',
  flat: 'bg-muted/50 border-none rounded-lg',
  bordered: 'bg-transparent border-2 border-dashed border-muted-foreground/20 rounded-xl',
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