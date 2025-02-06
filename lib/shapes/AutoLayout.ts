import * as fabric from 'fabric';
import { classRegistry } from 'fabric';
import { v4 as uuid4 } from 'uuid';
import { GroupProps } from 'fabric';
import { TClassProperties } from 'fabric';
import { MultiSelectionStacking } from 'fabric';
import { throttle } from '@/lib/utils';
import {
  FrameLayoutManager,
  LAYOUT_TYPE_ADDED,
  LAYOUT_TYPE_IMPERATIVE,
  LAYOUT_TYPE_OBJECT_MODIFIED,
} from '@/lib/LayoutManager/LayoutConstant';
import { cursors } from '@/lib/canvas-cursor';
import { AutoLayoutManager } from '@/lib/LayoutManager/AutoLayoutManager';
import { AutoLayoutStrategy } from '@/lib/LayoutStrategy/AutoLayoutStrategy';
import { autoLayoutControls } from '@/lib/controls/autolayout/autolayoutcontrols';

const multiply = fabric.util.multiplyTransformMatrices;
const invert = fabric.util.invertTransform;

class NoopLayoutManager extends AutoLayoutManager {
  performLayout() {}
}

export interface AutoLayoutOptions extends GroupProps {
  multiSelectionStacking: MultiSelectionStacking;
}

const frameDefaultValues: Partial<TClassProperties<AutoLayout>> = {
  multiSelectionStacking: 'canvas-stacking',
};

export interface AutoLayoutEvents extends fabric.GroupEvents {
  'object:modified': fabric.ObjectModificationEvents;
}

export class AutoLayout extends fabric.Group {
  static type: string = 'autolayout';

  declare objectId: string;

  declare objectAdding: boolean;

  declare objectAdded: boolean;

  declare allowedObjects: fabric.Object[];

  declare transformDone: boolean;

  declare layoutLabel: fabric.IText;

  declare applyTransformationsToObjects: VoidFunction;

  declare layoutStrategy: AutoLayoutStrategy;

  declare previewLine: any;

  declare isResizing: boolean;

  //static ownDefaults: Record<string, any> = frameDefaultValues;

  //   static getDefaults(): Record<string, any> {
  //     return { ...super.getDefaults(), ...Frame.ownDefaults };
  //   }

  declare initialized: boolean;
  declare layoutBackground: fabric.FabricObject;

