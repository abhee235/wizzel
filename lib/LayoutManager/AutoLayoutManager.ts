import * as fabric from 'fabric';
import {
  classRegistry,
  FabricObject,
  Point,
  LayoutStrategy,
  StrictLayoutContext,
  LayoutResult,
} from 'fabric';
import { AutoLayoutStrategy } from './../LayoutStrategy/AutoLayoutStrategy';
import {
  ALIGNMENT_POSITIONS,
  LAYOUT_DIRECTIONS,
} from './LayoutConstant';
//import { FrameLayoutManager } from './FrameLayoutManager';
import {
  LAYOUT_TYPE_ADDED,
  LAYOUT_TYPE_INITIALIZATION,
} from './LayoutConstant';
import { AutoLayout } from '@/lib/shapes/AutoLayout';

interface AutoLayoutResult {
  center: Point;
  size: Point;
  
}

interface InsertionResult {
  index: number;
  preview: {
    lineX: number;
    lineY: number;
    orientation: 'vertical' | 'horizontal';
  };
}

function resolveOrigin(o: fabric.TOriginX | fabric.TOriginY): number {
  switch (o) {
    case 'left':
    case 'top':
      return 0;
    case 'center':
      return -0.5;
    case 'right':
    case 'bottom':
      return -1;
    default:
      return 0;
  }
}

function getCrossAxisAlignedPos(
  crossAxisVal: number,
  objSize: number,
  align: string,
  maxCrossSize: number
): number {
  // If we interpret crossAxisVal as the "top-edge" line:
  // "top" => no shift
  // "center" => shift up by half the object
  // "bottom" => shift up by full object size
  switch (align) {
    case 'center':
    case 'middle':
      return crossAxisVal + maxCrossSize / 2 - objSize / 2;
    case 'bottom':
    case 'right':
      return crossAxisVal + maxCrossSize - objSize;
    // 'top' or 'left' => no shift
    default:
      return crossAxisVal;
  }
}

/**
 * Helper for alignment along a single axis.
 * @param position    e.g. 'left', 'center', 'right', 'top', 'middle', 'bottom'
 * @param containerSz width or height of the container
 * @param contentSz   total width or height occupied by content
 * @param padding1    leading padding (e.g., left or top)
 * @param padding2    trailing padding (e.g., right or bottom)
 */
function alignAxis(
  position: string,
  containerSz: number,
  contentSz: number,
  padding1: number,
  padding2: number
): number {
  switch (position) {
    case 'left':
    case 'top':
      return padding1;
    case 'center':
    case 'middle':
      return (containerSz - contentSz) / 2; // ignoring separate padding if you prefer truly centered
    case 'right':
    case 'bottom':
      return containerSz - contentSz - padding2;
    default:
      return 0;
  }
}

export class AutoLayoutManager extends fabric.LayoutManager {
  declare initialHeight: number;
  declare initialWidth: number;
  private lockedIndex: number | null = null;
  private immediateTolerance = 0;
  private hysteresisRange = 40;

  constructor(strategy: LayoutStrategy) {
    super(strategy);
    this.initialHeight = 0;
    this.initialWidth = 0;
  }

  /**
   * Overridden commitLayout which sets container dimensions and repositions children.
   */
  protected commitLayout(
    context: StrictLayoutContext,
    layoutResult: Required<LayoutResult>
  ) {
    const { target } = context;
    const {
      result: { size },
      nextCenter,
    } = layoutResult;

    target.set({ width: size.x, height: size.y });

    this.layoutObjects(context, layoutResult);

    const left = target.left ?? nextCenter.x - size.x / 2;
    const top = target.top ?? nextCenter.y - size.y / 2;

    if (context.type === LAYOUT_TYPE_INITIALIZATION) {
      target.set({
        left,
        top,
        width: this.initialWidth,
        height: this.initialHeight,
      });
    } else {
      target.set({ left, top });
      if (target.__corner) target.setCoords();
      target.set('dirty', true);
    }
  }

