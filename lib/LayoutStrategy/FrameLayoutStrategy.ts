import * as fabric from 'fabric';
import {
  LayoutStrategy,
  FabricObject,
  LayoutStrategyResult,
  StrictLayoutContext,
  Point,
} from 'fabric';

export class FrameLayoutStrategy extends LayoutStrategy {
  static type = 'frameLayoutStrategy';

  getInitialSize(
    context: StrictLayoutContext & fabric.InitializationLayoutContext,
    result: Pick<LayoutStrategyResult, 'center' | 'size'>
  ): Point {
    // return new Point(
    //   context.target.width || result.size.x,
    //   context.target.height || result.size.y
    // );
    return super.getInitialSize(context, result);
  }

  public calcLayoutResult(
    context: StrictLayoutContext,
    objects: FabricObject[]
  ): LayoutResult | undefined {
    if (objects.length === 0) return undefined;

    const { width, height } = context.target;
    return {
      // in `initialization` we do not account for target's transformation matrix
      center: context.target.getRelativeCenterPoint(),
      size: new Point(width, height),
    };
  }
}

fabric.classRegistry.setClass(FrameLayoutStrategy, 'frameLayoutStrategy');