  constructor(
    objects: fabric.Object[],
    options: any,
    alreadyInitiazed: false,
    layoutStrategy?: AutoLayoutStrategy
  ) {
    super([], {
      ...options,
      noScaleCache: true,
      objectCaching: false,
      flipX: false,
      flipY: false,
      originX: 'left',
      originY: 'top',
    });

    this.layoutStrategy = layoutStrategy || new AutoLayoutStrategy();
    //console.log('setting frame options : ................. ', options);

    this.setOptions({
      ...options,
      width: options.width || 300,
      height: options.height || 200,
      strokeWidth: 1,
      left: options.left,
      top: options.top,
      subTargetCheck: true,
      backgroundColor: 'rgba(255,255,255,1)',
      interactive: true,
      objectCaching: false,
      lockUniScaling: true,
      flipX: false,
      flipY: false,
      originX: 'left',
      originY: 'top',
      hoverCursor: cursors.selection_cursor,
      perPixelTargetFind: false,
    });

    this.transformDone = false;
    this.isResizing = false;
    this.objectId = this.objectId || uuid4();
    this.groupInit(objects, {
      left: options.left,
      top: options.top,
      layoutManager: new AutoLayoutManager(this.layoutStrategy),
    });
    //this._objects = [...objects];

    if (!this.layoutLabel) {
      this.layoutLabel = new fabric.IText('Frame 1', {
        category: 'label',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fill: 'blue',
        fontWeight: 400,
        left: options.left + 2,
        top: options.top - 20,
        selectable: true, // Allow selection for editing
        lockUniScaling: true,
        evented: true,
        hasControls: false,
        objectId: uuid4(),
        padding: 2,
        hoverCursor: cursors.selection_cursor,
        excludeFromAlignment: true,
        //visible: !this.parent,
        parentLayout: this,
      });
      //this.layoutLabel.parentLayout = this;
    }

    const layout = this;
    this.layoutLabel.on('mousedown', function () {
      console.log('Frame label clicked : ', layout);
      this.initialTransformMatrix = this.calcTransformMatrix();
    });

    this.objectAdding = false;
    this.objectAdded = false;
    this.layoutLabel.on('mouseup', function () {
      //console.log('Frame label clicked : ', frame);
      //frame.layoutLabel.setCoords();
      layout.setOptions({
        evented: true,
        hasControls: true,
        selectable: true,
      });

      layout.canvas?.setActiveObject(layout);
      layout.canvas?.fire('selection:created', { selected: layout });
    });

    this.layoutLabel.on('mousedblclick', function ({ e }) {
      console.log('Frame label double clicked : ', layout);
      e.stopPropagation(); // Prevent the event from bubbling up to the frame

      console.log('Frame label double-clicked:', layout.layoutLabel);

      // Enter editing mode
      layout.layoutLabel.enterEditing();
      layout.layoutLabel.hiddenTextarea?.focus();

      // Ensure the layoutLabel remains the active object
      layout.canvas?.setActiveObject(layout.layoutLabel);
    });

    this.layoutLabel.on('moving', function () {
      const lablematrix = this.calcTransformMatrix(); // Parent frame's transformation matrix
      const { translateX, translateY, scaleX, scaleY, ...otherOptions } =
          fabric.util.qrDecompose(lablematrix),
        center = new fabric.Point(
          translateX - this.width / 2,
          translateY - this.height / 2 + 20
        );
      layout.flipX = false;
      layout.flipY = false;
      Object.assign(layout, otherOptions);
      layout.set({ scaleX, scaleY });
      layout.setPositionByOrigin(center, 'left', 'top');
      layout.setCoords();
      layout.canvas?.requestRenderAll();
    });

    this.on('moving', () => {
      if (!this.layoutLabel) return;

      // Calculate the new position for the label
      const labelPosition = new fabric.Point(this.left, this.top - 20);
      this.layoutLabel.set({
        left: labelPosition.x,
        top: labelPosition.y,
      });
      this.layoutLabel.setCoords();
      this.canvas?.requestRenderAll();
    });

    this.on('rotating', () => {
      if (!this.layoutLabel) return;

      const labelPosition = fabric.util.transformPoint(
        new fabric.Point(-this.width / 2, -this.height / 2 - 20), // Relative label position
        this.calcTransformMatrix() // Frame's transformation matrix
      );

      this.layoutLabel.set({
        left: labelPosition.x,
        top: labelPosition.y,
        angle: this.angle, // Match the frame's rotation
      });
      this.layoutLabel.setCoords();
      this.canvas?.requestRenderAll();
    });

    this.on('scaling', () => {
      if (!this.layoutLabel) return;

      // Calculate the scaled position for the label
      const labelPosition = new fabric.Point(this.left, this.top - 20);
      this.layoutLabel.set({
        left: labelPosition.x,
        top: labelPosition.y,
        //scaleX: this.scaleX, // Match the frame's scale
        //scaleY: this.scaleY,
      });
      this.layoutLabel.setCoords();
      this.canvas?.requestRenderAll();
    });

    this.applyTransformationsToObjects = throttle(
      this._applyTransformationsToObjects.bind(this),
      50 // Throttle limit in milliseconds
    );

    this.on('resizing', () => {
      console.log('scalling Frame');
      //this._applyTransformationsToObjects();
      this.isResizing = true;
      this.layoutManager.performLayout({
        type: LAYOUT_TYPE_IMPERATIVE,
        target: this,
        targets: this.getObjects(),
      });
    });

    // this.on('mousemove', () => {
    //   console.log('Frame modified : ');
    //   // this.layoutManager.performLayout({
    //   //   type: LAYOUT_TYPE_OBJECT_MODIFIED,
    //   //   target: this,
    //   //   targets: this.getObjects(),
    //   // });
    // });

    this.on('mouseup', () => {
      // delete this.prevTransformMatrix;
      // delete this.prevFrameTL;
      // delete this.prevScaleX;
      // delete this.prevScaleY;
      console.log('Frame mouse up : ');
      this.isResizing = false;
      if (this.objectAdded) {
        console.log('Frame object added : ');
        this.objectAdded = false;
        this.layoutManager.performLayout({
          type: LAYOUT_TYPE_IMPERATIVE,
          target: this,
          targets: this.getObjects(),
        });
      }
    });

    this.on('mousedown', (e) => {
      this.canvas?.fire('selection:created', { selected: this });
    });

    // this.on('object:added', (e) => {
    //   console.log('adding object in layout manager', this);
    //   this.setCoords();

    //   //this.controls
    //   //this.drawControls(this.canvas?.getContext());
    // });

    // this.on('object:modified', (e) => {
    //   //console.log('Frame object modified : ', e);
    //   this.layoutManager.performLayout({
    //     type: LAYOUT_TYPE_IMPERATIVE,
    //     target: this,
    //     targets: this.getObjects(),
    //   });
    // });

    // this.on('object:added', (e) => {
    //   this.triggerLayout();
    // });
  }