  /**
   * Main layout function to position children based on layout strategy.
   */
  protected layoutObjects(
    context: StrictLayoutContext,
    layoutResult: LayoutResult
  ): void {
    const { target, type } = context;
    const {
      result: { size },
    } = layoutResult as LayoutResult & AutoLayoutResult;

    const strategy = this.strategy as AutoLayoutStrategy;
    const objects = target.getObjects().filter((obj) => !obj.isMoving);

    // Gather padding & gap parameters
    const paddingLeft = strategy.paddingLeft ?? strategy.paddingHorizontal ?? 0;
    const paddingRight =
      strategy.paddingRight ?? strategy.paddingHorizontal ?? 0;
    const paddingTop = strategy.paddingTop ?? strategy.paddingVertical ?? 0;
    const paddingBottom =
      strategy.paddingBottom ?? strategy.paddingVertical ?? 0;

    let horizontalGap = strategy.horizontalGap ?? 0;
    let verticalGap = strategy.verticalGap ?? 0;
    const spacingType = strategy.spacingType ?? 'auto'; // 'auto' | 'manual'
    const alignment = strategy.alignment ?? ALIGNMENT_POSITIONS.TOP_LEFT;
    const [vertAlign, horizAlign] = alignment.split('-');

    // Compute min required sizes and alignment help
    let totalMainSize = 0;
    let maxCrossSize = 0;

    // Identify main/cross axis based on layoutDirection
    const layoutDir = strategy.layoutDirection;
    const isRow = layoutDir === LAYOUT_DIRECTIONS.ROW;
    const isColumn = layoutDir === LAYOUT_DIRECTIONS.COLUMN;
    const isWrap = layoutDir === LAYOUT_DIRECTIONS.WRAP;

    // Sum up child sizes in the main axis
    objects.forEach((obj) => {
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      if (isRow || isWrap) {
        totalMainSize += w;
        maxCrossSize = Math.max(maxCrossSize, h);
      } else if (isColumn) {
        totalMainSize += h;
        maxCrossSize = Math.max(maxCrossSize, w);
      }
    });

    // The container size is set from the layoutResult
    let containerWidth = size.x;
    let containerHeight = size.y;

    // Adjust container dimension if initialization or if hugging content
    if (type === LAYOUT_TYPE_INITIALIZATION) {
      if (isRow) {
        containerHeight = maxCrossSize + paddingTop + paddingBottom;
      } else if (isColumn) {
        containerWidth = maxCrossSize + paddingLeft + paddingRight;
      }
    }

    // If spacing is 'auto' and we have multiple items, try distributing any leftover space
    const objectCount = objects.length;
    const gapCount = objectCount > 1 ? objectCount - 1 : 0;
    if (spacingType === 'auto' && objectCount > 1) {
      if (isRow) {
        const mainAxisSize = containerWidth - (paddingLeft + paddingRight);
        const leftover = mainAxisSize - totalMainSize;
        horizontalGap = leftover > 0 ? leftover / gapCount : 0;
      } else if (isColumn) {
        const mainAxisSize = containerHeight - (paddingTop + paddingBottom);
        const leftover = mainAxisSize - totalMainSize;
        verticalGap = leftover > 0 ? leftover / gapCount : 0;
      }
      // If WRAP, the spacing is more complex; we'll let the wrap logic handle it per line.
    }

    // Handle the main layout directions:
    if (isWrap && objectCount > 0) {
      this.layoutWrap(
        objects,
        containerWidth,
        containerHeight,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        horizontalGap,
        verticalGap,
        vertAlign,
        horizAlign,
        target
      );
    } else if (isRow) {
      this.layoutRow(
        objects,
        containerWidth,
        containerHeight,
        maxCrossSize,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        horizontalGap,
        vertAlign,
        horizAlign
      );
    } else if (isColumn) {
      this.layoutColumn(
        objects,
        containerWidth,
        containerHeight,
        maxCrossSize,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        verticalGap,
        vertAlign,
        horizAlign
      );
    }

    // Final update of container dimensions if first-time layout
    if (type === LAYOUT_TYPE_INITIALIZATION) {
      this.initialWidth = containerWidth;
      this.initialHeight = containerHeight;
      target.set({ width: containerWidth, height: containerHeight });
      strategy.horizontalGap = horizontalGap;
      strategy.verticalGap = verticalGap;
    }

    //target.setCoords();
  }

