'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import * as Icons from 'lucide-react';
import type { UIDSL, StyleProps } from '../lib/ui-schema';

// Dynamic import for chart component to avoid SSR issues with recharts
const ChartWrapper = dynamic(
  () => import('./ChartWrapper').then(mod => mod.ChartWrapper),
  {
    ssr: false,
    loading: () => <div className="w-full h-[300px] bg-muted/50 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div>
  }
);
import {
  spacingClasses,
  paddingClasses,
  containerMaxWidths,
  gridCols,
  typography,
  cardVariants,
  backgrounds,
  shadows,
  borderRadius,
  cn
} from '../lib/design-tokens';

interface RenderNodeProps {
  node: UIDSL;
  depth?: number;
}

const FALLBACK_IMG = "https://placehold.co/800x500/png?text=Preview";

/**
 * Renders a UIDSL node tree with proper styling and animations
 */
export function RenderNode({ node, depth = 0 }: RenderNodeProps) {
  // Prevent infinite nesting
  if (depth > 8) {
    return <div className="text-xs text-red-500">Max depth exceeded</div>;
  }

  switch (node.type) {
    case 'container':
      return <RenderContainer node={node} depth={depth} />;
    case 'card':
      return <RenderCard node={node} depth={depth} />;
    case 'text':
      return <RenderText node={node} />;
    case 'button':
      return <RenderButton node={node} />;
    case 'input':
      return <RenderInput node={node} />;
    case 'textarea':
      return <RenderTextarea node={node} />;
    case 'image':
      return <RenderImage node={node} />;
    case 'icon':
      return <RenderIcon node={node} />;
    case 'badge':
      return <RenderBadge node={node} />;
    case 'avatar':
      return <RenderAvatar node={node} />;
    case 'separator':
      return <RenderSeparator node={node} />;
    case 'chart':
      return <RenderChart node={node} />;
    case 'table':
      return <RenderTable node={node} />;
    default:
      return null;
  }
}

// Helper to extract style classes
function getStyleClasses(style?: StyleProps) {
  if (!style) return '';
  return cn(
    style.background ? backgrounds[style.background] : '',
    style.shadow ? shadows[style.shadow] : '',
    style.radius ? borderRadius[style.radius] : '',
    style.border ? 'border border-border' : '',
    style.className
  );
}

