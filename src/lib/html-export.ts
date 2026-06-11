import { UIDSL } from './ui-schema';

/**
 * Maps UIDSL spacing keys to CSS pixel values.
 */
const spacingMap = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

/**
 * Maps UIDSL border radius keys to CSS values.
 */
const radiusMap = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

/**
 * Maps UIDSL shadow keys to CSS box-shadow values.
 */
const shadowMap = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
};

/**
 * Converts a UIDSL node style props into inline CSS styles.
 */
function getStyleString(style?: any, customStyles: Record<string, string> = {}): string {
  const styles: string[] = [];

  if (style) {
    if (style.background) {
      if (style.background === 'default') styles.push('background-color: var(--background); color: var(--foreground);');
      else if (style.background === 'muted') styles.push('background-color: var(--muted); color: var(--muted-foreground);');
      else if (style.background === 'primary') styles.push('background-color: var(--primary); color: var(--primary-foreground);');
      else if (style.background === 'secondary') styles.push('background-color: var(--secondary); color: var(--secondary-foreground);');
      else if (style.background === 'glass') styles.push('background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);');
      else if (style.background === 'gradient-subtle') styles.push('background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);');
      else if (style.background === 'gradient-vibrant') styles.push('background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);');
    }
    if (style.radius && radiusMap[style.radius as keyof typeof radiusMap]) {
      styles.push(`border-radius: ${radiusMap[style.radius as keyof typeof radiusMap]};`);
    }
    if (style.border) {
      styles.push('border: 1px solid var(--border);');
    }
    if (style.shadow && shadowMap[style.shadow as keyof typeof shadowMap]) {
      styles.push(`box-shadow: ${shadowMap[style.shadow as keyof typeof shadowMap]};`);
    }
  }

  for (const [key, value] of Object.entries(customStyles)) {
    styles.push(`${key}: ${value};`);
  }

  return styles.length > 0 ? ` style="${styles.join(' ')}"` : '';
}

/**
 * Converts a single UIDSL node into standalone inline-styled HTML.
 */