  /**
   * Helper to layout a single-line row.
   */
  private layoutRow(
    objects: FabricObject[],
    containerWidth: number,
    containerHeight: number,
    maxCrossSize: number,
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    horizontalGap: number,
    vertAlign: string,
    horizAlign: string
  ): void {
    const gapCount = objects.length > 1 ? objects.length - 1 : 0;
    const totalMainSize = objects.reduce(
      (acc, obj) => acc + (obj.width ?? 0),
      0
    );
    const totalGaps = gapCount * horizontalGap;
    const totalMainContent = totalMainSize + totalGaps;

    // Align offsets
    const mainAxisOffset = alignAxis(
      horizAlign,
      containerWidth,
      totalMainContent,
      paddingLeft,
      paddingRight
    );
    const crossAxisOffset = alignAxis(
      vertAlign,
      containerHeight,
      maxCrossSize,
      paddingTop,
      paddingBottom
    );

    let currentPos = mainAxisOffset;
    objects.forEach((obj, i) => {
      const w = obj.width ?? 0;
      const finalLeft = currentPos - containerWidth / 2;
      let finalTop = crossAxisOffset - containerHeight / 2;
      finalTop = getCrossAxisAlignedPos(
        finalTop,
        obj.height ?? 0,
        vertAlign,
        maxCrossSize
      );
      obj.set({ left: finalLeft, top: finalTop });
      obj.setCoords();
      currentPos += w + horizontalGap;
    });
  }

  /**
   * Helper to layout a single-line column.
   */
  private layoutColumn(
    objects: FabricObject[],
    containerWidth: number,
    containerHeight: number,
    maxCrossSize: number,
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    verticalGap: number,
    vertAlign: string,
    horizAlign: string
  ): void {
    const gapCount = objects.length > 1 ? objects.length - 1 : 0;
    const totalMainSize = objects.reduce(
      (acc, obj) => acc + (obj.height ?? 0),
      0
    );
    const totalGaps = gapCount * verticalGap;
    const totalMainContent = totalMainSize + totalGaps;

    // Align offsets
    const mainAxisOffset = alignAxis(
      vertAlign,
      containerHeight,
      totalMainContent,
      paddingTop,
      paddingBottom
    );
    const crossAxisOffset = alignAxis(
      horizAlign,
      containerWidth,
      maxCrossSize,
      paddingLeft,
      paddingRight
    );

    let currentPos = mainAxisOffset;
    objects.forEach((obj) => {
      const h = obj.height ?? 0;
      let finalLeft = crossAxisOffset - containerWidth / 2;
      const finalTop = currentPos - containerHeight / 2;
      finalLeft = getCrossAxisAlignedPos(
        finalLeft,
        obj.width ?? 0,
        horizAlign,
        maxCrossSize
      );
      obj.set({ left: finalLeft, top: finalTop });
      obj.setCoords();
      currentPos += h + verticalGap;
    });
  }

