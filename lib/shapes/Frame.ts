import * as fabric from 'fabric';
import { classRegistry } from 'fabric';
import { v4 as uuid4 } from 'uuid';
import { GroupProps } from 'fabric';
import { TClassProperties } from 'fabric';
import { MultiSelectionStacking } from 'fabric';
import { FixedLayout } from 'fabric';
import { FrameLayoutStrategy } from '@/lib/LayoutStrategy/FrameLayoutStrategy';
import { throttle } from '@/lib/utils';
import { LayoutManager } from 'fabric';

import { cursors } from '@/lib/canvas-cursor';
class NoopLayoutManager extends LayoutManager {
  performLayout() {}
}

export interface FrameOptions extends GroupProps {
  multiSelectionStacking: MultiSelectionStacking;
}

const frameDefaultValues: Partial<TClassProperties<Frame>> = {
  multiSelectionStacking: 'canvas-stacking',
};

export interface FrameEvents extends fabric.GroupEvents {
  'object:modified': fabric.ObjectModificationEvents;
}

export class Frame extends fabric.Group {
  static type: string = 'frame';
  declare objectId: string;
  declare frameLabel: fabric.IText;
  declare applyTransformationsToObjects: VoidFunction;
  static ownDefaults: Record<string, any> = frameDefaultValues;
  static getDefaults(): Record<string, any> {
    return { ...super.getDefaults(), ...Frame.ownDefaults };
  }

  declare initialized: boolean;
  declare frameLabel: fabric.FabricObject;
  declare frameBackground: fabric.FabricObject;