function RenderContainer({ node, depth = 0 }: RenderNodeProps) {
  if (node.type !== 'container') return null;

  const gapClass = spacingClasses[node.props?.gap || 'md'];
  const paddingClass = node.props?.padding
    ? paddingClasses[node.props.padding]
    : '';

  const maxWidthClass = node.props?.maxWidth
    ? containerMaxWidths[node.props.maxWidth]
    : '';

  const directionClass = node.props?.direction === 'horizontal'
    ? 'flex flex-row'
    : node.props?.direction === 'grid'
      ? `grid ${node.props.cols ? gridCols[node.props.cols] : 'md:grid-cols-2'}`
      : 'flex flex-col';

  const alignClass = cn(
    node.props?.align === 'center' ? 'items-center' :
      node.props?.align === 'end' ? 'items-end' :
        node.props?.align === 'start' ? 'items-start' : '',
  );

  const styleClass = getStyleClasses(node.props?.style);

  // Default background for root container if missing
  const rootClass = (depth === 0 && !node.props?.style?.background) ? 'bg-background' : '';

  return (
    <div className={cn(
      'w-full',
      directionClass,
      gapClass,
      paddingClass,
      maxWidthClass,
      alignClass,
      styleClass,
      rootClass,
      node.props?.className
    )}>
      {node.children?.map((child, idx) => (
        <RenderNode key={idx} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function RenderCard({ node, depth = 0 }: RenderNodeProps) {
  if (node.type !== 'card') return null;

  const paddingClass = node.props?.padding
    ? paddingClasses[node.props.padding]
    : 'p-6';

  const variantClass = node.props?.variant
    ? cardVariants[node.props.variant]
    : cardVariants.default;

  const styleClass = getStyleClasses(node.props?.style);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      <Card className={cn(variantClass, styleClass, 'overflow-hidden h-full flex flex-col')}>
        {(node.props.title || node.props.description) && (
          <CardHeader>
            {node.props.title && <CardTitle className="text-lg font-semibold">{node.props.title}</CardTitle>}
            {node.props.description && <CardDescription>{node.props.description}</CardDescription>}
          </CardHeader>
        )}

        {node.children && node.children.length > 0 && (
          <CardContent className={cn(paddingClass, "flex-1")}>
            <div className="space-y-3">
              {node.children.map((child, idx) => (
                <RenderNode key={idx} node={child} depth={depth + 1} />
              ))}
            </div>
          </CardContent>
        )}

        {node.props.footer && node.props.footer.length > 0 && (
          <CardFooter className="flex gap-2 pt-0">
            {node.props.footer.map((child, idx) => (
              <RenderNode key={idx} node={child} depth={depth + 1} />
            ))}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}

function RenderText({ node }: { node: UIDSL }) {
  if (node.type !== 'text') return null;

  const variant = node.props.variant || 'body';
  const typo = typography[variant as keyof typeof typography] || typography.body;

  const alignClass = node.props.align === 'center' ? 'text-center' :
    node.props.align === 'right' ? 'text-right' : 'text-left';

  // Specific color overrides for success/destructive variants
  const colorClass = variant === 'success' ? 'text-emerald-500' :
    variant === 'destructive' ? 'text-red-500' :
      (typo as any).color ?? 'text-foreground';

  const className = cn(
    typo.size,
    typo.weight,
    typo.leading,
    (typo as any).tracking ?? '',
    colorClass,
    alignClass
  );

  return (
    <p className={className}>
      {node.props.value}
    </p>
  );
}

function RenderButton({ node }: { node: UIDSL }) {
  if (node.type !== 'button') return null;

  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    destructive: 'destructive'
  };

  const variant = variantMap[node.props.variant || 'primary'] as any;
  const size = node.props.size === 'md' ? 'default' : (node.props.size || 'default');

  // Dynamic Icon rendering
  const IconComponent = node.props.icon && (Icons as any)[node.props.icon];

  return (
    <Button
      variant={variant}
      size={size}
      className="smooth-transition gap-2"
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {node.props.label}
    </Button>
  );
}

function RenderInput({ node }: { node: UIDSL }) {
  if (node.type !== 'input') return null;

  return (
    <div className="w-full space-y-2">
      {node.props.label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {node.props.label}
        </label>
      )}
      <Input
        type={node.props.type || 'text'}
        placeholder={node.props.placeholder || ''}
        className="smooth-transition"
      />
    </div>
  );
}

function RenderTextarea({ node }: { node: UIDSL }) {
  if (node.type !== 'textarea') return null;

  return (
    <div className="w-full space-y-2">
      {node.props.label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {node.props.label}
        </label>
      )}
      <Textarea
        placeholder={node.props.placeholder || ''}
        rows={node.props.rows || 4}
        className="smooth-transition resize-none"
      />
    </div>
  );
}

function RenderImage({ node }: { node: UIDSL }) {
  if (node.type !== 'image') return null;

  const normalizeImgSrc = (src?: string) => {
    if (!src) return FALLBACK_IMG;
    if (!/^https?:\/\//i.test(src)) return FALLBACK_IMG;
    return src;
  };

  const src = normalizeImgSrc(node.props?.src);
  const alt = node.props?.alt || "";

  const aspectRatio = node.props.aspectRatio === 'square' ? 'aspect-square' :
    node.props.aspectRatio === 'portrait' ? 'aspect-[3/4]' :
      node.props.aspectRatio === 'wide' ? 'aspect-[21/9]' : 'aspect-video';

  const fit = node.props.fit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full overflow-hidden rounded-xl bg-muted", aspectRatio)}
    >
      <img
        src={src}
        alt={alt}
        className={cn("w-full h-full smooth-transition", fit)}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.src = FALLBACK_IMG;
        }}
      />
    </motion.div>
  );
}

function RenderIcon({ node }: { node: UIDSL }) {
  if (node.type !== 'icon') return null;

  const IconComponent = (Icons as any)[node.props.name] || Icons.Circle;

  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  const sizeClass = sizeMap[node.props.size || 'md'];

  const colorMap = {
    default: 'text-foreground',
    primary: 'text-primary',
    muted: 'text-muted-foreground',
    destructive: 'text-destructive'
  };
  const colorClass = colorMap[node.props.color || 'default'];

  return <IconComponent className={cn(sizeClass, colorClass)} />;
}

function RenderBadge({ node }: { node: UIDSL }) {
  if (node.type !== 'badge') return null;

  const variant = node.props.variant || 'default';

  // Map custom variants to Shadcn variants or apply custom classes
  let className = "";
  let shadcnVariant: "default" | "secondary" | "outline" | "destructive" = "default";

  if (variant === 'success') {
    className = "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20";
    shadcnVariant = "outline";
  } else if (variant === 'warning') {
    className = "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20";
    shadcnVariant = "outline";
  } else {
    shadcnVariant = variant as any;
  }

  return <Badge variant={shadcnVariant} className={className}>{node.props.label}</Badge>;
}

function RenderAvatar({ node }: { node: UIDSL }) {
  if (node.type !== 'avatar') return null;

  const sizeMap = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const sizeClass = sizeMap[node.props.size || 'md'];

  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={node.props.src} />
      <AvatarFallback>{node.props.initials || 'U'}</AvatarFallback>
    </Avatar>
  );
}

function RenderSeparator({ node }: { node: UIDSL }) {
  if (node.type !== 'separator') return null;
  return <Separator orientation={node.props.orientation || 'horizontal'} className="my-4" />;
}

function RenderChart({ node }: { node: UIDSL }) {
  if (node.type !== 'chart') return null;

  const { type, data, xAxisKey, series, height, title } = node.props;

  return (
    <ChartWrapper
      type={type}
      data={data}
      xAxisKey={xAxisKey}
      series={series}
      height={height}
      title={title}
    />
  );
}

function RenderTable({ node }: { node: UIDSL }) {
  if (node.type !== 'table') return null;

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
          <tr>
            {node.props.headers.map((h: string, i: number) => (
              <th key={i} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {node.props.rows.map((row: any, i: number) => (
            <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
              {node.props.headers.map((h: string, j: number) => (
                <td key={j} className="px-4 py-3">
                  {/* Basic auto-formatting for cell data */}
                  {String(row[h] || row[h.toLowerCase()] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}