  /**
   * Helper for wrap layout (like multi-line row).
   */
  /**
   * Example wrap layout that ensures:
   *   - "top" => first line is inside container at paddingTop
   *   - "bottom" => last line is inside at containerHeight - paddingBottom
   *   - "center"/"middle" => lines are centered vertically
   */
  private layoutWrap(
    objects: FabricObject[],
    containerWidth: number,
    containerHeight: number,
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number,
    horizontalGap: number,
    verticalGap: number,
    vertAlign: string, // 'top' | 'center' | 'bottom'
    horizAlign: string // 'left' | 'center' | 'right'
  ): void {
    const mainAxisAvailable = containerWidth - (paddingLeft + paddingRight);

    interface Line {
      objects: FabricObject[];
      totalMain: number;
      maxCross: number; // line's tallest object
    }

    const lines: Line[] = [];
    let currentLine: Line = { objects: [], totalMain: 0, maxCross: 0 };

    // 1) Build lines by wrapping horizontally
    objects.forEach((obj) => {
      const w = obj.width ?? 0;
      const h = obj.height ?? 0;
      const spaceNeeded =
        currentLine.objects.length > 0
          ? currentLine.totalMain + horizontalGap + w
          : w;

      if (currentLine.objects.length > 0 && spaceNeeded > mainAxisAvailable) {
        lines.push({ ...currentLine });
        currentLine = { objects: [obj], totalMain: w, maxCross: h };
      } else {
        currentLine.totalMain =
          currentLine.objects.length > 0
            ? currentLine.totalMain + horizontalGap + w
            : w;
        currentLine.maxCross = Math.max(currentLine.maxCross, h);
        currentLine.objects.push(obj);
      }
    });
    if (currentLine.objects.length > 0) {
      lines.push(currentLine);
    }

    // 2) Measure total lines' height (plus verticalGap between lines)
    let totalLinesHeight = 0;
    let maxLineWidth = 0;
    lines.forEach((line) => {
      totalLinesHeight += line.maxCross;
      maxLineWidth = Math.max(maxLineWidth, line.totalMain);
    });
    // Add vertical gaps
    totalLinesHeight += (lines.length - 1) * verticalGap;

    // 3) Potentially "hug" the content, if your logic requires it
    //    Or keep the existing container size if it's fixed.
    // containerWidth = Math.max(
    //   containerWidth,
    //   maxLineWidth + paddingLeft + paddingRight
    // );
    // containerHeight = Math.max(
    //   containerHeight,
    //   totalLinesHeight + paddingTop + paddingBottom
    // );

    // 4) Based on vertAlign, decide where the first line starts
    //    so that "top" anchors the top line at paddingTop,
    //    "bottom" anchors the last line at containerHeight - paddingBottom,
    //    "center" or "middle" splits the difference.
    let stackTop = 0;
    const usableHeight = containerHeight - (paddingTop + paddingBottom);

    switch (vertAlign) {
      case 'bottom': {
        // If totalLinesHeight < usableHeight, we push up so bottom line is at container bottom.
        // If totalLinesHeight > usableHeight, the lines will overflow above the container.
        stackTop = usableHeight - totalLinesHeight; // how much space remains above the top line
        //stackTop = Math.max(stackTop, 0); // If you want to pin it at the bottom even if bigger => remove this.
        stackTop += paddingTop; // shift down by top padding
        break;
      }
      case 'center':
      case 'middle': {
        // Center them vertically
        // If totalLinesHeight > usableHeight, they overflow top & bottom equally
        const leftover = (usableHeight - totalLinesHeight) / 2;
        stackTop = leftover + paddingTop;
        break;
      }
      // "top" => anchor first line at container top (account for paddingTop)
      default: {
        stackTop = paddingTop;
        break;
      }
    }

    // 5) Lay out each line in the vertical dimension
    let currentY = stackTop;
    lines.forEach((line) => {
      const lineWidth = line.totalMain;

      // Horizontal alignment of the entire line within container
      let lineOffsetX = 0;
      const usableWidth = containerWidth - (paddingLeft + paddingRight);
      switch (horizAlign) {
        case 'center':
          lineOffsetX = (usableWidth - lineWidth) / 2;
          break;
        case 'right':
          lineOffsetX = usableWidth - lineWidth;
          break;
        // left => no offset
        default:
          lineOffsetX = 0;
          break;
      }
      // Add left padding offset
      lineOffsetX += paddingLeft;

      // 6) Place each object in the line
      let currentX = lineOffsetX;
      line.objects.forEach((obj) => {
        const w = obj.width ?? 0;
        const h = obj.height ?? 0;

        // The base top/left relative to container's center (0,0).
        const finalLeft = currentX - containerWidth / 2;
        // We place the top edge at currentY - containerHeight / 2.
        // If we want the object to align "top" of the line exactly, do that:
        let finalTop = currentY - containerHeight / 2;

        // If you want each object in the line to have a "top"/"center"/"bottom" alignment
        // with respect to that line's maxCross, use your getCrossAxisAlignedPos:
        finalTop = getCrossAxisAlignedPos(
          finalTop,
          h,
          vertAlign,
          line.maxCross
        );

        // But if you strictly want the line's top to match container's top,
        // you can skip the alignment offset. Up to you.
        // For example, if you do want per-object alignment in the cross-axis:
        // finalTop = getCrossAxisAlignedPos(finalTop, h, vertAlign, line.maxCross);

        obj.set({ left: finalLeft, top: finalTop });
        obj.setCoords();

        currentX += w + horizontalGap;
      });

      // Move down to next line's top
      currentY += line.maxCross + verticalGap;
    });
  }