  __objectSelectionMonitor() {
    //  noop
  }

  renderLayoutLabel(ctx: CanvasRenderingContext2D) {
    const textWidth = ctx.measureText('Hello World!').width;
    const labelX = this.left;
    const labelY = this.top - 20; // Adjust position above the rectangle
    ctx.save();
    ctx.transform(...this.calcTransformMatrix());
    ctx.translate(-this.width / 2, -this.height / 2 - 20);
    //ctx.translate(this.left + this.width / 2, this.top + this.height / 2);
    //ctx.transform(1, 0, 0, 1, labelX, labelY);

    ctx.fillStyle = '#3b3b3b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';

    // Draw the label at (0, 0) relative to this group’s own coordinate system
    ctx.fillText('Hello world!', 0, 0);

    ctx.restore();
  }

  render(_ctx: CanvasRenderingContext2D): void {
    //console.log('Frame rendering : ');
    super.render(_ctx);
    // now draw the preview line on top
    if (this.previewLine) {
      _ctx.save();
      _ctx.strokeStyle = '#3B82F6';
      _ctx.lineCap = 'round';
      _ctx.lineWidth = 4;
      if (this.previewLine.orientation === 'vertical') {
        // draw vertical line at x = lineX, from container top to top+height
        const top = this.top ?? 0;
        const bottom = top + (this.height ?? 0);
        // Because lineX is in canvas coords, we can just do:
        _ctx.beginPath();
        //console.log('Frame preview line : ', this.previewLine);
        _ctx.moveTo(
          this.previewLine.lineX,
          this.previewLine.lineY - this.previewLine.height / 2
        );
        _ctx.lineTo(
          this.previewLine.lineX,
          this.previewLine.lineY + this.previewLine.height / 2
        );
        _ctx.stroke();
      } else {
        // orientation = horizontal
        const left = this.left ?? 0;
        const right = left + (this.width ?? 0);
        _ctx.beginPath();
        _ctx.moveTo(left, this.previewLine.lineY);
        _ctx.lineTo(right, this.previewLine.lineY);
        _ctx.stroke();
      }
      _ctx.restore();
    }
    //this.renderLayoutLabel(_ctx);
  }

  _renderControls(ctx: CanvasRenderingContext2D) {
    this.forEachControl((control, key, fabricObject) => {
      if (key.startsWith('spacing') && (this.isResizing || this.isMoving))
        control.visible = false;
      else control.visible = true;
    });
    super._renderControls(ctx);
  }

  _onAfterObjectsChange(
    type: 'added' | 'removed',
    targets: fabric.FabricObject[]
  ) {
    this.controls = {
      ...autoLayoutControls(this),
    };
    this.previewLine = null;
    super._onAfterObjectsChange(type, targets);
  }

  //   add(...objects: FabricObject[]) {
  //     this.allowedObjects = this._filterObjectsBeforeEnteringGroup(objects);
  //     const size = super.add(...this.allowedObjects);
  //     this._onAfterObjectsChange(LAYOUT_TYPE_ADDED, this.allowedObjects);
  //     this._renderControls(this.canvas?.getContext());
  //     this.objectAdded = true;
  //     return size;
  //   }

