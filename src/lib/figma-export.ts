import { UIDSL } from './ui-schema';

/**
 * Maps spacing keys to explicit pixel values.
 */
const spacingMap = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

/**
 * Converts UIDSL to a specialized HTML format optimized for the html.to.design Figma plugin.
 * Uses inline styles, explicit flex dimensions, and data-name attributes for Figma layer naming.
 */
export function dslToFigmaHtml(node: UIDSL): string {
  if (!node) return '';

  const getCommonStyles = (props: any) => {
    const styles: string[] = [];
    const style = props?.style;

    if (style) {
      if (style.background) {
        if (style.background === 'default') styles.push('background-color: #09090b; color: #fafafa;');
        else if (style.background === 'muted') styles.push('background-color: #18181b; color: #a1a1aa;');
        else if (style.background === 'primary') styles.push('background-color: #fafafa; color: #18181b;');
        else if (style.background === 'secondary') styles.push('background-color: #27272a; color: #fafafa;');
        else if (style.background === 'glass') styles.push('background-color: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1);');
        else if (style.background === 'gradient-subtle') styles.push('background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);');
        else if (style.background === 'gradient-vibrant') styles.push('background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%);');
      }
      if (style.radius) {
        const radiusMap = { none: '0px', sm: '4px', md: '8px', lg: '12px', xl: '16px', '2xl': '24px', full: '9999px' };
        styles.push(`border-radius: ${radiusMap[style.radius as keyof typeof radiusMap] || '8px'};`);
      }
      if (style.border) {
        styles.push('border: 1px solid #27272a;');
      }
      if (style.shadow) {
        const shadowMap = {
          none: 'none',
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        };
        styles.push(`box-shadow: ${shadowMap[style.shadow as keyof typeof shadowMap] || 'none'};`);
      }
    }
    return styles;
  };

  switch (node.type) {
    case 'container': {
      const props = node.props || {};
      const direction = props.direction || 'vertical';
      const gap = props.gap ? `${spacingMap[props.gap as keyof typeof spacingMap]}px` : '16px';
      const padding = props.padding ? `${spacingMap[props.padding as keyof typeof spacingMap]}px` : '0px';
      
      const styles = [
        'display: flex;',
        'box-sizing: border-box;',
        `padding: ${padding};`,
        ...getCommonStyles(props)
      ];

      if (direction === 'vertical') {
        styles.push('flex-direction: column;');
        styles.push(`gap: ${gap};`);
      } else if (direction === 'horizontal') {
        styles.push('flex-direction: row;');
        styles.push(`gap: ${gap};`);
        
        const align = props.align || 'start';
        const justify = props.justify || 'start';
        
        if (align === 'center') styles.push('align-items: center;');
        else if (align === 'end') styles.push('align-items: flex-end;');
        else styles.push('align-items: flex-start;');

        if (justify === 'center') styles.push('justify-content: center;');
        else if (justify === 'end') styles.push('justify-content: flex-end;');
        else if (justify === 'between') styles.push('justify-content: space-between;');
        else styles.push('justify-content: flex-start;');
      } else if (direction === 'grid') {
        styles.push('display: grid;');
        const cols = props.cols || 1;
        styles.push(`grid-template-columns: repeat(${cols}, minmax(0, 1fr));`);
        styles.push(`gap: ${gap};`);
      }

      if (props.maxWidth && props.maxWidth !== 'full') {
        const maxWidthMap = { sm: '384px', md: '672px', lg: '1024px', xl: '1280px', '2xl': '1400px' };
        styles.push(`max-width: ${maxWidthMap[props.maxWidth as keyof typeof maxWidthMap] || '100%'};`);
        styles.push('width: 100%;');
        styles.push('margin-left: auto;');
        styles.push('margin-right: auto;');
      }

      const childrenStr = (node.children || []).map(child => dslToFigmaHtml(child)).join('\n');
      const layerName = props.direction === 'grid' ? 'Grid Auto Layout' : props.direction === 'horizontal' ? 'Row Auto Layout' : 'Stack Auto Layout';

      return `<div data-name="${layerName}" style="${styles.join(' ')}">${childrenStr}</div>`;
    }

    case 'card': {
      const props = node.props || {};
      const padding = props.padding ? `${spacingMap[props.padding as keyof typeof spacingMap]}px` : '24px';
      
      const styles = [
        'display: flex;',
        'flex-direction: column;',
        'box-sizing: border-box;',
        `padding: ${padding};`,
        'gap: 16px;',
        ...getCommonStyles(props)
      ];

      const variant = props.variant || 'default';
      if (variant === 'default') {
        styles.push('background-color: #09090b; border: 1px solid #27272a; border-radius: 12px;');
      } else if (variant === 'elevated') {
        styles.push('background-color: #09090b; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);');
      } else if (variant === 'glass') {
        styles.push('background-color: rgba(255, 255, 255, 0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px;');
      } else if (variant === 'flat') {
        styles.push('background-color: #18181b; border-radius: 8px;');
      } else if (variant === 'bordered') {
        styles.push('border: 2px dashed #27272a; border-radius: 12px;');
      }

      let headerStr = '';
      if (props.title || props.description) {
        headerStr = `<div data-name="Card Header" style="display: flex; flex-direction: column; gap: 4px;">
          ${props.title ? `<h3 data-name="Title" style="margin: 0; font-size: 20px; font-weight: 600; color: #fafafa; font-family: Inter, sans-serif;">${props.title}</h3>` : ''}
          ${props.description ? `<p data-name="Description" style="margin: 0; font-size: 14px; color: #a1a1aa; font-family: Inter, sans-serif;">${props.description}</p>` : ''}
        </div>`;
      }

      const childrenStr = (node.children || []).map(child => dslToFigmaHtml(child)).join('\n');
      
      let footerStr = '';
      if (props.footer && props.footer.length > 0) {
        const footerChildren = props.footer.map(f => dslToFigmaHtml(f)).join('\n');
        footerStr = `<div data-name="Card Footer" style="margin-top: auto; padding-top: 16px; border-top: 1px solid #27272a; display: flex; gap: 12px; justify-content: flex-end;">${footerChildren}</div>`;
      }

      return `<div data-name="Card Container" style="${styles.join(' ')}">
        ${headerStr}
        ${childrenStr}
        ${footerStr}
      </div>`;
    }

    case 'text': {
      const props = node.props || { value: '' };
      const variant = props.variant || 'body';
      const align = props.align || 'left';
      
      const styles = [
        `text-align: ${align};`,
        'margin: 0;',
        'font-family: Inter, sans-serif;',
        'box-sizing: border-box;'
      ];

      let tag = 'p';
      if (variant === 'h1') {
        tag = 'h1';
        styles.push('font-size: 40px; font-weight: 800; line-height: 1.2; letter-spacing: -1px; color: #fafafa;');
      } else if (variant === 'h2') {
        tag = 'h2';
        styles.push('font-size: 32px; font-weight: 700; line-height: 1.3; color: #fafafa;');
      } else if (variant === 'h3') {
        tag = 'h3';
        styles.push('font-size: 24px; font-weight: 600; color: #fafafa;');
      } else if (variant === 'h4') {
        tag = 'h4';
        styles.push('font-size: 20px; font-weight: 600; color: #fafafa;');
      } else if (variant === 'body') {
        tag = 'p';
        styles.push('font-size: 16px; font-weight: 400; color: #fafafa; line-height: 1.6;');
      } else if (variant === 'small') {
        tag = 'span';
        styles.push('font-size: 14px; font-weight: 500; color: #fafafa;');
      } else if (variant === 'muted') {
        tag = 'p';
        styles.push('font-size: 14px; font-weight: 400; color: #a1a1aa; line-height: 1.6;');
      } else if (variant === 'label') {
        tag = 'label';
        styles.push('font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa;');
      } else if (variant === 'success') {
        tag = 'p';
        styles.push('font-size: 14px; font-weight: 400; color: #22c55e;');
      } else if (variant === 'destructive') {
        tag = 'p';
        styles.push('font-size: 14px; font-weight: 400; color: #ef4444;');
      }

      return `<${tag} data-name="Text Node" style="${styles.join(' ')}">${props.value}</${tag}>`;
    }

    case 'button': {
      const props = node.props || { label: '' };
      const variant = props.variant || 'primary';
      const size = props.size || 'md';
      
      const styles = [
        'display: inline-flex;',
        'align-items: center;',
        'justify-content: center;',
        'font-family: Inter, sans-serif;',
        'font-weight: 500;',
        'border-radius: 6px;',
        'cursor: pointer;',
        'box-sizing: border-box;',
        'gap: 8px;',
        'border: none;'
      ];

      if (variant === 'primary') {
        styles.push('background-color: #fafafa; color: #18181b;');
      } else if (variant === 'secondary') {
        styles.push('background-color: #27272a; color: #fafafa;');
      } else if (variant === 'outline') {
        styles.push('background-color: transparent; color: #fafafa; border: 1px solid #27272a;');
      } else if (variant === 'ghost') {
        styles.push('background-color: transparent; color: #fafafa;');
      } else if (variant === 'destructive') {
        styles.push('background-color: #ef4444; color: #fafafa;');
      }

      if (size === 'sm') {
        styles.push('padding: 6px 12px; font-size: 14px;');
      } else if (size === 'md') {
        styles.push('padding: 8px 16px; font-size: 14px;');
      } else if (size === 'lg') {
        styles.push('padding: 12px 24px; font-size: 16px;');
      } else if (size === 'icon') {
        styles.push('padding: 8px; width: 40px; height: 40px;');
      }

      const iconStr = props.icon ? `<span style="font-size: 16px;">⭐</span>` : '';
      return `<button data-name="Button" style="${styles.join(' ')}">${iconStr}<span style="font-family:Inter,sans-serif;">${props.label}</span></button>`;
    }

    case 'input': {
      const props = node.props || {};
      const placeholder = props.placeholder || '';
      
      const labelStr = props.label 
        ? `<label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #fafafa; font-family: Inter, sans-serif;">${props.label}</label>` 
        : '';
        
      const inputStyle = `display: block; width: 100%; padding: 8px 12px; font-size: 14px; background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; color: #fafafa; outline: none; box-sizing: border-box; font-family: Inter, sans-serif;`;
      
      return `<div data-name="Input Group" style="width: 100%; display: flex; flex-direction: column;">
        ${labelStr}
        <input type="text" placeholder="${placeholder}" style="${inputStyle}" />
      </div>`;
    }

    case 'textarea': {
      const props = node.props || {};
      const placeholder = props.placeholder || '';
      const rows = props.rows || 3;
      
      const labelStr = props.label 
        ? `<label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: #fafafa; font-family: Inter, sans-serif;">${props.label}</label>` 
        : '';
        
      const textareaStyle = `display: block; width: 100%; padding: 8px 12px; font-size: 14px; background-color: #18181b; border: 1px solid #27272a; border-radius: 6px; color: #fafafa; outline: none; box-sizing: border-box; font-family: Inter, sans-serif; resize: vertical;`;
      
      return `<div data-name="Textarea Group" style="width: 100%; display: flex; flex-direction: column;">
        ${labelStr}
        <textarea placeholder="${placeholder}" rows="${rows}" style="${textareaStyle}"></textarea>
      </div>`;
    }

    case 'image': {
      const props = node.props || { src: '' };
      const src = props.src || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
      const alt = props.alt || 'Figma Image';
      const fit = props.fit || 'cover';
      const aspectRatio = props.aspectRatio || 'video';
      
      const styles = [
        'width: 100%;',
        'border-radius: 8px;',
        `object-fit: ${fit};`,
        'display: block;',
        'box-sizing: border-box;'
      ];

      if (aspectRatio === 'video') styles.push('aspect-ratio: 16/9;');
      else if (aspectRatio === 'square') styles.push('aspect-ratio: 1/1;');
      else if (aspectRatio === 'portrait') styles.push('aspect-ratio: 3/4;');
      else if (aspectRatio === 'wide') styles.push('aspect-ratio: 21/9;');

      return `<img data-name="Image Frame" src="${src}" alt="${alt}" style="${styles.join(' ')}" />`;
    }

    case 'icon': {
      const props = node.props || { name: 'star' };
      const color = props.color || 'default';
      const size = props.size || 'md';
      
      const sizeMap = { sm: '16px', md: '24px', lg: '32px', xl: '48px' };
      const sizePx = sizeMap[size as keyof typeof sizeMap] || '24px';
      
      const colorMap = {
        default: '#fafafa',
        primary: '#fafafa',
        muted: '#a1a1aa',
        destructive: '#ef4444',
      };
      const fill = colorMap[color as keyof typeof colorMap] || '#fafafa';

      return `<span data-name="Icon Layer" style="font-size: ${sizePx}; display: inline-flex; align-items: center; justify-content: center; color: ${fill}; line-height: 1; width: ${sizePx}; height: ${sizePx};">⭐</span>`;
    }

    case 'badge': {
      const props = node.props || { label: '' };
      const variant = props.variant || 'default';
      
      const styles = [
        'display: inline-flex;',
        'align-items: center;',
        'padding: 2px 8px;',
        'font-size: 12px;',
        'font-weight: 600;',
        'border-radius: 9999px;',
        'line-height: 1;',
        'box-sizing: border-box;',
        'font-family: Inter, sans-serif;'
      ];

      if (variant === 'default') {
        styles.push('background-color: #fafafa; color: #18181b;');
      } else if (variant === 'secondary') {
        styles.push('background-color: #27272a; color: #fafafa;');
      } else if (variant === 'outline') {
        styles.push('background-color: transparent; color: #fafafa; border: 1px solid #27272a;');
      } else if (variant === 'destructive') {
        styles.push('background-color: rgba(239, 68, 68, 0.1); color: #ef4444;');
      } else if (variant === 'success') {
        styles.push('background-color: rgba(34, 197, 94, 0.1); color: #22c55e;');
      } else if (variant === 'warning') {
        styles.push('background-color: rgba(245, 158, 11, 0.1); color: #f59e0b;');
      }

      return `<span data-name="Badge" style="${styles.join(' ')}">${props.label}</span>`;
    }

    case 'avatar': {
      const props = node.props || {};
      const size = props.size || 'md';
      
      const sizeMap = { sm: '32px', md: '40px', lg: '48px' };
      const sizePx = sizeMap[size as keyof typeof sizeMap] || '40px';

      const avatarStyle = `width: ${sizePx}; height: ${sizePx}; border-radius: 50%; overflow: hidden; background-color: #27272a; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: calc(${sizePx} * 0.4); color: #fafafa; border: 1px solid #27272a; box-sizing: border-box; font-family: Inter, sans-serif;`;
      
      if (props.src) {
        return `<div data-name="Avatar Frame" style="${avatarStyle}"><img src="${props.src}" alt="${props.initials || ''}" style="width:100%; height:100%; object-fit:cover;" /></div>`;
      }
      
      return `<div data-name="Avatar Frame" style="${avatarStyle}"><span>${props.initials || 'AI'}</span></div>`;
    }

    case 'separator': {
      const props = node.props || {};
      const orientation = props.orientation || 'horizontal';
      
      const style = orientation === 'horizontal' 
        ? 'width: 100%; height: 1px; background-color: #27272a; border: none; margin: 16px 0; box-sizing: border-box;'
        : 'width: 1px; height: 100%; min-height: 24px; background-color: #27272a; border: none; margin: 0 16px; box-sizing: border-box;';
        
      return `<hr data-name="Separator Line" style="${style}" />`;
    }

    case 'chart': {
      const props = node.props || { data: [], series: [], xAxisKey: '' };
      return `<div data-name="Chart Node" style="width: 100%; height: ${props.height || '240px'}; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px; box-sizing: border-box; font-family: Inter, sans-serif;">
        <span style="font-size: 14px; font-weight: 500; color: #fafafa;">${props.title || 'Chart Data'}</span>
        <span style="font-size: 12px; color: #a1a1aa;">[Figma-Ready Chart Frame]</span>
      </div>`;
    }

    case 'table': {
      const props = node.props || { headers: [], rows: [] };
      const headers = props.headers || [];
      const rows = props.rows || [];
      
      let tableStyle = 'width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; color: #fafafa; font-family: Inter, sans-serif;';
      let thStyle = 'padding: 12px 16px; border-bottom: 1px solid #27272a; font-weight: 600; color: #a1a1aa;';
      let tdStyle = 'padding: 12px 16px; border-bottom: 1px solid #27272a;';
      
      if (props.variant === 'dense') {
        thStyle = 'padding: 8px 12px; border-bottom: 1px solid #27272a; font-weight: 600; color: #a1a1aa;';
        tdStyle = 'padding: 8px 12px; border-bottom: 1px solid #27272a;';
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

      return `<div data-name="Table Container" style="width: 100%; overflow-x: auto; border: 1px solid #27272a; border-radius: 8px; box-sizing: border-box;">
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
 * Copies plain HTML to the browser clipboard using the modern Clipboard API.
 * Maps it under text/html and text/plain to allow direct Figma pasting.
 */
export async function copyToClipboard(html: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const text = html.replace(/<[^>]*>/g, '').trim(); // plain text strip fallback
    
    // Create blobs for clipboard items
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([text], { type: 'text/plain' });
    
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });
    
    await navigator.clipboard.write([item]);
  } catch (err) {
    console.error('Failed to copy html.to.design code to clipboard', err);
    // Fallback: copy raw HTML text string
    try {
      await navigator.clipboard.writeText(html);
    } catch (fallbackErr) {
      console.error('All clipboard operations failed', fallbackErr);
      throw new Error('Clipboard write blocked by browser or system settings');
    }
  }
}

/**
 * Translates UIDSL directly into an abstract JSON structure mirroring Figma API node structures.
 * This can be used in custom Figma plugins to draw frames, layout modes, shapes, and texts.
 */
export function generateFigmaLayers(node: UIDSL): object {
  if (!node) return {};

  const baseNode = {
    id: Math.random().toString(36).substring(2, 9),
    name: node.type.toUpperCase(),
    type: 'FRAME',
  };

  switch (node.type) {
    case 'container': {
      const props = node.props || {};
      return {
        ...baseNode,
        type: 'FRAME',
        name: 'Auto Layout Container',
        layoutMode: props.direction === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL',
        itemSpacing: props.gap ? spacingMap[props.gap as keyof typeof spacingMap] || 16 : 16,
        paddingLeft: props.padding ? spacingMap[props.padding as keyof typeof spacingMap] || 0 : 0,
        paddingRight: props.padding ? spacingMap[props.padding as keyof typeof spacingMap] || 0 : 0,
        paddingTop: props.padding ? spacingMap[props.padding as keyof typeof spacingMap] || 0 : 0,
        paddingBottom: props.padding ? spacingMap[props.padding as keyof typeof spacingMap] || 0 : 0,
        children: (node.children || []).map(child => generateFigmaLayers(child)),
      };
    }
    
    case 'card': {
      const props = node.props || {};
      const paddingVal = props.padding ? spacingMap[props.padding as keyof typeof spacingMap] || 24 : 24;
      return {
        ...baseNode,
        type: 'FRAME',
        name: `Card [${props.variant || 'default'}]`,
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        paddingLeft: paddingVal,
        paddingRight: paddingVal,
        paddingTop: paddingVal,
        paddingBottom: paddingVal,
        cornerRadius: 12,
        fills: [{ type: 'SOLID', color: { r: 0.035, g: 0.035, b: 0.043 } }], // #09090b
        strokes: [{ type: 'SOLID', color: { r: 0.152, g: 0.152, b: 0.165 } }], // #27272a
        strokeWeight: 1,
        children: [
          // If title/description exists, mock them
          ...(props.title ? [{
            id: Math.random().toString(36).substring(2, 9),
            type: 'TEXT',
            name: 'Title',
            characters: props.title,
            fontSize: 20,
            fontName: { family: 'Inter', style: 'SemiBold' },
            fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }],
          }] : []),
          ...(props.description ? [{
            id: Math.random().toString(36).substring(2, 9),
            type: 'TEXT',
            name: 'Description',
            characters: props.description,
            fontSize: 14,
            fontName: { family: 'Inter', style: 'Regular' },
            fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }],
          }] : []),
          ...(node.children || []).map(child => generateFigmaLayers(child)),
        ],
      };
    }

    case 'text': {
      const props = node.props || { value: '' };
      return {
        ...baseNode,
        type: 'TEXT',
        name: 'Text Layer',
        characters: props.value,
        fontSize: props.variant === 'h1' ? 40 : props.variant === 'h2' ? 32 : props.variant === 'h3' ? 24 : 16,
        fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }],
        textAlignHorizontal: props.align ? props.align.toUpperCase() : 'LEFT',
      };
    }

    case 'button': {
      const props = node.props || { label: '' };
      return {
        ...baseNode,
        type: 'FRAME',
        name: `Button [${props.variant || 'primary'}]`,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        cornerRadius: 6,
        fills: props.variant === 'secondary' 
          ? [{ type: 'SOLID', color: { r: 0.152, g: 0.152, b: 0.165 } }] 
          : [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }],
        children: [{
          id: Math.random().toString(36).substring(2, 9),
          type: 'TEXT',
          name: 'Label',
          characters: props.label,
          fontSize: 14,
          fills: props.variant === 'secondary' 
            ? [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }] 
            : [{ type: 'SOLID', color: { r: 0.094, g: 0.094, b: 0.105 } }],
        }],
      };
    }

    case 'input': {
      const props = node.props || {};
      return {
        ...baseNode,
        type: 'FRAME',
        name: 'Input Field',
        layoutMode: 'VERTICAL',
        itemSpacing: 6,
        children: [
          ...(props.label ? [{
            id: Math.random().toString(36).substring(2, 9),
            type: 'TEXT',
            name: 'Label',
            characters: props.label,
            fontSize: 14,
            fills: [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }],
          }] : []),
          {
            id: Math.random().toString(36).substring(2, 9),
            type: 'FRAME',
            name: 'Input Box',
            cornerRadius: 6,
            fills: [{ type: 'SOLID', color: { r: 0.094, g: 0.094, b: 0.105 } }],
            strokes: [{ type: 'SOLID', color: { r: 0.152, g: 0.152, b: 0.165 } }],
            strokeWeight: 1,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: 8,
            children: [{
              id: Math.random().toString(36).substring(2, 9),
              type: 'TEXT',
              name: 'Placeholder',
              characters: props.placeholder || '',
              fontSize: 14,
              fills: [{ type: 'SOLID', color: { r: 0.63, g: 0.63, b: 0.67 } }],
            }],
          },
        ],
      };
    }

    default:
      return {
        ...baseNode,
        type: 'RECTANGLE',
        name: `${node.type} placeholder`,
        fills: [{ type: 'SOLID', color: { r: 0.094, g: 0.094, b: 0.105 } }],
      };
  }
}