  /**
   * We don't do additional per-object logic in this manager.
   */
  protected layoutObject(
    context: StrictLayoutContext,
    layoutResult: LayoutResult,
    object: FabricObject
  ): void {
    // No-op
  }

  toObject(): { type: string; strategy: string } {
    return {
      type: 'AutoLayoutManager',
      strategy: (this.strategy.constructor as typeof AutoLayoutStrategy).type,
    };
  }

  /**
   * Find insertion index + a preview line for dragging an object into a layout.
   */
  public findInsertionIndexWithPreview(
    autoLayout: AutoLayout,
    mouseX: number,
    mouseY: number
  ): InsertionResult {
    const index = this.findInsertionIndex(autoLayout, mouseX, mouseY);
    const direction = (this.strategy as AutoLayoutStrategy).layoutDirection;
    let preview: {
      lineX: number;
      lineY: number;
      orientation: 'vertical' | 'horizontal';
    };

    switch (direction) {
      case LAYOUT_DIRECTIONS.ROW:
        preview = this.buildRowGapPreview(autoLayout, index);
        break;
      case LAYOUT_DIRECTIONS.COLUMN:
        preview = this.buildColumnPreview(autoLayout, index);
        break;
      case LAYOUT_DIRECTIONS.WRAP:
        preview = this.buildWrapPreview(autoLayout, index);
        break;
      default:
        // Fallback
        preview = { lineX: 0, lineY: 0, orientation: 'vertical' };
        break;
    }

    return { index, preview };
  }

  private buildRowGapPreview = (
    autoLayout: AutoLayout,
    insertionIndex: number
  ): { lineX: number; lineY: number; orientation: 'vertical' } => {
    const objects = autoLayout.getObjects();
    let x = 0;

    if (insertionIndex <= 0 && objects.length > 0) {
      // Insert before first object
      x = objects[0].left ?? 0;
    } else if (objects.length === 0) {
      // No objects
      x = autoLayout.left ?? 0;
    } else if (insertionIndex >= objects.length) {
      // Insert after last object
      const lastObj = objects[objects.length - 1];
      x = (lastObj.left ?? 0) + (lastObj.width ?? 0);
    } else {
      // Between leftObj & rightObj
      const leftObj = objects[insertionIndex - 1];
      const rightObj = objects[insertionIndex];
      x =
        ((leftObj.left ?? 0) + (leftObj.width ?? 0) + (rightObj.left ?? 0)) / 2;
    }

    const matrix = autoLayout.calcTransformMatrix();
    const pt = new fabric.Point(x, 0).transform(matrix);
    return { lineX: pt.x, lineY: pt.y, orientation: 'vertical' };
  };