  _applyTransformationsToObjects() {
    // Ensure initial state is set
    if (!this.initialTransformMatrix) {
      console.error('Initial state not set. Did you call onFrameMouseDown?');
      return;
    }

    // Current transformation matrix
    const currentTransformMatrix = this.calcTransformMatrix();

    // Relative transformation matrix
    const relativeTransformMatrix = fabric.util.multiplyTransformMatrices(
      fabric.util.invertTransform(this.initialTransformMatrix),
      currentTransformMatrix
    );

    // Inverse relative transformation matrix
    const inverseRelativeTransformMatrix = fabric.util.invertTransform(
      relativeTransformMatrix
    );

    // Extract scaling factors
    const { scaleX: currentScaleX, scaleY: currentScaleY } =
      fabric.util.qrDecompose(currentTransformMatrix);

    // Clamped scaling ratios
    const scaleXRatio = this.clampPrecision(currentScaleX / this.initialScaleX);
    const scaleYRatio = this.clampPrecision(currentScaleY / this.initialScaleY);

    // Clamped delta (relative to the initial state)
    const currentFrameL = this.clampPrecision(this.getX());
    const deltaLeft = this.clampPrecision(currentFrameL - this.initialFrameL);

    let dx = 0,
      dy = 0;

    if (
      (currentTransformMatrix[3] - this.initialTransformMatrix[3] > 0 &&
        currentTransformMatrix[5] - this.initialTransformMatrix[5] < 0) ||
      (currentTransformMatrix[3] - this.initialTransformMatrix[3] < 0 &&
        currentTransformMatrix[5] - this.initialTransformMatrix[5] > 0)
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

    // Apply transformations to each child object
    this._objects.forEach((obj) => {
      // Object's initial state
      const objCorner = new fabric.Point(
        obj.initialState.left,
        obj.initialState.top
      );

      // fabric.util.removeTransformFromObject(obj);

      // // Transform the object's corner using the inverse relative matrix
      const newObjCorner = fabric.util.transformPoint(
        objCorner,
        inverseRelativeTransformMatrix
      );

      obj.setPositionByOrigin(
        new fabric.Point(newObjCorner.x - dx, newObjCorner.y - dy),
        'left',
        'top'
      );
      obj.set({
        scaleX: this.clampPrecision(obj.initialState.scaleX / scaleXRatio),
        scaleY: this.clampPrecision(obj.initialState.scaleY / scaleYRatio),
      });

      obj.setCoords();

      // Debug log for each object
      console.log('Object updated:', obj.left);
    });

    // Update frame coordinates
    this.setCoords();

    // Debug log for frame updates
    console.log('Frame updated:', currentTransformMatrix);
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

  // Simplified toObject method
  toObject(propertiesToInclude: string[] = []): Record<string, any> {
    // Include additional properties and serialized _frameObjects
    const layoutStrategy = this.layoutStrategy;

    return {
      ...super.toObject([
        'subTargetCheck',
        'interactive',
        'layoutLabel',
        ...propertiesToInclude,
      ]),
      layoutManager: this.layoutManager.toObject(),
      layoutStrategy,
      objects: this.__serializeObjects('toObject', propertiesToInclude),
    };
    // console.log(
    //   'ToObject : ------------------------------------------------------------',
    //   obj
    // );
    //return obj;
  }

  static fromObject<T extends TOptions<SerializedGroupProps>>(
    { type, objects = [], layoutManager, ...options }: T,
    abortable?: Abortable
  ) {
    // Enliven the objects and options in parallel
    //super.fromObject({ type, objects, layoutManager, ...options }, abortable);
    console.log('frame from objects : ', objects);
    return fabric.util
      .enlivenObjects(objects, abortable)
      .then((restoredFrameObjects) => {
        // Create a new instance of Frame with the restored objects and options
        const layout = new this(
          restoredFrameObjects,
          {
            ...options,
            layoutManager: new NoopLayoutManager(),
          },
          true
        );

        if (layoutManager) {
          const layoutClass = classRegistry.getClass<typeof AutoLayoutManager>(
            layoutManager.type
          );
          const strategyClass = classRegistry.getClass<
            typeof AutoLayoutStrategy
          >(layoutManager.strategy);
          //   console.log(
          //     'From Object layoutManager --------------------------- : ',
          //     layoutClass,
          //     strategyClass
          //   );
          layout.layoutManager = new layoutClass(new strategyClass());
        } else {
          layout.layoutManager = new AutoLayoutManager();
        }
        layout.layoutManager.subscribeTargets({
          type: 'initialization',
          target: layout,
          targets: layout.getObjects(),
        });
        // Assign the restored objects and other canvas-specific properties
        layout.layoutManager = new AutoLayoutManager(new AutoLayoutStrategy());
        //frame._objects = restoredFrameObjects;
        //frame.canvas = undefined;

        // frame.canvas = canvas;

        // Set the coordinates of the frame
        layout.setCoords();

        //console.log('from object ---------------------------, ', frame);
        return layout;
      });
  }
}

classRegistry.setClass(AutoLayout, 'autolayout');
classRegistry.setSVGClass(AutoLayout, 'autolayout');