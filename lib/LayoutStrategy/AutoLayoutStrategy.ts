// LayoutStrategies/FlexboxLayoutStrategy.js
import * as fabric from 'fabric';
import {
  LayoutStrategy,
  Point,
  classRegistry,
  StrictLayoutContext,
  FabricObject,
  InitializationLayoutContext,
  LayoutStrategyResult,
} from 'fabric';

import {
  ALIGNMENT_POSITIONS,
  LAYOUT_DIRECTIONS,
} from '@/lib//LayoutStrategyConstant';
import {
  LAYOUT_TYPE_ADDED,
  LAYOUT_TYPE_IMPERATIVE,
  LAYOUT_TYPE_INITIALIZATION,
  LAYOUT_TYPE_OBJECT_MODIFYING,
} from './FrameLayoutManager';
import { LAYOUT_TYPE_OBJECT_MODIFIED } from './container';

/**
 * Interface for the options passed to AutoLayoutStrategy
 */
interface AutoLayoutOptions {
  layoutDirection?: (typeof LAYOUT_DIRECTIONS)[keyof typeof LAYOUT_DIRECTIONS];
  //   justifyContent?: (typeof JUSTIFY_CONTENT)[keyof typeof JUSTIFY_CONTENT];
  //   alignItems?: (typeof ALIGN_ITEMS)[keyof typeof ALIGN_ITEMS];
  spacingType?: (typeof SPACING_TYPE)[keyof typeof SPACING_TYPE];
  horizontalGap?: number;
  verticalGap?: number;
  padding?: number;
}

/**
 * Interface for the layout result returned by AutoLayoutStrategy
 */
interface LayoutResult {
  center: Point;
  size: Point;
  // 'objects' is intentionally omitted for now
}

/**
 * Defines the configuration for the AutoLayoutManager:
 * - alignment: One of the nine positions like Figma's alignment system.
 * - layoutDirection: 'row' or 'column' direction of layout.
 * - spacingType: 'auto' or 'manual' spacing distribution.
 * - padding: Numeric padding on all sides of the layout.
 * - gap: Gap between items if spacingType is 'manual', or baseline gap if 'auto'.
 * - heightType: 'hug' or 'fixed' height behavior.
 * - fixedHeight: Used if heightType = 'fixed'.
 */
export class AutoLayoutStrategy extends LayoutStrategy {
  alignment: string;
  layoutDirection: 'row' | 'column' | 'wrap' | undefined;
  spacingType: 'auto' | 'manual';
  //padding: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  horizontalGap: number;
  verticalGap: number;
  heightType: 'hug' | 'fixed';
  fixedHeight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;

  /**
   * @param {object} options - Strategy configuration options.
   * @param {string} [options.alignment=ALIGNMENT_POSITIONS.TOP_LEFT] - One of the ALIGNMENT_POSITIONS (e.g. top-left, middle-center, etc.).
   * @param {('row'|'column')} [options.layoutDirection='row'] - Layout direction.
   * @param {('auto'|'manual')} [options.spacingType='auto'] - Spacing distribution type.
   * @param {number} [options.paddingLeft=0] - Padding Left for the layout.
   * @param {number} [options.paddingRight=0] - Padding Right for the layout.
   * @param {number} [options.paddingTop=0] - Padding Top for the layout.
   * @param {number} [options.paddingBottom=0] - Padding Bottom for the layout.
   * @param {number} [options.horizontalGap=0] - Gap between items (if 'manual', used as-is; if 'auto', a baseline for auto calculations).
   * @param {number} [options.verticalGap=0] - Gap between items (if 'manual', used as-is; if 'auto', a baseline for auto calculations).
   * @param {('hug'|'fixed')} [options.heightType='hug'] - Hug or fixed height behavior.
   * @param {number} [options.fixedHeight] - Fixed height value, used if heightType='fixed'.
   * @param {number} [options.paddingHorizontal] - Horizontal padding, overrides 'padding' if specified.
   * @param {number} [options.paddingVertical] - Vertical padding, overrides 'padding' if specified.
   */
  constructor(
    options: {
      alignment?: string;
      layoutDirection?: 'row' | 'column' | 'wrap' | undefined;
      spacingType?: 'auto' | 'manual';
      paddingLeft?: number;
      paddingRight?: number;
      paddingTop?: number;
      paddingBottom?: number;
      horizontalGap?: number;
      verticalGap?: number;
      heightType?: 'hug' | 'fixed';
      fixedHeight?: number;
      paddingHorizontal?: number;
      paddingVertical?: number;
    } = {}
  ) {
    super();
    this.alignment = options.alignment ?? ALIGNMENT_POSITIONS.TOP_LEFT;
    this.layoutDirection = options.layoutDirection;
    this.spacingType = options.spacingType ?? 'auto';
    this.paddingLeft = options.paddingLeft ?? options.paddingHorizontal ?? 0;
    this.paddingRight = options.paddingRight ?? options.paddingHorizontal ?? 0;
    this.paddingTop = options.paddingTop ?? options.paddingVertical ?? 0;
    this.paddingBottom = options.paddingBottom ?? options.paddingVertical ?? 0;
    this.horizontalGap = options.horizontalGap ?? 0;
    this.verticalGap = options.verticalGap ?? 0;
    this.heightType = options.heightType ?? 'hug';
    this.fixedHeight = options.fixedHeight;
    // this.paddingHorizontal = options.paddingHorizontal;
    // this.paddingVertical = options.paddingVertical;
  }