  private buildColumnPreview(
    autoLayout: AutoLayout,
    insertionIndex: number
  ): { lineX: number; lineY: number; orientation: 'horizontal' } {
    const objects = autoLayout.getObjects();
    let lineY = 0;

    if (insertionIndex < objects.length) {
      const obj = objects[insertionIndex];
      lineY = (obj.top ?? 0) + (obj.height ?? 0) / 2;
    } else if (objects.length > 0) {
      const last = objects[objects.length - 1];
      lineY = (last.top ?? 0) + (last.height ?? 0) / 2;
    }

    const matrix = autoLayout.calcTransformMatrix();
    const pt = new fabric.Point(0, lineY).transform(matrix);
    return { lineX: pt.x, lineY: pt.y, orientation: 'horizontal' };
  }

  private buildWrapPreview(
    autoLayout: AutoLayout,
    insertionIndex: number
  ): { lineX: number; lineY: number; orientation: 'vertical' } {
    const objects = autoLayout.getObjects();
    if (objects.length === 0) {
      return { lineX: 0, lineY: 0, orientation: 'vertical' };
    }

    // Identify lines (same logic as findInsertionIndexWrap)
    const lines: FabricObject[][] = [];
    let currentLine: FabricObject[] = [];

    objects.forEach((obj) => {
      if (currentLine.length === 0) {
        currentLine.push(obj);
      } else {
        const prevObj = currentLine[currentLine.length - 1];
        if ((obj.left ?? 0) < (prevObj.left ?? 0)) {
          lines.push(currentLine);
          currentLine = [obj];
        } else {
          currentLine.push(obj);
        }
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Determine which line the insertionIndex belongs to
    let lineIndex = 0;
    let acc = 0;
    for (let li = 0; li < lines.length; li++) {
      const sz = lines[li].length;
      if (insertionIndex < acc + sz) {
        lineIndex = li;
        break;
      }
      acc += sz;
    }

    const line = lines[lineIndex];
    const localIndex = insertionIndex - acc;
    let lineX = 0;

    if (localIndex < line.length) {
      const obj = line[localIndex];
      lineX = (obj.left ?? 0) + (obj.width ?? 0) / 2;
    } else {
      const last = line[line.length - 1];
      lineX = (last.left ?? 0) + (last.width ?? 0) / 2;
    }

    const matrix = autoLayout.calcTransformMatrix();
    const pt = new fabric.Point(lineX, 0).transform(matrix);
    return { lineX: pt.x, lineY: pt.y, orientation: 'vertical' };
  }

  /**
   * Master insertion index logic, factoring in row/col/wrap differences.
   */
  findInsertionIndex = (
    autoLayout: AutoLayout,
    mouseX: number,
    mouseY: number
  ): number => {
    const objects = autoLayout.getObjects();
    const strategy = this.strategy as AutoLayoutStrategy;
    const direction = strategy.layoutDirection;

    const invMatrix = fabric.util.invertTransform(
      autoLayout.calcTransformMatrix()
    );
    const localMouse = fabric.util.transformPoint(
      new fabric.Point(mouseX, mouseY),
      invMatrix
    );

    switch (direction) {
      case LAYOUT_DIRECTIONS.ROW:
        return this.findInsertionIndexRow(objects, localMouse);
      case LAYOUT_DIRECTIONS.COLUMN:
        return this.findInsertionIndexColumn(objects, localMouse);
      case LAYOUT_DIRECTIONS.WRAP:
        return this.findInsertionIndexWrap(objects, localMouse);
      default:
        return objects.length;
    }
  };

  /**
   * Row insertion index with "locked index" hysteresis logic.
   */
  private findInsertionIndexRow = (
    objects: fabric.Object[],
    localMouse: fabric.Point
  ): number => {
    let candidateIndex = objects.length;

    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      const canvasZoom = obj.canvas?.getZoom() ?? 1;
      if (obj.isMoving) continue;

      const normalizedObjLeft = (obj.left ?? 0) / canvasZoom;
      const normalizedObjWidth = (obj.width ?? 0) / canvasZoom;
      const centerX = normalizedObjLeft + normalizedObjWidth / 2;
      const distance = localMouse.x / canvasZoom - centerX;

      if (distance < -this.immediateTolerance) {
        candidateIndex = i;
        break;
      } else if (Math.abs(distance) <= this.immediateTolerance) {
        candidateIndex = i;
        break;
      }
    }

    if (this.lockedIndex === null) {
      this.lockedIndex = candidateIndex;
      return this.lockedIndex;
    }

    if (candidateIndex === this.lockedIndex) {
      return this.lockedIndex;
    }

    if (this.lockedIndex < objects.length) {
      const lockedObj = objects[this.lockedIndex];
      const zoom = lockedObj.canvas?.getZoom() ?? 1;
      const lockedObjLeft = (lockedObj.left ?? 0) / zoom;
      const lockedObjWidth = (lockedObj.width ?? 0) / zoom;
      const lockedCenter = lockedObjLeft + lockedObjWidth / 2;
      const lockedDistance = Math.abs(localMouse.x / zoom - lockedCenter);

      if (lockedDistance < this.hysteresisRange) {
        return this.lockedIndex;
      }
    }

    this.lockedIndex = candidateIndex;
    return this.lockedIndex;
  };

  /**
   * Column insertion index logic.
   */
  private findInsertionIndexColumn = (
    objects: FabricObject[],
    localMouse: fabric.Point
  ): number => {
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (localMouse.y < (obj.top ?? 0) + (obj.height ?? 0) / 2) {
        return i;
      }
    }
    return objects.length;
  };

  /**
   * Wrap insertion index logic (multi-line row).
   */
  private findInsertionIndexWrap = (
    objects: FabricObject[],
    localMouse: fabric.Point
  ): number => {
    const lines: FabricObject[][] = [];
    let currentLine: FabricObject[] = [];

    // Identify lines based on left < previous.left => new line
    objects.forEach((obj) => {
      if (currentLine.length === 0) {
        currentLine.push(obj);
      } else {
        const prevObj = currentLine[currentLine.length - 1];
        if ((obj.left ?? 0) < (prevObj.left ?? 0)) {
          lines.push(currentLine);
          currentLine = [obj];
        } else {
          currentLine.push(obj);
        }
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Figure out which line mouse is on
    for (let lineIndex = 0, accum = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineMaxHeight = Math.max(...line.map((o) => o.height ?? 0));
      const lineBottom = (line[0].top ?? 0) + lineMaxHeight;

      if (localMouse.y < lineBottom) {
        return this.calculateInsertionInLine(
          line,
          localMouse,
          lines,
          lineIndex,
          accum
        );
      }
      accum += line.length;
    }

    // If beyond last line
    return objects.length;
  };

  /**
   * Insert in a specific line (row-like logic).
   */
  private calculateInsertionInLine(
    line: FabricObject[],
    localMouse: fabric.Point,
    allLines: FabricObject[][],
    lineIndex: number,
    accum: number
  ): number {
    for (let i = 0; i < line.length; i++) {
      const obj = line[i];
      const objCenterX = (obj.left ?? 0) + (obj.width ?? 0) / 2;
      if (localMouse.x < objCenterX) {
        return accum + i;
      }
    }
    return accum + line.length;
  }

  /**
   * Convert lineIndex and position in line to index in the entire objects array.
   */
  private indexInAllObjects(
    allLines: FabricObject[][],
    lineIndex: number,
    posInLine: number
  ): number {
    let index = 0;
    for (let l = 0; l < lineIndex; l++) {
      index += allLines[l].length;
    }
    return index + posInLine;
  }
}

classRegistry.setClass(AutoLayoutManager, 'AutoLayoutManager');
