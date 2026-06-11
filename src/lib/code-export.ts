import { UIDSL } from './ui-schema';

/**
 * Converts dashed icon names to PascalCase for Lucide imports.
 */
function toPascalCase(str: string): string {
  if (!str) return 'Star';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Maps UIDSL design token keys to Tailwind utility classes.
 */
const spacingTailwind = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16',
};

const paddingTailwind = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  '2xl': 'p-12',
  '3xl': 'p-16',
};

const maxWidthTailwind = {
  sm: 'max-w-sm',
  md: 'max-w-2xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
};

const bgTailwind = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  glass: 'bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20',
  'gradient-subtle': 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900',
  'gradient-vibrant': 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white',
};

const radiusTailwind = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const shadowTailwind = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
};

const textVariantTailwind = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-none text-foreground',
  h2: 'text-3xl md:text-4xl font-semibold tracking-tight leading-snug text-foreground',
  h3: 'text-2xl md:text-3xl font-semibold leading-snug text-foreground',
  h4: 'text-xl md:text-2xl font-medium leading-snug text-foreground',
  body: 'text-base font-normal leading-relaxed text-foreground',
  small: 'text-sm font-medium leading-normal',
  muted: 'text-sm font-normal text-muted-foreground leading-relaxed',
  label: 'text-xs uppercase font-bold tracking-wider text-muted-foreground leading-none',
  success: 'text-sm font-normal text-green-500',
  destructive: 'text-sm font-normal text-red-500',
};

const buttonVariantTailwind = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
};

const buttonSizeTailwind = {
  sm: 'h-8 rounded-md px-3 text-xs',
  md: 'h-9 px-4 py-2 text-sm',
  lg: 'h-10 rounded-md px-8 text-base',
  icon: 'h-9 w-9 rounded-md',
};

const cardVariantTailwind = {
  default: 'bg-card text-card-foreground border border-border rounded-xl shadow-sm',
  elevated: 'bg-card text-card-foreground border-none rounded-xl shadow-lg',
  glass: 'bg-white/10 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl shadow-sm',
  flat: 'bg-muted/50 border-none rounded-lg',
  bordered: 'bg-transparent border-2 border-dashed border-muted-foreground/20 rounded-xl',
};

/**
 * Extracts class name adjustments based on component style props.
 */
function buildStyleClasses(style?: any): string {
  if (!style) return '';
  const classes: string[] = [];
  
  if (style.background && bgTailwind[style.background as keyof typeof bgTailwind]) {
    classes.push(bgTailwind[style.background as keyof typeof bgTailwind]);
  }
  if (style.radius && radiusTailwind[style.radius as keyof typeof radiusTailwind]) {
    classes.push(radiusTailwind[style.radius as keyof typeof radiusTailwind]);
  }
  if (style.border) {
    classes.push('border border-border');
  }
  if (style.shadow && shadowTailwind[style.shadow as keyof typeof shadowTailwind]) {
    classes.push(shadowTailwind[style.shadow as keyof typeof shadowTailwind]);
  }
  if (style.className) {
    classes.push(style.className);
  }

  return classes.join(' ');
}

/**
 * Generates a complete React component with Tailwind styling.
 */
