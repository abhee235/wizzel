
/**
 * Merges two SVG strings into a single <svg>.
 *
 * @param svgString1 First SVG markup (string).
 * @param svgString2 Second SVG markup (string).
 * @param offsetX    How far to offset the second SVG horizontally (optional).
 * @param offsetY    How far to offset the second SVG vertically (optional).
 * @param toBase64   If true, returns a data URL (base64). Otherwise returns the raw <svg> string.
 * @returns          The merged SVG as either a raw string or data URL.
 */
export function mergeSVGs(
    svgString1: string,
    svgString2: string,
    offsetX: number = 0,
    offsetY: number = 0,
    toBase64: boolean = false
  ): string {
    // Parse the first SVG
    const parser = new DOMParser();
    const doc1 = parser.parseFromString(svgString1, 'image/svg+xml');
    const svg1 = doc1.documentElement; // <svg> root of first
  
    // Parse the second SVG
    const doc2 = parser.parseFromString(svgString2, 'image/svg+xml');
    const svg2 = doc2.documentElement; // <svg> root of second
  
    // If either parse had an error, handle it
    if (svg1.nodeName !== 'svg' || svg2.nodeName !== 'svg') {
      throw new Error('Invalid SVG strings provided.');
    }
  
    //    Read the width/height/viewBox from the first <svg> (and optionally from the second if you want bigger bounds).
    //    We'll assume the first <svg> is your main bounding area.
    //    If you want to auto-resize the final <svg> to fit both, you'd parse widths or viewBoxes from both
    //    and pick the max bounding box. For simplicity, we just keep the first <svg> dimensions as final.
  
    //   Create a <g> node that will hold the second <svg>’s children
    const groupForSecond = doc1.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
  
    // 5. If you want to offset the second SVG, set a transform on the group
    if (offsetX !== 0 || offsetY !== 0) {
      groupForSecond.setAttribute(
        'transform',
        `translate(${offsetX}, ${offsetY})`
      );
    }
  
    //    Import all child nodes from second <svg> into this group
    //    We skip the <defs> if we want them separate? Or you can keep them.
    //    Typically you'll want <defs> too if you rely on gradients, etc.
    //    So let's move everything except the root <svg> itself.
    while (svg2.childNodes.length > 0) {
      const child = svg2.childNodes[0];
      groupForSecond.appendChild(doc1.importNode(child, true));
      svg2.removeChild(child);
    }
  
    //  Append that <g> to the first <svg>
    svg1.appendChild(groupForSecond);
  
    //  Convert the merged DOM back to a string
    const mergedString = new XMLSerializer().serializeToString(doc1);
  
    //  encode as base64 data URL
    if (toBase64) {
      const base64 = btoa(mergedString);
      return `data:image/svg+xml;base64,${base64}`;
    } else {
      return mergedString;
    }
  }