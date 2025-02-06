
/**
 * Creates an SVG-based "info box" cursor, It can be used along with cursors`.
 * Returns a `data:image/svg+xml;base64` string that you can use as `cursor: url(...)`.
 *
 * @param text - The text to display in the tooltip or info box.
 * @param padding - Padding around the text.
 * @param cornerRadius - The corner radius for the rounded box.
 * @returns A data URL (base64) containing the rendered SVG.
 */

interface SVGInfoBoxProps {
    text: string;
    padding?: number;
    cornerRadius?: number;
    svgType?: string;
  }
  export function createSVGInfoBox({
    text,
    padding = 6,
    cornerRadius = 5,
    svgType = 'svg', // 'svg' or 'html'
  }: SVGInfoBoxProps): string {
    const fontSize = 10;
    const fontFamily = 'Inter, sans-serif';
  
    // Rough text measurement approach:
    const avgCharWidth = 0.6; // guess 0.6 * fontSize per character
    const textWidth = text.length * (fontSize * avgCharWidth);
  
    const textHeight = 5; //can also be used as fontSize;
  
    const rectWidth = textWidth + padding * 2;
    const rectHeight = textHeight + padding * 2;
  
    //    We want an <svg> that encloses this box.
    //    We'll put the box at (0,0) to (rectWidth, rectHeight).
    //    Then we'll center the text and draw the rounded rect with cornerRadius.
    //    We'll also shift everything so the "tip" (top edge) is at y=0 if desired.
    //    For a simple approach, let's keep the entire box in bounding box.
  
    // Create the rounded rect path in SVG format:
    // M cornerRadius,0
    // H (rectWidth - cornerRadius)
    // A cornerRadius,cornerRadius 0 0 1 rectWidth,cornerRadius
    // V (rectHeight - cornerRadius)
    // A cornerRadius,cornerRadius 0 0 1 (rectWidth - cornerRadius),rectHeight
    // H cornerRadius
    // A cornerRadius,cornerRadius 0 0 1 0,(rectHeight - cornerRadius)
    // V cornerRadius
    // A cornerRadius,cornerRadius 0 0 1 cornerRadius,0
    //
    // (This is the typical "roundedRect" path).
  
    const pathD = `
        M ${cornerRadius},0
        H ${rectWidth - cornerRadius}
        A ${cornerRadius},${cornerRadius} 0 0 1 ${rectWidth},${cornerRadius}
        V ${rectHeight - cornerRadius}
        A ${cornerRadius},${cornerRadius} 0 0 1 ${rectWidth - cornerRadius},${rectHeight}
        H ${cornerRadius}
        A ${cornerRadius},${cornerRadius} 0 0 1 0,${rectHeight - cornerRadius}
        V ${cornerRadius}
        A ${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0
        Z
      `;
  
    //  Construct the <svg> markup. We'll include a <path> with fill="#3B82F6" (blue).
    //  Then we'll add <text> with fill="#fff", centered in the box.
  
    const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${rectWidth}"
      height="${rectHeight + textHeight}"
      viewBox="0 0 ${rectWidth} ${rectHeight}"
      fill="none"
    >
      <path d="${pathD}" fill="#3B82F6"/>
      <text
        x="${rectWidth / 2}"
        y="${rectHeight / 2 + textHeight / 2 - 2}" 
        text-anchor="middle"
        font-family="${fontFamily}"
        font-size="${fontSize}"
        fill="#ffffff"
        alignment-baseline="middle"
      >
        ${text}
      </text>
    </svg>
      `;
  
    const svgBase64 = btoa(svg);
  
    if (svgType === 'html') {
      return svg;
    }
    return `data:image/svg+xml;base64,${svgBase64}`;
  }