  constructor(objects: fabric.Object[], options: any, alreadyInitiazed: false) {
    super([], {
      ...options,
      noScaleCache: true,
      objectCaching: false,
      backgroundColor: 'white',
      flipX: false,
      flipY: false,
      originX: 'left',
      originY: 'top',
    });

    console.log('setting frame options : ................. ', options);

    this.setOptions({
      ...options,
      width: options.width || 300,
      height: options.height || 200,
      strokeWidth: 1,
      left: options.left,
      top: options.top,
      subTargetCheck: true,
      interactive: true,
      objectCaching: false,
      lockUniScaling: true,
      flipX: false,
      flipY: false,
      originX: 'left',
      originY: 'top',
      hoverCursor: cursors.selection_cursor,
    });

    this.transformDone = false;
    this.objectId = this.objectId || uuid4();
    this.groupInit(objects, {
      left: options.left,
      top: options.top,
      layoutManager: new LayoutManager(new FrameLayoutStrategy()),
    });

    this.frameLabel = new fabric.IText(this.frameLabel?.text || 'Frame 1', {
      category: 'label',
      fontSize: 11,
      fontFamily: 'Inter, sans-serif',
      fill: 'black',
      fontWeight: 400,
      left: options.left + 2,
      top: options.top - 20,
      selectable: true,
      lockUniScaling: true,
      evented: true,
      hasControls: false,
      objectId: uuid4(),
      padding: 2,
      hoverCursor: cursors.selection_cursor,
      excludeFromAlignment: true,
    });

    this.frameLabel.parentFrame = this;
    const frame = this;
    this.frameLabel.on('mousedown', function () {
      console.log('Frame label clicked : ', frame);
      this.initialTransformMatrix = this.calcTransformMatrix();
    });
    this.frameLabel.on('mouseup', function () {
      console.log('Frame label clicked : ', frame);
      frame.setOptions({ evented: true, hasControls: true, selectable: true });
      frame.canvas?.setActiveObject(frame);
    });
    this.frameLabel.on('mousedblclick', function ({ e }) {
      console.log('Frame label double clicked : ', frame);
      e.stopPropagation();
      console.log('Frame label double-clicked:', frame.frameLabel);
      frame.frameLabel.enterEditing();
      frame.frameLabel.hiddenTextarea?.focus();
      frame.canvas?.setActiveObject(frame.frameLabel);
    });
    this.frameLabel.on('moving', function () {
      const lablematrix = this.calcTransformMatrix();
      const { translateX, translateY, scaleX, scaleY, ...otherOptions } =
          fabric.util.qrDecompose(lablematrix),
        center = new fabric.Point(
          translateX - this.width / 2,
          translateY - this.height / 2 + 20
        );
      frame.flipX = false;
      frame.flipY = false;
      Object.assign(frame, otherOptions);
      frame.setPositionByOrigin(center, 'left', 'top');
      frame.setCoords();
      frame.canvas?.requestRenderAll();
    });
    this.on('moving', () => {
      if (!this.frameLabel) return;
      const labelPosition = new fabric.Point(this.left, this.top - 20);
      this.frameLabel.set({ left: labelPosition.x, top: labelPosition.y });
      this.frameLabel.setCoords();
      this.canvas?.requestRenderAll();
    });
    this.on('rotating', () => {
      if (!this.frameLabel) return;
      const labelPosition = fabric.util.transformPoint(
        new fabric.Point(-this.width / 2, -this.height / 2 - 20),
        this.calcTransformMatrix()
      );
      this.frameLabel.set({
        left: labelPosition.x,
        top: labelPosition.y,
        angle: this.angle,
      });
      this.frameLabel.setCoords();
      this.canvas?.requestRenderAll();
    });
    this.on('resizing', () => {
      if (!this.frameLabel) return;
      const labelPosition = new fabric.Point(this.left, this.top - 20);
      this.frameLabel.set({ left: labelPosition.x, top: labelPosition.y });
      this.frameLabel.setCoords();
      this.canvas?.requestRenderAll();
    });
    this.applyTransformationsToObjects = throttle(
      this._applyTransformationsToObjects.bind(this),
      50
    );
    this.on('mousedown', () => {
      const parentTL = this.getPointByOrigin('left', 'top');
      const parentCenter = this.getRelativeCenterPoint();
      const offset = parentTL.subtract(parentCenter);
      this._objects.forEach((obj) => {
        const objectTL = obj.getPointByOrigin('left', 'top');
        const rotatedPoint = objectTL.rotate(
          fabric.util.degreesToRadians(this.angle)
        );
        obj.initialState = {
          relativeCenterPoint: rotatedPoint.subtract(offset),
        };
        console.log('Offset : ', obj.initialState.relativeCenterPoint);
      });
    });
    this.on('modified', () => {
      console.log('Frame modified someone modified me');
    });
    this.on('resizing', () => {
      const parentTL = this.getPointByOrigin('left', 'top');
      const offset = new fabric.Point(parentTL).subtract(
        this.getRelativeCenterPoint()
      );
      this.forEachObject((obj) => {
        const newPosition = offset
          .add(obj.initialState.relativeCenterPoint)
          .rotate(fabric.util.degreesToRadians(-this.angle));
        console.log('new POS : ', newPosition);
        obj.setPositionByOrigin(newPosition, 'left', 'top');
        obj.setCoords();
      });
    });
    this.on('mouseup', function () {});
  }
  __objectSelectionMonitor() {}
  clampPrecision(value, precision = 10) {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }
  _applyTransformationsToObjects() {
    if (!this.initialTransformMatrix) {
      console.error('Initial state not set. Did you call onFrameMouseDown?');
      return;
    }
    const currentTransformMatrix = this.calcTransformMatrix();
    const tl = this.getPointByOrigin('left', 'top');
    const point = new fabric.Point(tl.x, tl.y).transform(this.trans);
    const relativeTransformMatrix = fabric.util.multiplyTransformMatrices(
      fabric.util.invertTransform(this.initialTransformMatrix),
      currentTransformMatrix
    );
    const inverseRelativeTransformMatrix = fabric.util.invertTransform(
      relativeTransformMatrix
    );
    const { scaleX: currentScaleX, scaleY: currentScaleY } =
      fabric.util.qrDecompose(currentTransformMatrix);
    const scaleXRatio = this.clampPrecision(currentScaleX / this.initialScaleX);
    const scaleYRatio = this.clampPrecision(currentScaleY / this.initialScaleY);
    const currentFrameL = this.clampPrecision(this.getX());
    const deltaLeft = this.clampPrecision(currentFrameL - this.initialFrameL);
    let dx = 0,
      dy = 0;
    if (
      (currentTransformMatrix[3] - this.initialTransformMatrix[3] >= 0 &&
        currentTransformMatrix[5] - this.initialTransformMatrix[5] <= 0) ||
      (currentTransformMatrix[3] - this.initialTransformMatrix[3] <= 0 &&
        currentTransformMatrix[5] - this.initialTransformMatrix[5] >= 0)
    )
      dy = 2 * inverseRelativeTransformMatrix[5];
    if (
      (currentTransformMatrix[0] - this.initialTransformMatrix[0] > 0 &&
        currentTransformMatrix[4] - this.initialTransformMatrix[4] < 0) ||
      (currentTransformMatrix[0] - this.initialTransformMatrix[0] < 0 &&
        currentTransformMatrix[4] - this.initialTransformMatrix[4] > 0)
    )
      dx = 2 * inverseRelativeTransformMatrix[4];
    else if (deltaLeft !== 0)
      dx =
        (-2 / currentScaleX) *
        (currentTransformMatrix[4] - this.initialTransformMatrix[4]);
    this._objects.forEach((obj) => {
      const objCorner = new fabric.Point(
        obj.initialState.left,
        obj.initialState.top
      );
      const newObjCorner = fabric.util.transformPoint(
        objCorner,
        inverseRelativeTransformMatrix
      );
      const point = this.getPointByOrigin('left', 'top');
      const constraint = this.translateToOriginPoint(point, 'left', 'top');
      console.log('constraint : ', constraint);
      obj.setCoords();
    });
    this.setCoords();
  }
  dispose() {
    super.dispose();
  }
  __serializeObjects(
    method: 'toObject' | 'toDatalessObject' = 'toObject',
    propertiesToInclude: string[] = []
  ) {
    return this._objects.map((obj) => {
      return obj[method](['excludeFromAlignment', ...propertiesToInclude]);
    });
  }
  toObject(propertiesToInclude: string[] = []): Record<string, any> {
    const obj = {
      ...super.toObject([
        'subTargetCheck',
        'interactive',
        'frameLabel',
        ...propertiesToInclude,
      ]),
      layoutManager: this.layoutManager.toObject(),
      objects: this.__serializeObjects('toObject', propertiesToInclude),
    };
    return obj;
  }
  dispose() {
    super.dispose();
  }
  static fromObject<T extends TOptions<SerializedGroupProps>>(
    { type, objects = [], layoutManager, ...options }: T,
    abortable?: Abortable
  ) {
    console.log('frame from objects : ', objects);
    return fabric.util
      .enlivenObjects(objects, abortable)
      .then((restoredFrameObjects) => {
        const frame = new this(
          restoredFrameObjects,
          { ...options, layoutManager: new NoopLayoutManager() },
          true
        );
        if (layoutManager) {
          const layoutClass = classRegistry.getClass<typeof LayoutManager>(
            layoutManager.type
          );
          const strategyClass = classRegistry.getClass<typeof FixedLayout>(
            layoutManager.strategy
          );
          frame.layoutManager = new layoutClass(new strategyClass());
        } else {
          frame.layoutManager = new LayoutManager();
        }
        frame.layoutManager.subscribeTargets({
          type: 'initialization',
          target: frame,
          targets: frame.getObjects(),
        });
        frame.layoutManager = new LayoutManager(new FixedLayout());
        frame.setCoords();
        console.log('from object ---------------------------, ', frame);
        return frame;
      });
  }
}
classRegistry.setClass(Frame, 'frame');
classRegistry.setSVGClass(Frame, 'frame');