export function dslToInlineHtml(node: UIDSL): string {
  if (!node) return '';

  switch (node.type) {
    case 'container': {
      const props = node.props || {};
      const direction = props.direction || 'vertical';
      const gap = props.gap ? spacingMap[props.gap as keyof typeof spacingMap] : '16px';
      const padding = props.padding ? spacingMap[props.padding as keyof typeof spacingMap] : '0px';
      
      const customStyles: Record<string, string> = {
        display: 'flex',
        padding,
      };

      if (direction === 'vertical') {
        customStyles['flex-direction'] = 'column';
        customStyles['gap'] = gap;
      } else if (direction === 'horizontal') {
        customStyles['flex-direction'] = 'row';
        customStyles['gap'] = gap;
        
        const align = props.align || 'start';
        const justify = props.justify || 'start';
        
        if (align === 'center') customStyles['align-items'] = 'center';
        else if (align === 'end') customStyles['align-items'] = 'flex-end';
        else customStyles['align-items'] = 'flex-start';

        if (justify === 'center') customStyles['justify-content'] = 'center';
        else if (justify === 'end') customStyles['justify-content'] = 'flex-end';
        else if (justify === 'between') customStyles['justify-content'] = 'space-between';
        else customStyles['justify-content'] = 'flex-start';
      } else if (direction === 'grid') {
        customStyles['display'] = 'grid';
        const cols = props.cols || 1;
        customStyles['grid-template-columns'] = `repeat(${cols}, minmax(0, 1fr))`;
        customStyles['gap'] = gap;
      }

      if (props.maxWidth && props.maxWidth !== 'full') {
        const maxWidthMap = { sm: '384px', md: '672px', lg: '1024px', xl: '1280px', '2xl': '1400px' };
        customStyles['max-width'] = maxWidthMap[props.maxWidth as keyof typeof maxWidthMap] || '100%';
        customStyles['width'] = '100%';
        customStyles['margin-left'] = 'auto';
        customStyles['margin-right'] = 'auto';
      }

      const styleStr = getStyleString(props.style, customStyles);
      const childrenStr = (node.children || []).map(child => dslToInlineHtml(child)).join('\n');
      
      return `<div class="container"${styleStr}>${childrenStr}</div>`;
    }

    case 'card': {
      const props = node.props || {};
      const padding = props.padding ? spacingMap[props.padding as keyof typeof spacingMap] : '24px';
      
      const customStyles: Record<string, string> = {
        padding,
        display: 'flex',
        'flex-direction': 'column',
        gap: '16px',
      };

      // Base card style variables based on variant
      const variant = props.variant || 'default';
      if (variant === 'default') {
        customStyles['background-color'] = 'var(--card)';
        customStyles['border'] = '1px solid var(--border)';
        customStyles['border-radius'] = '12px';
        customStyles['box-shadow'] = shadowMap.sm;
      } else if (variant === 'elevated') {
        customStyles['background-color'] = 'var(--card)';
        customStyles['border-radius'] = '12px';
        customStyles['box-shadow'] = shadowMap.lg;
      } else if (variant === 'glass') {
        customStyles['background'] = 'rgba(255, 255, 255, 0.03)';
        customStyles['backdrop-filter'] = 'blur(16px)';
        customStyles['-webkit-backdrop-filter'] = 'blur(16px)';
        customStyles['border'] = '1px solid rgba(255, 255, 255, 0.08)';
        customStyles['border-radius'] = '16px';
        customStyles['box-shadow'] = '0 4px 30px rgba(0, 0, 0, 0.1)';
      } else if (variant === 'flat') {
        customStyles['background-color'] = 'var(--muted)';
        customStyles['border-radius'] = '8px';
      } else if (variant === 'bordered') {
        customStyles['border'] = '2px dashed var(--border)';
        customStyles['border-radius'] = '12px';
      }

      const styleStr = getStyleString(props.style, customStyles);
      
      let headerStr = '';
      if (props.title || props.description) {
        headerStr = `<div style="display: flex; flex-direction: column; gap: 4px;">
          ${props.title ? `<h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--foreground);">${props.title}</h3>` : ''}
          ${props.description ? `<p style="margin: 0; font-size: 0.875rem; color: var(--muted-foreground);">${props.description}</p>` : ''}
        </div>`;
      }

      const childrenStr = (node.children || []).map(child => dslToInlineHtml(child)).join('\n');
      
      let footerStr = '';
      if (props.footer && props.footer.length > 0) {
        const footerChildren = props.footer.map(f => dslToInlineHtml(f)).join('\n');
        footerStr = `<div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 12px; justify-content: flex-end;">${footerChildren}</div>`;
      }

      return `<div class="card"${styleStr}>
        ${headerStr}
        ${childrenStr}
        ${footerStr}
      </div>`;
    }

    case 'text': {
      const props = node.props || { value: '' };
      const variant = props.variant || 'body';
      const align = props.align || 'left';
      
      const customStyles: Record<string, string> = {
        'text-align': align,
        margin: '0',
      };

      let tag = 'p';
      if (variant === 'h1') {
        tag = 'h1';
        customStyles['font-size'] = '2.5rem';
        customStyles['font-weight'] = '800';
        customStyles['line-height'] = '1.2';
        customStyles['letter-spacing'] = '-0.025em';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'h2') {
        tag = 'h2';
        customStyles['font-size'] = '2rem';
        customStyles['font-weight'] = '700';
        customStyles['line-height'] = '1.3';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'h3') {
        tag = 'h3';
        customStyles['font-size'] = '1.5rem';
        customStyles['font-weight'] = '600';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'h4') {
        tag = 'h4';
        customStyles['font-size'] = '1.25rem';
        customStyles['font-weight'] = '600';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'body') {
        tag = 'p';
        customStyles['font-size'] = '1rem';
        customStyles['color'] = 'var(--foreground)';
        customStyles['line-height'] = '1.6';
      } else if (variant === 'small') {
        tag = 'span';
        customStyles['font-size'] = '0.875rem';
        customStyles['font-weight'] = '500';
      } else if (variant === 'muted') {
        tag = 'p';
        customStyles['font-size'] = '0.875rem';
        customStyles['color'] = 'var(--muted-foreground)';
      } else if (variant === 'label') {
        tag = 'label';
        customStyles['font-size'] = '0.75rem';
        customStyles['font-weight'] = '700';
        customStyles['text-transform'] = 'uppercase';
        customStyles['letter-spacing'] = '0.05em';
        customStyles['color'] = 'var(--muted-foreground)';
      } else if (variant === 'success') {
        tag = 'p';
        customStyles['font-size'] = '0.875rem';
        customStyles['color'] = '#22c55e';
      } else if (variant === 'destructive') {
        tag = 'p';
        customStyles['font-size'] = '0.875rem';
        customStyles['color'] = '#ef4444';
      }

      const styleStr = getStyleString(undefined, customStyles);
      return `<${tag}${styleStr}>${props.value}</${tag}>`;
    }

    case 'button': {
      const props = node.props || { label: '' };
      const variant = props.variant || 'primary';
      const size = props.size || 'md';
      
      const customStyles: Record<string, string> = {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-family': 'inherit',
        'font-weight': '500',
        border: 'none',
        'border-radius': '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        gap: '8px',
      };

      if (variant === 'primary') {
        customStyles['background-color'] = 'var(--primary)';
        customStyles['color'] = 'var(--primary-foreground)';
      } else if (variant === 'secondary') {
        customStyles['background-color'] = 'var(--secondary)';
        customStyles['color'] = 'var(--secondary-foreground)';
      } else if (variant === 'outline') {
        customStyles['background-color'] = 'transparent';
        customStyles['color'] = 'var(--foreground)';
        customStyles['border'] = '1px solid var(--border)';
      } else if (variant === 'ghost') {
        customStyles['background-color'] = 'transparent';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'destructive') {
        customStyles['background-color'] = 'var(--destructive)';
        customStyles['color'] = 'var(--destructive-foreground)';
      }

      if (size === 'sm') {
        customStyles['padding'] = '6px 12px';
        customStyles['font-size'] = '0.875rem';
      } else if (size === 'md') {
        customStyles['padding'] = '8px 16px';
        customStyles['font-size'] = '1rem';
      } else if (size === 'lg') {
        customStyles['padding'] = '12px 24px';
        customStyles['font-size'] = '1.125rem';
      } else if (size === 'icon') {
        customStyles['padding'] = '8px';
        customStyles['width'] = '40px';
        customStyles['height'] = '40px';
      }

      const styleStr = getStyleString(undefined, customStyles);
      const iconStr = props.icon ? `<span style="font-size: 1.1em;">⭐</span> ` : ''; // simple emoji placeholder
      return `<button${styleStr}>${iconStr}${props.label}</button>`;
    }

    case 'input': {
      const props = node.props || {};
      const type = props.type || 'text';
      const placeholder = props.placeholder || '';
      
      const labelStr = props.label 
        ? `<label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: var(--foreground);">${props.label}</label>` 
        : '';
        
      const inputStyle = `display: block; width: 100%; padding: 8px 12px; font-size: 0.875rem; background-color: var(--muted); border: 1px solid var(--border); border-radius: 6px; color: var(--foreground); outline: none; box-sizing: border-box;`;
      
      return `<div style="width: 100%; display: flex; flex-direction: column;">
        ${labelStr}
        <input type="${type}" placeholder="${placeholder}" style="${inputStyle}" />
      </div>`;
    }

    case 'textarea': {
      const props = node.props || {};
      const placeholder = props.placeholder || '';
      const rows = props.rows || 3;
      
      const labelStr = props.label 
        ? `<label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 6px; color: var(--foreground);">${props.label}</label>` 
        : '';
        
      const textareaStyle = `display: block; width: 100%; padding: 8px 12px; font-size: 0.875rem; background-color: var(--muted); border: 1px solid var(--border); border-radius: 6px; color: var(--foreground); outline: none; box-sizing: border-box; resize: vertical;`;
      
      return `<div style="width: 100%; display: flex; flex-direction: column;">
        ${labelStr}
        <textarea placeholder="${placeholder}" rows="${rows}" style="${textareaStyle}"></textarea>
      </div>`;
    }

    case 'image': {
      const props = node.props || { src: '' };
      const src = props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
      const alt = props.alt || 'AI generated image';
      const fit = props.fit || 'cover';
      const aspectRatio = props.aspectRatio || 'video';
      
      const customStyles: Record<string, string> = {
        width: '100%',
        'border-radius': '8px',
        'object-fit': fit,
        display: 'block',
      };

      if (aspectRatio === 'video') customStyles['aspect-ratio'] = '16/9';
      else if (aspectRatio === 'square') customStyles['aspect-ratio'] = '1/1';
      else if (aspectRatio === 'portrait') customStyles['aspect-ratio'] = '3/4';
      else if (aspectRatio === 'wide') customStyles['aspect-ratio'] = '21/9';

      const styleStr = getStyleString(undefined, customStyles);
      return `<img src="${src}" alt="${alt}"${styleStr} />`;
    }

    case 'icon': {
      const props = node.props || { name: 'star' };
      const color = props.color || 'default';
      const size = props.size || 'md';
      
      const sizeMap = { sm: '16px', md: '24px', lg: '32px', xl: '48px' };
      const sizePx = sizeMap[size as keyof typeof sizeMap] || '24px';
      
      const colorMap = {
        default: 'var(--foreground)',
        primary: 'var(--primary)',
        muted: 'var(--muted-foreground)',
        destructive: 'var(--destructive)',
      };
      const fill = colorMap[color as keyof typeof colorMap] || 'var(--foreground)';

      return `<span style="font-size: ${sizePx}; display: inline-flex; align-items: center; justify-content: center; color: ${fill}; line-height: 1;">⭐</span>`;
    }

    case 'badge': {
      const props = node.props || { label: '' };
      const variant = props.variant || 'default';
      
      const customStyles: Record<string, string> = {
        display: 'inline-flex',
        'align-items': 'center',
        padding: '2px 8px',
        'font-size': '0.75rem',
        'font-weight': '600',
        'border-radius': '9999px',
        'line-height': '1',
      };

      if (variant === 'default') {
        customStyles['background-color'] = 'var(--primary)';
        customStyles['color'] = 'var(--primary-foreground)';
      } else if (variant === 'secondary') {
        customStyles['background-color'] = 'var(--secondary)';
        customStyles['color'] = 'var(--foreground)';
      } else if (variant === 'outline') {
        customStyles['background-color'] = 'transparent';
        customStyles['color'] = 'var(--foreground)';
        customStyles['border'] = '1px solid var(--border)';
      } else if (variant === 'destructive') {
        customStyles['background-color'] = 'rgba(239, 68, 68, 0.1)';
        customStyles['color'] = '#ef4444';
      } else if (variant === 'success') {
        customStyles['background-color'] = 'rgba(34, 197, 94, 0.1)';
        customStyles['color'] = '#22c55e';
      } else if (variant === 'warning') {
        customStyles['background-color'] = 'rgba(245, 158, 11, 0.1)';
        customStyles['color'] = '#f59e0b';
      }

      const styleStr = getStyleString(undefined, customStyles);
      return `<span${styleStr}>${props.label}</span>`;
    }

    case 'avatar': {
      const props = node.props || {};
      const size = props.size || 'md';
      
      const sizeMap = { sm: '32px', md: '40px', lg: '48px' };
      const sizePx = sizeMap[size as keyof typeof sizeMap] || '40px';

      const avatarStyle = `width: ${sizePx}; height: ${sizePx}; border-radius: 50%; overflow: hidden; background-color: var(--secondary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: calc(${sizePx} * 0.4); color: var(--foreground); border: 1px solid var(--border);`;
      
      if (props.src) {
        return `<div style="${avatarStyle}"><img src="${props.src}" alt="${props.initials || ''}" style="width:100%; height:100%; object-fit:cover;" /></div>`;
      }
      
      return `<div style="${avatarStyle}"><span>${props.initials || 'AI'}</span></div>`;
    }

    case 'separator': {
      const props = node.props || {};
      const orientation = props.orientation || 'horizontal';
      
      const style = orientation === 'horizontal' 
        ? 'width: 100%; height: 1px; background-color: var(--border); border: none; margin: 16px 0;'
        : 'width: 1px; height: 100%; min-height: 24px; background-color: var(--border); border: none; margin: 0 16px;';
        
      return `<hr style="${style}" />`;
    }

    case 'chart': {
      const props = node.props || { data: [], series: [], xAxisKey: '' };
      return `<div style="width: 100%; height: ${props.height || '240px'}; background-color: var(--muted); border: 1px solid var(--border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px;">
        <span style="font-size: 0.875rem; font-weight: 500; color: var(--foreground);">${props.title || 'Chart Data'}</span>
        <span style="font-size: 0.75rem; color: var(--muted-foreground);">[Interactive Chart Preview - ${props.type || 'Line'} Chart]</span>
      </div>`;
    }

    case 'table': {
      const props = node.props || { headers: [], rows: [] };
      const headers = props.headers || [];
      const rows = props.rows || [];
      
      let tableStyle = 'width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem; color: var(--foreground);';
      let thStyle = 'padding: 12px 16px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--muted-foreground);';
      let tdStyle = 'padding: 12px 16px; border-bottom: 1px solid var(--border);';
      
      if (props.variant === 'dense') {
        thStyle = 'padding: 8px 12px; border-bottom: 1px solid var(--border); font-weight: 600; color: var(--muted-foreground);';
        tdStyle = 'padding: 8px 12px; border-bottom: 1px solid var(--border);';
      }

      const headersStr = headers.map(h => `<th style="${thStyle}">${h}</th>`).join('');
      
      const rowsStr = rows.map((row, idx) => {
        const rowBg = (props.variant === 'striped' && idx % 2 === 1) ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
        const cells = headers.map(h => {
          const val = row[h] !== undefined ? row[h] : row[h.toLowerCase()] !== undefined ? row[h.toLowerCase()] : '';
          return `<td style="${tdStyle}">${val}</td>`;
        }).join('');
        return `<tr style="background-color: ${rowBg};">${cells}</tr>`;
      }).join('');

      return `<div style="width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
        <table style="${tableStyle}">
          <thead>
            <tr style="background-color: rgba(255,255,255,0.01);">${headersStr}</tr>
          </thead>
          <tbody>
            ${rowsStr}
          </tbody>
        </table>
      </div>`;
    }

    default:
      return '';
  }
}

/**
 * Returns a complete, standalone, responsive HTML page with modern Dark Mode styles.
 */
export function dslToHtml(node: UIDSL): string {
  const innerHtml = dslToInlineHtml(node);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported AI Design</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --background: #09090b;
      --foreground: #fafafa;
      --card: #09090b;
      --card-foreground: #fafafa;
      --primary: #fafafa;
      --primary-foreground: #18181b;
      --secondary: #27272a;
      --secondary-foreground: #fafafa;
      --muted: #18181b;
      --muted-foreground: #a1a1aa;
      --border: #27272a;
      --radius: 8px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      background-color: var(--background);
      color: var(--foreground);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    /* Base layout wrapper */
    .preview-canvas {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Custom scrollbars */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.01);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--secondary);
    }
  </style>
</head>
<body>
  <div class="preview-canvas">
    ${innerHtml}
  </div>
</body>
</html>`;
}