export function dslToReact(node: UIDSL): string {
  const icons = new Set<string>();

  function renderReactNode(n: UIDSL, depth: number = 2): string {
    const indent = ' '.repeat(depth * 2);
    if (!n) return '';

    switch (n.type) {
      case 'container': {
        const props = n.props || {};
        const direction = props.direction || 'vertical';
        const gapClass = props.gap ? spacingTailwind[props.gap as keyof typeof spacingTailwind] : 'gap-4';
        const padClass = props.padding ? paddingTailwind[props.padding as keyof typeof paddingTailwind] : '';
        
        let layoutClass = 'flex flex-col';
        if (direction === 'horizontal') {
          layoutClass = 'flex flex-row';
          const align = props.align || 'start';
          const justify = props.justify || 'start';
          
          if (align === 'center') layoutClass += ' items-center';
          else if (align === 'end') layoutClass += ' items-end';
          else layoutClass += ' items-start';

          if (justify === 'center') layoutClass += ' justify-center';
          else if (justify === 'end') layoutClass += ' justify-end';
          else if (justify === 'between') layoutClass += ' justify-between';
        } else if (direction === 'grid') {
          const cols = props.cols || 1;
          const colClasses = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
            6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
            12: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-12',
          };
          layoutClass = `grid ${colClasses[cols as keyof typeof colClasses] || 'grid-cols-1'}`;
        }

        const maxW = props.maxWidth && props.maxWidth !== 'full' 
          ? `${maxWidthTailwind[props.maxWidth as keyof typeof maxWidthTailwind]} w-full mx-auto` 
          : '';

        const styleClasses = buildStyleClasses(props.style);
        const combinedClass = [layoutClass, gapClass, padClass, maxW, styleClasses].filter(Boolean).join(' ');

        const children = (n.children || [])
          .map(child => renderReactNode(child, depth + 1))
          .join('\n');

        return `${indent}<div className="${combinedClass}">\n${children}\n${indent}</div>`;
      }

      case 'card': {
        const props = n.props || {};
        const padClass = props.padding ? paddingTailwind[props.padding as keyof typeof paddingTailwind] : 'p-6';
        const cardVar = cardVariantTailwind[props.variant as keyof typeof cardVariantTailwind] || cardVariantTailwind.default;
        const styleClasses = buildStyleClasses(props.style);

        const combinedClass = ['flex flex-col gap-4', cardVar, padClass, styleClasses].filter(Boolean).join(' ');

        let headerStr = '';
        if (props.title || props.description) {
          headerStr = `${indent}  <div className="flex flex-col gap-1.5">\n` +
            (props.title ? `${indent}    <h3 className="text-xl font-semibold leading-none tracking-tight">${props.title}</h3>\n` : '') +
            (props.description ? `${indent}    <p className="text-sm text-muted-foreground">${props.description}</p>\n` : '') +
            `${indent}  </div>\n`;
        }

        const children = (n.children || [])
          .map(child => renderReactNode(child, depth + 1))
          .join('\n');

        let footerStr = '';
        if (props.footer && props.footer.length > 0) {
          const footerChildren = props.footer.map(f => renderReactNode(f, depth + 2)).join('\n');
          footerStr = `\n${indent}  <div className="mt-auto pt-4 border-t flex gap-3 justify-end">\n${footerChildren}\n${indent}  </div>`;
        }

        return `${indent}<div className="${combinedClass}">\n${headerStr}${children}${footerStr}\n${indent}</div>`;
      }

      case 'text': {
        const props = n.props || { value: '' };
        const variantClass = textVariantTailwind[props.variant as keyof typeof textVariantTailwind] || textVariantTailwind.body;
        const alignClass = props.align === 'center' ? 'text-center' : props.align === 'right' ? 'text-right' : '';
        const combined = [variantClass, alignClass].filter(Boolean).join(' ');
        
        let tag = 'p';
        if (props.variant === 'h1') tag = 'h1';
        else if (props.variant === 'h2') tag = 'h2';
        else if (props.variant === 'h3') tag = 'h3';
        else if (props.variant === 'h4') tag = 'h4';
        else if (props.variant === 'label') tag = 'label';
        else if (props.variant === 'small') tag = 'span';

        return `${indent}<${tag} className="${combined}">${props.value}</${tag}>`;
      }

      case 'button': {
        const props = n.props || { label: '' };
        const btnVar = buttonVariantTailwind[props.variant as keyof typeof buttonVariantTailwind] || buttonVariantTailwind.primary;
        const btnSize = buttonSizeTailwind[props.size as keyof typeof buttonSizeTailwind] || buttonSizeTailwind.md;
        const combined = ['inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50', btnVar, btnSize].join(' ');

        let iconElement = '';
        if (props.icon) {
          const pascalIcon = toPascalCase(props.icon);
          icons.add(pascalIcon);
          iconElement = `<${pascalIcon} className="mr-2 h-4 w-4" />`;
        }

        return `${indent}<button className="${combined}">${iconElement}${props.label}</button>`;
      }

      case 'input': {
        const props = n.props || {};
        const placeholder = props.placeholder || '';
        const type = props.type || 'text';

        return `${indent}<div className="grid w-full items-center gap-1.5">\n` +
          (props.label ? `${indent}  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">${props.label}</label>\n` : '') +
          `${indent}  <input type="${type}" placeholder="${placeholder}" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />\n` +
          `${indent}</div>`;
      }

      case 'textarea': {
        const props = n.props || {};
        const placeholder = props.placeholder || '';
        const rows = props.rows || 3;

        return `${indent}<div className="grid w-full gap-1.5">\n` +
          (props.label ? `${indent}  <label className="text-sm font-medium leading-none">${props.label}</label>\n` : '') +
          `${indent}  <textarea placeholder="${placeholder}" rows={${rows}} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />\n` +
          `${indent}</div>`;
      }

      case 'image': {
        const props = n.props || { src: '' };
        const src = props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
        const alt = props.alt || 'Design Image';
        
        let ratioClass = 'aspect-video';
        if (props.aspectRatio === 'square') ratioClass = 'aspect-square';
        else if (props.aspectRatio === 'portrait') ratioClass = 'aspect-[3/4]';
        else if (props.aspectRatio === 'wide') ratioClass = 'aspect-[21/9]';
        
        const fitClass = props.fit === 'contain' ? 'object-contain' : 'object-cover';
        const combined = `rounded-lg ${ratioClass} ${fitClass} w-full`;

        return `${indent}<img src="${src}" alt="${alt}" className="${combined}" />`;
      }

      case 'icon': {
        const props = n.props || { name: 'star' };
        const pascalIcon = toPascalCase(props.name);
        icons.add(pascalIcon);
        
        const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
        const sizeClass = sizeMap[props.size as keyof typeof sizeMap] || 'h-6 w-6';

        const colorMap = {
          default: 'text-foreground',
          primary: 'text-primary',
          muted: 'text-muted-foreground',
          destructive: 'text-destructive',
        };
        const colorClass = colorMap[props.color as keyof typeof colorMap] || 'text-foreground';

        return `${indent}<${pascalIcon} className="${sizeClass} ${colorClass}" />`;
      }

      case 'badge': {
        const props = n.props || { label: '' };
        const badgeVar = {
          default: 'bg-primary text-primary-foreground hover:bg-primary/80',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          outline: 'text-foreground border border-input',
          destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
          success: 'bg-green-500/10 text-green-500 border border-green-500/20',
          warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
        };
        const badgeClass = badgeVar[props.variant as keyof typeof badgeVar] || badgeVar.default;
        
        return `${indent}<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeClass}">${props.label}</span>`;
      }

      case 'avatar': {
        const props = n.props || {};
        const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
        const sizeClass = sizeMap[props.size as keyof typeof sizeMap] || 'h-10 w-10 text-sm';
        
        return `${indent}<div className="relative flex shrink-0 overflow-hidden rounded-full border border-border ${sizeClass} bg-muted items-center justify-center font-semibold">\n` +
          (props.src 
            ? `${indent}  <img src="${props.src}" alt="${props.initials || 'Avatar'}" className="aspect-square h-full w-full object-cover" />\n` 
            : `${indent}  <span>${props.initials || 'AI'}</span>\n`) +
          `${indent}</div>`;
      }

      case 'separator': {
        const props = n.props || {};
        const isHorizontal = props.orientation !== 'vertical';
        const sepClass = isHorizontal ? 'h-[1px] w-full bg-border my-4' : 'w-[1px] h-full bg-border mx-4';
        return `${indent}<div className="${sepClass}" />`;
      }

      case 'chart': {
        const props = n.props || { data: [], series: [], xAxisKey: '' };
        return `${indent}<div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-6" style={{ height: '${props.height || '240px'}' }}>\n` +
          `${indent}  <span className="text-sm font-medium text-foreground">${props.title || 'Chart Title'}</span>\n` +
          `${indent}  <span className="text-xs text-muted-foreground">[Recharts Visualisation - ${props.type || 'Line'} chart]</span>\n` +
          `${indent}</div>`;
      }

      case 'table': {
        const props = n.props || { headers: [], rows: [] };
        const headers = props.headers || [];
        const rows = props.rows || [];
        const isDense = props.variant === 'dense';
        const isStriped = props.variant === 'striped';
        
        const pad = isDense ? 'p-2 text-xs' : 'p-4 text-sm';

        const tableHeaders = headers.map(h => `${indent}          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">${h}</th>`).join('\n');
        
        const tableRows = rows.map((row, idx) => {
          const rowBg = (isStriped && idx % 2 === 1) ? 'bg-muted/30' : '';
          const cells = headers.map(h => {
            const val = row[h] !== undefined ? row[h] : row[h.toLowerCase()] !== undefined ? row[h.toLowerCase()] : '';
            return `${indent}            <td className="${pad} align-middle">${val}</td>`;
          }).join('\n');
          
          return `${indent}          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${rowBg}">\n${cells}\n${indent}          </tr>`;
        }).join('\n');

        return `${indent}<div className="w-full overflow-auto rounded-lg border border-border">\n` +
          `${indent}  <table className="w-full caption-bottom text-sm">\n` +
          `${indent}    <thead className="[&_tr]:border-b bg-muted/10">\n` +
          `${indent}      <tr>\n${tableHeaders}\n${indent}      </tr>\n    </thead>\n` +
          `${indent}    <tbody className="[&_tr:last-child]:border-0">\n${tableRows}\n${indent}    </tbody>\n` +
          `${indent}  </table>\n` +
          `${indent}</div>`;
      }

      default:
        return '';
    }
  }

  const generatedJsx = renderReactNode(node, 2);
  
  const importStatement = icons.size > 0 
    ? `import { ${Array.from(icons).join(', ')} } from 'lucide-react';` 
    : '';

  return `import React from 'react';
${importStatement}

export default function GeneratedDesign() {
  return (
    <div className="w-full min-h-screen bg-background p-6 md:p-10 flex items-center justify-center">
${generatedJsx}
    </div>
  );
}
`;
}

