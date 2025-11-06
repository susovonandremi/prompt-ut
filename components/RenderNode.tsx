// components/RenderNode.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UIDSL } from '.././lib/ui-schema';
import { 
  spacingClasses, 
  paddingClasses, 
  containerMaxWidths, 
  gridCols, 
  typography,
  cardVariants,
  cn 
} from '.././lib/design-tokens';

interface RenderNodeProps {
  node: UIDSL;
  depth?: number;
}

/**
 * Renders a UIDSL node tree with proper styling and animations
 */
export function RenderNode({ node, depth = 0 }: RenderNodeProps) {
  // Prevent infinite nesting
  if (depth > 6) {
    return <div className="text-xs text-red-500">Max depth exceeded</div>;
  }

  switch (node.type) {
    case 'container': {
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
      
      const alignClass = node.props?.align === 'center'
        ? 'items-center justify-center'
        : node.props?.align === 'end'
        ? 'items-end justify-end'
        : '';

      return (
        <div
          className={cn(
            'w-full',
            directionClass,
            gapClass,
            paddingClass,
            maxWidthClass,
            alignClass
          )}
        >
          {node.children?.map((child, idx) => (
            <RenderNode key={idx} node={child} depth={depth + 1} />
          ))}
        </div>
      );
    }

    case 'card': {
      const paddingClass = node.props?.padding 
        ? paddingClasses[node.props.padding] 
        : 'p-6';
      
      const variantClass = node.props?.variant
        ? cardVariants[node.props.variant]
        : cardVariants.default;

      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <Card className={cn(variantClass, 'overflow-hidden smooth-shadow')}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {node.props.title}
              </CardTitle>
            </CardHeader>
            {node.children && node.children.length > 0 && (
              <CardContent className={paddingClass}>
                <div className="space-y-3">
                  {node.children.map((child, idx) => (
                    <RenderNode key={idx} node={child} depth={depth + 1} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      );
    }

    case 'text': {
      const variant = node.props.variant || 'body';
      const typo = typography[variant];
      
        const className = cn(
            typo.size,
            typo.weight,
            typo.leading,
            (typo as any).tracking ?? '',
            variant === 'muted' ? 'text-muted-foreground' : 'token-text'
        );
        
      return (
        <p className={className}>
          {node.props.value}
        </p>
      );
    }

    case 'button': {
      const variantMap = {
        primary: 'default',
        secondary: 'secondary',
        outline: 'outline',
        ghost: 'ghost',
      };

      const variant = variantMap[node.props.variant || 'primary'] as any;

      return (
        <Button 
          variant={variant}
          className="smooth-transition"
        >
          {node.props.label}
        </Button>
      );
    }

    case 'input': {
      return (
        <Input
          type={node.props.type || 'text'}
          placeholder={node.props.placeholder || ''}
          className="smooth-transition"
        />
      );
    }

    case 'image': {
      const FALLBACK_IMG = "https://placehold.co/800x500/png?text=Preview";
        
      const normalizeImgSrc = (src?: string) => {
        if (!src) return FALLBACK_IMG;
        if (!/^https?:\/\//i.test(src)) return FALLBACK_IMG;
        return src;
      };


        
        const src = normalizeImgSrc(node.props?.src);
        const alt = node.props?.alt || "";

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full overflow-hidden rounded-xl"
    >
      <img
        src={src}
        alt={alt}
        className="w-full object-cover rounded-xl smooth-transition"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.src = FALLBACK_IMG;
        }}
      />
    </motion.div>
  );
}

    default:
      return null;
  }
}