  /**
   * Implement the required method of LayoutStrategy, if any.
   * This method calculates the layout result for the given target and context.
   * The actual calculations may be done inside AutoLayoutManager, so this can be minimal.
   */

  shouldPerformLayout({ type, prevStrategy, strategy }: StrictLayoutContext) {
    //console.log('shouldPerformLayout', type);
    return (
      type === LAYOUT_TYPE_INITIALIZATION ||
      type === LAYOUT_TYPE_IMPERATIVE ||
      //type === LAYOUT_TYPE_OBJECT_MODIFIED ||
      // type === LAYOUT_TYPE_OBJECT_MODIFYING ||
      (!!prevStrategy && strategy !== prevStrategy)
    );
  }

  getInitialSize(
    { target }: StrictLayoutContext & InitializationLayoutContext,
    { size }: Pick<LayoutStrategyResult, 'center' | 'size'>
  ): Point {
    //return new Point(target.width || size.x, target.height || size.y);
    return new Point(200, 200);
  }

  /**
   * Calculate the layout result for Flexbox.
   * Returns only center and size, excluding objects.
   * @param {StrictLayoutContext} context
   * @param {FabricObject[]} objects
   * @returns {LayoutResult | undefined}
   */
  public calcLayoutResult(
    context: StrictLayoutContext,
    objects: FabricObject[]
  ): LayoutResult | undefined {
    const { target } = context;
    if (target.parent && target.parent.type === 'frame') {
      console.log(
        'target parent strategy',
        target.parent.layoutManager.strategy
      );
    }
    //console.log('calcLayoutResult', context, objects);
    if (this.shouldPerformLayout(context)) {
      return this.calcBoundingBox(objects, context);
    }
  }

  calcBoundingBox(
    objects: FabricObject[],
    context: StrictLayoutContext
  ): LayoutStrategyResult | undefined {
    if (objects.length === 0) return undefined;

    const { width, height } = context.target;
    //const gap = this.gap;
    return {
      // in `initialization` we do not account for target's transformation matrix
      center: context.target.getCenterPoint(),
      size: new Point(width, height),
    };
    // const { width, height } = context.target;
    // const padding = this.padding;
    // const gap = this.gap;

    // const isRow = this.layoutDirection === LAYOUT_DIRECTIONS.ROW;
    // const mainAxis = isRow ? 'x' : 'y';
    // const crossAxis = isRow ? 'y' : 'x';
    // const mainSize = isRow ? width : height;
    // const crossSize = isRow ? height : width;

    // // Calculate total size of items along the main axis
    // let totalMainSize = objects.reduce((sum, obj) => {
    //   return sum + (isRow ? obj.width! : obj.height!);
    // }, 0);

    // // Add gaps between items
    // totalMainSize += gap * (objects.length - 1);

    // // Available space for positioning
    // const availableSpace = mainSize - 2 * padding - totalMainSize;

    // // Calculate starting point based on justifyContent
    // let startOffset = padding;
    // let dynamicGap = gap; // To handle dynamic gaps for space-between, etc.

    // switch (this.justifyContent) {
    //   case JUSTIFY_CONTENT.FLEX_START:
    //     startOffset = padding;
    //     break;
    //   case JUSTIFY_CONTENT.FLEX_END:
    //     startOffset = padding + availableSpace;
    //     break;
    //   case JUSTIFY_CONTENT.CENTER:
    //     startOffset = padding + availableSpace / 2;
    //     break;
    //   case JUSTIFY_CONTENT.SPACE_BETWEEN:
    //     dynamicGap =
    //       objects.length > 1 ? availableSpace / (objects.length - 1) : gap;
    //     startOffset = padding;
    //     break;
    //   case JUSTIFY_CONTENT.SPACE_AROUND:
    //     dynamicGap = objects.length > 0 ? availableSpace / objects.length : gap;
    //     startOffset = padding + dynamicGap / 2;
    //     break;
    //   case JUSTIFY_CONTENT.SPACE_EVENLY:
    //     dynamicGap =
    //       objects.length > 0 ? availableSpace / (objects.length + 1) : gap;
    //     startOffset = padding + dynamicGap;
    //     break;
    //   default:
    //     startOffset = padding;
    // }

    // // Calculate the bounding box size
    // const layoutWidth =
    //   this.layoutDirection === LAYOUT_DIRECTIONS.ROW
    //     ? totalMainSize + 2 * padding
    //     : width;
    // const layoutHeight =
    //   this.layoutDirection === LAYOUT_DIRECTIONS.ROW
    //     ? height
    //     : totalMainSize + 2 * padding;

    // return {
    //   center: new Point(width / 2, height / 2),
    //   size: new Point(layoutWidth, layoutHeight),
    //   // 'objects' is intentionally omitted for now
    // };
  }
  /**
   * Determines if the clip path should be laid out.
   * @param {StrictLayoutContext} context
   * @returns {boolean}
   */
  public shouldLayoutClipPath(context: StrictLayoutContext): boolean {
    return false;
  }

  /**
   * Serialize the strategy's state.
   * @returns {Object}
   */
  //   public toObject(): object {
  //     return {
  //       type: AutoLayoutStrategy.type,
  //       options: {
  //         layoutDirection: this.layoutDirection,
  //         justifyContent: this.justifyContent,
  //         alignItems: this.alignItems,
  //         gap: this.gap,
  //         padding: this.padding,
  //       },
  //     };
  //   }

  //   public toJSON(): object {
  //     return this.toObject();
  //   }
}

// Register the class with classRegistry for serialization/deserialization
classRegistry.setClass(AutoLayoutStrategy, AutoLayoutStrategy.type);