/**
 * Generates an HTML string layout fully decorated with Tailwind classes.
 */
export function dslToTailwindHtml(node: UIDSL): string {
  function renderHtmlNode(n: UIDSL, depth: number = 2): string {
    const indent = ' '.repeat(depth * 2);
    if (!n) return '';

    switch (n.type) {
      case 'container': {
        const props = n.props || {};
        const direction = props.direction || 'vertical';
        const gapClass = props.gap ? spacingTailwind[props.gap as keyof typeof spacingTailwind] : 'gap-4';
        const padClass = props.padding ? paddingTailwind[props.padding as keyof typeof paddingTailwind] : '';
        
        let layoutClass = 'flex flex-col';
        if (direction === 'horizontal') {
          layoutClass = 'flex flex-row';
          const align = props.align || 'start';
          const justify = props.justify || 'start';
          
          if (align === 'center') layoutClass += ' items-center';
          else if (align === 'end') layoutClass += ' items-end';
          else layoutClass += ' items-start';

          if (justify === 'center') layoutClass += ' justify-center';
          else if (justify === 'end') layoutClass += ' justify-end';
          else if (justify === 'between') layoutClass += ' justify-between';
        } else if (direction === 'grid') {
          const cols = props.cols || 1;
          const colClasses = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
            6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
            12: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-12',
          };
          layoutClass = `grid ${colClasses[cols as keyof typeof colClasses] || 'grid-cols-1'}`;
        }

        const maxW = props.maxWidth && props.maxWidth !== 'full' 
          ? `${maxWidthTailwind[props.maxWidth as keyof typeof maxWidthTailwind]} w-full mx-auto` 
          : '';

        const styleClasses = buildStyleClasses(props.style);
        const combinedClass = [layoutClass, gapClass, padClass, maxW, styleClasses].filter(Boolean).join(' ');

        const children = (n.children || [])
          .map(child => renderHtmlNode(child, depth + 1))
          .join('\n');

        return `${indent}<div class="${combinedClass}">\n${children}\n${indent}</div>`;
      }

      case 'card': {
        const props = n.props || {};
        const padClass = props.padding ? paddingTailwind[props.padding as keyof typeof paddingTailwind] : 'p-6';
        const cardVar = cardVariantTailwind[props.variant as keyof typeof cardVariantTailwind] || cardVariantTailwind.default;
        const styleClasses = buildStyleClasses(props.style);

        const combinedClass = ['flex flex-col gap-4', cardVar, padClass, styleClasses].filter(Boolean).join(' ');

        let headerStr = '';
        if (props.title || props.description) {
          headerStr = `${indent}  <div class="flex flex-col gap-1.5">\n` +
            (props.title ? `${indent}    <h3 class="text-xl font-semibold leading-none tracking-tight">${props.title}</h3>\n` : '') +
            (props.description ? `${indent}    <p class="text-sm text-muted-foreground">${props.description}</p>\n` : '') +
            `${indent}  </div>\n`;
        }

        const children = (n.children || [])
          .map(child => renderHtmlNode(child, depth + 1))
          .join('\n');

        let footerStr = '';
        if (props.footer && props.footer.length > 0) {
          const footerChildren = props.footer.map(f => renderHtmlNode(f, depth + 2)).join('\n');
          footerStr = `\n${indent}  <div class="mt-auto pt-4 border-t flex gap-3 justify-end">\n${footerChildren}\n${indent}  </div>`;
        }

        return `${indent}<div class="${combinedClass}">\n${headerStr}${children}${footerStr}\n${indent}</div>`;
      }

      case 'text': {
        const props = n.props || { value: '' };
        const variantClass = textVariantTailwind[props.variant as keyof typeof textVariantTailwind] || textVariantTailwind.body;
        const alignClass = props.align === 'center' ? 'text-center' : props.align === 'right' ? 'text-right' : '';
        const combined = [variantClass, alignClass].filter(Boolean).join(' ');
        
        let tag = 'p';
        if (props.variant === 'h1') tag = 'h1';
        else if (props.variant === 'h2') tag = 'h2';
        else if (props.variant === 'h3') tag = 'h3';
        else if (props.variant === 'h4') tag = 'h4';
        else if (props.variant === 'label') tag = 'label';
        else if (props.variant === 'small') tag = 'span';

        return `${indent}<${tag} class="${combined}">${props.value}</${tag}>`;
      }

      case 'button': {
        const props = n.props || { label: '' };
        const btnVar = buttonVariantTailwind[props.variant as keyof typeof buttonVariantTailwind] || buttonVariantTailwind.primary;
        const btnSize = buttonSizeTailwind[props.size as keyof typeof buttonSizeTailwind] || buttonSizeTailwind.md;
        const combined = ['inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50', btnVar, btnSize].join(' ');

        // simple emoji icon placeholder in HTML
        let iconStr = '';
        if (props.icon) iconStr = `<span class="mr-2">⭐</span>`;

        return `${indent}<button class="${combined}">${iconStr}${props.label}</button>`;
      }

      case 'input': {
        const props = n.props || {};
        const placeholder = props.placeholder || '';
        const type = props.type || 'text';

        return `${indent}<div class="grid w-full items-center gap-1.5">\n` +
          (props.label ? `${indent}  <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">${props.label}</label>\n` : '') +
          `${indent}  <input type="${type}" placeholder="${placeholder}" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />\n` +
          `${indent}</div>`;
      }

      case 'textarea': {
        const props = n.props || {};
        const placeholder = props.placeholder || '';
        const rows = props.rows || 3;

        return `${indent}<div class="grid w-full gap-1.5">\n` +
          (props.label ? `${indent}  <label class="text-sm font-medium leading-none">${props.label}</label>\n` : '') +
          `${indent}  <textarea placeholder="${placeholder}" rows="${rows}" class="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"></textarea>\n` +
          `${indent}</div>`;
      }

      case 'image': {
        const props = n.props || { src: '' };
        const src = props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
        const alt = props.alt || 'Design Image';
        
        let ratioClass = 'aspect-video';
        if (props.aspectRatio === 'square') ratioClass = 'aspect-square';
        else if (props.aspectRatio === 'portrait') ratioClass = 'aspect-[3/4]';
        else if (props.aspectRatio === 'wide') ratioClass = 'aspect-[21/9]';
        
        const fitClass = props.fit === 'contain' ? 'object-contain' : 'object-cover';
        const combined = `rounded-lg ${ratioClass} ${fitClass} w-full`;

        return `${indent}<img src="${src}" alt="${alt}" class="${combined}" />`;
      }

      case 'icon': {
        const props = n.props || { name: 'star' };
        
        const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
        const sizeClass = sizeMap[props.size as keyof typeof sizeMap] || 'h-6 w-6';

        const colorMap = {
          default: 'text-foreground',
          primary: 'text-primary',
          muted: 'text-muted-foreground',
          destructive: 'text-destructive',
        };
        const colorClass = colorMap[props.color as keyof typeof colorMap] || 'text-foreground';

        return `${indent}<span class="${sizeClass} ${colorClass} inline-flex items-center justify-center">⭐</span>`;
      }

      case 'badge': {
        const props = n.props || { label: '' };
        const badgeVar = {
          default: 'bg-primary text-primary-foreground hover:bg-primary/80',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          outline: 'text-foreground border border-input',
          destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
          success: 'bg-green-500/10 text-green-500 border border-green-500/20',
          warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
        };
        const badgeClass = badgeVar[props.variant as keyof typeof badgeVar] || badgeVar.default;
        
        return `${indent}<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeClass}">${props.label}</span>`;
      }

      case 'avatar': {
        const props = n.props || {};
        const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
        const sizeClass = sizeMap[props.size as keyof typeof sizeMap] || 'h-10 w-10 text-sm';
        
        return `${indent}<div class="relative flex shrink-0 overflow-hidden rounded-full border border-border ${sizeClass} bg-muted items-center justify-center font-semibold">\n` +
          (props.src 
            ? `${indent}  <img src="${props.src}" alt="${props.initials || 'Avatar'}" class="aspect-square h-full w-full object-cover" />\n` 
            : `${indent}  <span>${props.initials || 'AI'}</span>\n`) +
          `${indent}</div>`;
      }

      case 'separator': {
        const props = n.props || {};
        const isHorizontal = props.orientation !== 'vertical';
        const sepClass = isHorizontal ? 'h-[1px] w-full bg-border my-4' : 'w-[1px] h-full bg-border mx-4';
        return `${indent}<div class="${sepClass}"></div>`;
      }

      case 'chart': {
        const props = n.props || { data: [], series: [], xAxisKey: '' };
        return `${indent}<div class="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-6" style="height: ${props.height || '240px'}">\n` +
          `${indent}  <span class="text-sm font-medium text-foreground">${props.title || 'Chart Title'}</span>\n` +
          `${indent}  <span class="text-xs text-muted-foreground">[Chart Visualisation - ${props.type || 'Line'} chart]</span>\n` +
          `${indent}</div>`;
      }

      case 'table': {
        const props = n.props || { headers: [], rows: [] };
        const headers = props.headers || [];
        const rows = props.rows || [];
        const isDense = props.variant === 'dense';
        const isStriped = props.variant === 'striped';
        
        const pad = isDense ? 'p-2 text-xs' : 'p-4 text-sm';

        const tableHeaders = headers.map(h => `${indent}          <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">${h}</th>`).join('\n');
        
        const tableRows = rows.map((row, idx) => {
          const rowBg = (isStriped && idx % 2 === 1) ? 'bg-muted/30' : '';
          const cells = headers.map(h => {
            const val = row[h] !== undefined ? row[h] : row[h.toLowerCase()] !== undefined ? row[h.toLowerCase()] : '';
            return `${indent}            <td class="${pad} align-middle">${val}</td>`;
          }).join('\n');
          
          return `${indent}          <tr class="border-b transition-colors hover:bg-muted/50 ${rowBg}">\n${cells}\n${indent}          </tr>`;
        }).join('\n');

        return `${indent}<div class="w-full overflow-auto rounded-lg border border-border">\n` +
          `${indent}  <table class="w-full caption-bottom text-sm">\n` +
          `${indent}    <thead class="[&_tr]:border-b bg-muted/10">\n` +
          `${indent}      <tr>\n${tableHeaders}\n${indent}      </tr>\n    </thead>\n` +
          `${indent}    <tbody class="[&_tr:last-child]:border-0">\n${tableRows}\n${indent}    </tbody>\n` +
          `${indent}  </table>\n` +
          `${indent}</div>`;
      }

      default:
        return '';
    }
  }

  const generatedHtml = renderHtmlNode(node, 1);
  return `<div class="w-full min-h-screen bg-background p-6 md:p-10 flex items-center justify-center text-foreground dark">\n${generatedHtml}\n</div>`;
}
