import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { cursors } from '@/lib/canvas-cursor';
import { selectObject, updateSelectedObject } from '@/store/canvas-events';
import {
  CanvasMouseDown,
  CanvasMouseUp,
  CanvasObjectModified,
  RenderCanvas,
  CanvasSelectionCreated,
  CanvasPathCreated,
  CanvasMouseMove,
} from '@/app/design/[designId]/_components/types/type';
import {
  createSpecificShape,
  activeSelectionBox,
  createHighlighlightedShapes,
  createHighlighlightedShapesFromObject,
} from '@/lib/shapeBuilder';
import { defaultToolbarAction } from '@/app/design/[designId]/_components/constants';
import { off } from 'process';
import { initAligningGuidelines } from '@/lib/alignment-guide/alignment-guide';
import { Frame } from './frame';

import {
  arcMouseControl,
  infoBox,
  label,
  labelControl,
  polygonRadiusControl,
  polygonSideControl,
  starInnerRadiusControl,
  uniformRadiusControl,
} from '@/lib/controls/customControls';
import { ShapeControls } from './shapeControls';
import { AutoLayoutManager } from './AutoLayoutManager_bkp';
import { AutoLayoutStrategy } from './AutoLayoutStrategy';
import { AutoLayout } from './AutoLayout';
import { autoLayoutControls } from './Controls/AutoLayoutControls';
import { LAYOUT_TYPE_IMPERATIVE } from './FrameLayoutManager';
import { $selectedObject } from '@/store/canvas-store';

const trailPoints: fabric.Circle[] = [];

export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // get canvas element
  const canvasElement = document.getElementById('canvas');

  // create fabric canvas
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
    preserveObjectStacking: true,
    perPixelTargetFind: true, // Enable pixel-accurate targeting
    targetFindTolerance: 10,
  });

  canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = canvas;

  initAligningGuidelines(canvas);

  canvas.renderAll();
  return canvas;
};

// Save the original methods
const originalAdd = fabric.Canvas.prototype.add;
const originalRemove = fabric.Canvas.prototype.remove;

const showTrace = false;

fabric.InteractiveFabricObject.ownDefaults = {
  ...fabric.InteractiveFabricObject.ownDefaults,
  cornerStrokeColor: '#3B82F6',
  cornerColor: '#ffffff',
  cornerSize: 8,
  transparentCorners: false,
  borderColor: '#3B82F6',
};

fabric.FabricObject.createControls = () => {
  const controls = fabric.controlsUtils.createObjectDefaultControls();
  return {
    controls: {
      ...controls,
      //uniformRadiusControl: uniformRadiusControl,
      infoBox: infoBox,
    },
  };
};

let isMoving = false;
const startX = 0;
const startY = 0;
let lastFrame = null;

// Threshold for movement detection
const MOVE_THRESHOLD = 1;

export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
  activeObjectRef,
  syncShapeInStorage,
}: CanvasMouseDown) => {
  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  console.log('mouse down selected object', $selectedObject.getState());
  const target = canvas.findTarget(options.e);
  //console.log('target selecttion', target, options);
  //target?.set(activeSelectionBox);

  // set canvas drawing mode to false
  canvas.isDrawingMode = false;

  // if selected shape is freeform, set drawing mode to true and return
  if (selectedShapeRef.current === 'freeform') {
    isDrawing.current = true;
    canvas.isDrawingMode = true;
    if (!canvas.freeDrawingBrush)
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = 4;
    return;
  }

  canvas.isDrawingMode = false;
  //canvas.selection = false;
  // if target is the selected shape or active selection, set isDrawing to false
  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === 'activeSelection')
  ) {
    isDrawing.current = false;

    // set active object to target
    //canvas.setActiveObject(target);

    /**
     * setCoords() is used to update the controls of the object
     * setCoords: http://fabricjs.com/docs/fabric.Object.html#setCoords
     */
    target.setCoords();
  } else {
    isDrawing.current = true;

    if (selectedShapeRef?.current && isDrawing.current) {
      canvas.discardActiveObject();
    }
    // create custom fabric object/shape and set it to shapeRef
    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any,
      canvas
    );

    // if shapeRef is not null, add it to canvas
    if (shapeRef.current) {
      // add: http://fabricjs.com/docs/fabric.Canvas.html#add
      if (!activeObjectRef.current) {
        activeObjectRef.current = shapeRef.current!;
      }

      if (selectedShapeRef.current) canvas.selection = true;
      else canvas.selection = true;

      canvas.add(shapeRef.current);
      shapeRef.current.setCoords();
      if (shapeRef.current.type === 'frame' && shapeRef.current?.frameLabel) {
        shapeRef.current.frameLabel.set({
          scaleX: 1 / canvas?.getZoom() || 1,
          scaleY: 1 / canvas?.getZoom() || 1,
          top: shapeRef.current.top - 20 / canvas?.getZoom() || 0,
        });
        //.frameLabel.setCoords();
        canvas.add(shapeRef.current?.frameLabel);
      }
      canvas.renderAll();
      //console.log('mouse down for card ------- ', shapeRef.current);
      //canvas.requestRenderAll();
      //canvas.fire('object:moving', { target: shapeRef.current });
    }
  }
};

export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  // if selected shape is freeform, return
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === 'freeform') return;

  canvas.isDrawingMode = false;

  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  // depending on the selected shape, set the dimensions of the shape stored in shapeRef in previous step of handelCanvasMouseDown
  // calculate shape dimensions based on pointer coordinates
  switch (selectedShapeRef?.current) {
    case 'rectangle':
      shapeRef.current?.set({
        width: Math.floor(pointer.x - shapeRef.current?.left || 0),
        height: Math.floor(pointer.y - shapeRef.current?.top || 0),
      });
      break;

    case 'frame':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;
    case 'circle':
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case 'triangle':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case 'line':
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case 'polygon':
      shapeRef.current?.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case 'arrow':
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case 'image':
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });

    default:
      break;
  }

  //sync shape in storage
  if (shapeRef.current?.objectId) {
    //canvas.setActiveObject(shapeRef.current);
    // shapeRef.current.set({ hasControls: true });
    shapeRef?.current?.setCoords();
    canvas.setActiveObject(shapeRef.current);

    // render objects on canvas
    // renderAll: http://fabricjs.com/docs/fabric.Canvas.html#renderAll
    canvas.requestRenderAll();

    syncShapeInStorage(shapeRef.current);
  }
};

export const handleFrameMouseUp = (
  canvas: fabric.Canvas,
  options: any,
  syncShapeInStorage,
  deleteShapeFromStorage
) => {
  isMoving = false;
  if (!options || !options.target) return;

  const pointer = canvas.getPointer(options.e); // Get pointer location
  const point = new fabric.Point(pointer.x, pointer.y); // Create a point
  const activeObject = canvas.getActiveObject(); // Currently selected object

  if (!activeObject) return;
};
//canvas.on('mouse:up', this._mouseUpHandler);

// handle mouse up event on canvas to stop drawing shapes
export const handleCanvasMouseUp = ({
  options,
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  activeElement,
  setActiveElement,
  deleteShapeFromStorage,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  canvas.selection = true;
  if (selectedShapeRef.current === 'freeform') return;

  canvas.requestRenderAll();
  //console.log('totoal objects : ', canvas.getObjects());

  //console.log('object created while mouse up : ', shapeRef.current);
  if (shapeRef.current) {
    canvas.setActiveObject(shapeRef.current);
    syncShapeInStorage(shapeRef.current);
  }

  //console.log('object left UP: ', options.target?.left);
  shapeRef.current = null;
  //activeObjectRef.current = null;
  if (selectedShapeRef.current === 'hand' && !canvas.isDrawingMode) {
    return;
  }
  // if (selectedShapeRef.current)
  //   handleFrameMouseUp(
  //     canvas,
  //     options,
  //     syncShapeInStorage,
  //     deleteShapeFromStorage
  //   );
  selectedShapeRef.current = null;

  // if canvas is not in drawing mode, set active element to default nav element after 700ms
  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultToolbarAction);
    }, 700);
  }
};

// update shape in storage when object is modified
export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  // Get the current parent frame (if any) and the new target frame based on movement
  const currentParentFrame = findParentFrame(target);
  const newTargetFrame = findTargetFrameForObject(target.canvas, target);

  // if (currentParentFrame && currentParentFrame.type === 'autolayout') {
  //   currentParentFrame.triggerLayout();
  // }

  if (newTargetFrame && newTargetFrame.type === 'autolayout') {
    //newTargetFrame.previewLine = null;
    //if (currentParentFrame) currentParentFrame.remove(target);
    const placeholder = placeholderMap[target.objectId!];
    newTargetFrame.remove(placeholder); // remove the placeholder
    delete placeholderMap[target.objectId!]; // remove from map
    if (currentParentFrame && currentParentFrame !== newTargetFrame) {
      currentParentFrame.remove(target);
      syncShapeInStorage(currentParentFrame);
    }

    //console.log('Frames old, new : ', target.canvas.getObjects());
    // const point = new fabric.Point(target.getCenterPoint());
    // const isContained = newTargetFrame.containsPoint(point);

    // Insert the real target
    const layoutManager = newTargetFrame.layoutManager as AutoLayoutManager;
    const { clientX: x, clientY: y } = options.e;
    // If object was partially added or not, we remove it first
    if (newTargetFrame.getObjects().indexOf(target) !== -1)
      newTargetFrame.remove(target);

    //Final insertion
    const finalIndex = layoutManager.findInsertionIndex(newTargetFrame, x, y);
    target.set({ isMoving: false });
    target.setCoords();
    newTargetFrame.insertAt(finalIndex, target);

    // Clear the preview line
    newTargetFrame.previewLine = null;

    // Trigger layout

    newTargetFrame.triggerLayout();
    newTargetFrame.setCoords();
    //for final arrangement
    // newTargetFrame.layoutManager.performLayout({
    //   type: LAYOUT_TYPE_IMPERATIVE,
    //   target: newTargetFrame,
    //   targets: newTargetFrame.getObjects(),
    // });

    newTargetFrame.canvas?.requestRenderAll();
    syncShapeInStorage(newTargetFrame);
    syncShapeInStorage(target);
  }
  console.log('object modified', target);
  if (target?.type == 'activeSelection') {
    // fix this
    console.log('object modified', target.type);
  } else {
    // If the user ended not in an autolayout
    // Possibly do nothing or just store shape
    // If old parent was an autolayout, we might want to re-lay it out
    if (currentParentFrame?.type === 'autolayout') {
      currentParentFrame.previewLine = null; // remove any leftover preview
      currentParentFrame.triggerLayout();
      syncShapeInStorage(currentParentFrame);
    }

    syncShapeInStorage(target);
  }
};

const placeholderMap: Record<string, fabric.Object> = {};

async function createInvisibleClone(
  original: fabric.Object
): Promise<fabric.Object> {
  return new Promise((resolve) => {
    original.clone().then((clone: fabric.Object) => {
      const outline = new fabric.Rect({
        width: clone.width,
        height: clone.height,
        left: clone.left,
        top: clone.top,

        selectable: false, // Ensure the hover shape is not interactive
        evented: false, // Make sure it doesn’t respond to events
        visible: false, // Ensure it’s visible
        strokeUniform: true,
        objectId: clone.objectId + '-placeholder',
        hasControls: false,
        isPlaceholder: true,
        //originalRef: target.objectId,
        excludeFromAlignment: true,
        scaleX: clone.scaleX,
        scaleY: clone.scaleY,
        angle: clone.angle,
        //originX: clone.originX,
        //originY: clone.originY,
      });

      resolve(outline);
    });
  });
}

export const handleCanvasObjectMoving = async ({
    options,
    canvas,
    syncShapeInStorage,
  }: {
    options: any;
    canvas: fabric.Canvas;
    syncShapeInStorage: (object: fabric.FabricObject | Frame) => void;
  }) => {
    const target = options.target;
    if (!target) return;
  
    // 1) find frames
    const currentParentFrame = findParentFrame(target);
    const newTargetFrame = findTargetFrameForObject(canvas, target);
  
    // ----------------------------------------------------------------------------
    // SCENARIO A: no new target frame
    // ----------------------------------------------------------------------------
    if (!newTargetFrame) {
      // If object was in a frame (Autolayout or normal), remove from that frame,
      // place it on canvas top-level.
      if (currentParentFrame) {
        currentParentFrame.remove(target);
        if (target.type === 'frame' && !target.frameLabel?.visible) {
          target.frameLabel.set({ visible: true });
        }
        canvas.add(target);
        // If it was an autolayout, also remove any preview line
        if (currentParentFrame.type === 'autolayout') {
          currentParentFrame.previewLine = null;
        }
        syncShapeInStorage(currentParentFrame);
      }
  
      if (lastFrame && lastFrame.type === 'autolayout') {
        lastFrame.remove(placeholderMap[target.objectId!]);
        lastFrame.previewLine = null;
        lastFrame.triggerLayout();
        lastFrame = null;
      }
      // if we had a “last frame” we used for preview, we can clear its preview
      // ...
      // Done. Just the object is free on canvas now.
      target.setCoords();
      canvas.requestRenderAll();
      syncShapeInStorage(target);
      return;
    }
  
    // ----------------------------------------------------------------------------
    // SCENARIO B: new target frame is found
    // ----------------------------------------------------------------------------
  
    // B1) If currentParentFrame === newTargetFrame:
    //     => object is already in that same frame
    if (currentParentFrame === newTargetFrame) {
      // If it’s a normal frame, maybe do nothing, or re-layout if that frame logic requires
      // If it’s an autolayout, we can re-check insertion index to show “live rearrangement”
      if (newTargetFrame.type === 'autolayout') {
        const layoutManager = newTargetFrame.layoutManager as AutoLayoutManager;
  
        const newIndex = layoutManager.findInsertionIndex(
          newTargetFrame,
          options.e.clientX,
          options.e.clientY
        );
  
        // 2) see if we already have a placeholder clone for this object
        let placeholder = placeholderMap[target.objectId!];
        if (!placeholder) {
          // create an invisible clone
          placeholder = await createInvisibleClone(target); //.then((cloned) => {
          //placeholder = cloned;
          placeholderMap[target.objectId!] = placeholder;
          // add it to the layout
          newTargetFrame.insertAt(newIndex, placeholder);
          newTargetFrame.triggerLayout();
          // });
        }
  
        const oldIdx = newTargetFrame.getObjects().indexOf(placeholder);
  
        console.log('Insertion index:', oldIdx, newIndex);
        if (newIndex !== oldIdx) {
          // We remove object from oldIndex, insert at newIndex => Show live arrangement
          newTargetFrame.remove(placeholder);
          newTargetFrame.insertAt(newIndex, placeholder);
          newTargetFrame.triggerLayout();
        }
        syncShapeInStorage(newTargetFrame);
        // Because it’s the same autolayout, we might not do a “preview line”—the object is actively re-laying out.
        // Up to you whether you show a line or not.
      }
      if (
        (target.type === 'frame' || target.type === 'autolayout') &&
        currentParentFrame &&
        target?.frameLabel?.visible
      )
        target.frameLabel.set({ visible: false });
      else if (
        !currentParentFrame &&
        target.type === 'frame' &&
        !target.frameLabel?.visible
      ) {
        target.frameLabel.set({ visible: true });
      }
      target.setCoords();
      canvas.requestRenderAll();
      syncShapeInStorage(target);
      return;
    }
  
    // B2) currentParentFrame != newTargetFrame:
    //     => object is transitioning from old frame (or none) into a new frame.
    //     For normal frames, we can place it immediately; for Autolayout, we typically show a preview line only.
    if (newTargetFrame.type === 'frame') {
      // A normal frame (non-autolayout):
      // Possibly remove from old frame if it’s different, add to new
      if (currentParentFrame && currentParentFrame == newTargetFrame) return;
      else if (currentParentFrame && currentParentFrame !== newTargetFrame) {
        currentParentFrame.remove(target);
        syncShapeInStorage(currentParentFrame);
      }
  
      newTargetFrame.add(target);
      newTargetFrame.setCoords();
      canvas.requestRenderAll();
      // Possibly store to storage
      syncShapeInStorage(newTargetFrame);
      syncShapeInStorage(target);
    } else if (newTargetFrame.type === 'autolayout') {
      // We only do a “preview” right now. We do NOT finalize insertion on move.
      // => show the line
      const layoutManager = newTargetFrame.layoutManager as AutoLayoutManager;
      const { index, preview } = layoutManager.findInsertionIndexWithPreview(
        newTargetFrame,
        options.e.clientX,
        options.e.clientY
      );
      // store the preview on the new autolayout, so it draws a line in its render
      newTargetFrame.previewLine = {
        ...preview,
        height: target.height,
      };
      //if old frame was also an autolayout, remove its line
      if (currentParentFrame?.type === 'autolayout') {
        currentParentFrame.previewLine = null;
      }
  
      console.log('object moing in layout');
      newTargetFrame.setCoords();
      lastFrame = newTargetFrame;
      canvas.requestRenderAll();
    }
  
    target.setCoords();
    if (newTargetFrame) syncShapeInStorage(newTargetFrame);
    syncShapeInStorage(target);
  };
  
  // Helper to find the parent frame of an object using objectId
  export const findParentFrame = (
    object: fabric.FabricObject
  ): any | undefined => {
    if (
      object.parent &&
      (object.parent.type === 'frame' || object.parent.type === 'autolayout')
    ) {
      return object.parent;
    }
    return undefined;
  };
  
  /**
   * Finds the deepest (most nested) frame/autolayout containing `object`.
   * @param canvas - The Fabric canvas instance.
   * @param object - The Fabric object for which we want to find a containing frame.
   * @returns The most deeply nested frame/autolayout that contains `object`, or undefined if none.
   */
  export const findTargetFrameForObject = (
    canvas: fabric.Canvas,
    object: fabric.FabricObject
  ): Frame | undefined => {
    if (!canvas) return undefined;
  
    // Gather all frames/autolayouts except `object` itself (in case it's also a frame).
    const frames = canvas
      .getObjects()
      .filter(
        (obj) =>
          (obj.type === 'frame' || obj.type === 'autolayout') &&
          obj.objectId !== object.objectId
      );
  
    /**
     * Recursively searches through `frames` to find the most deeply nested
     * frame that contains `targetObject`.
     */
    function getDeepestFrame(
      frames: fabric.Object[],
      targetObject: fabric.FabricObject
    ): Frame | undefined {
      let bestFrame: Frame | undefined;
  
      for (const frame of frames) {
        // Check if the target is contained in this frame.
        const point = targetObject.getCenterPoint();
        //if (targetObject.isContainedWithinObject(frame)) {
        if (frame.containsPoint(point)) {
          // Check if there's an even deeper frame inside the current one.
          const nestedFrames = frame
            .getObjects()
            .filter(
              (obj) =>
                (obj.type === 'frame' || obj.type === 'autolayout') &&
                obj.objectId !== targetObject.objectId
            );
  
          const deeperFrame = getDeepestFrame(nestedFrames, targetObject);
  
          if (deeperFrame) {
            // We found a deeper nested frame. Compare it with whatever we've chosen so far.
            if (!bestFrame || deeperFrame.isContainedWithinObject(bestFrame)) {
              bestFrame = deeperFrame;
            }
          } else {
            // No deeper nested frame, so consider the current frame if it's more nested than what we have.
            if (!bestFrame || frame.isContainedWithinObject(bestFrame)) {
              bestFrame = frame;
            }
          }
        }
      }
  
      return bestFrame;
    }
  
    return getDeepestFrame(frames, object);
  };
  
  // update shape in storage when path is created when in freeform mode
  export const handlePathCreated = ({
    options,
    syncShapeInStorage,
  }: CanvasPathCreated) => {
    // get path object
    const path = options.path;
    if (!path) return;
  
    // set unique id to path object
    path.set({
      objectId: uuidv4(),
    });
  
    // sync shape in storage
    syncShapeInStorage(path);
  };
  
  // Initialize an offset to track the panning offset
  const panOffsetX = 0;
  const panOffsetY = 0;
  
  // Function to adjust the viewport based on panOffset
  const updateViewport = (canvas: fabric.Canvas) => {
    const vpt = canvas.viewportTransform;
    if (vpt) {
      // Apply the current pan offset to the viewport transform
      vpt[4] = panOffsetX;
      vpt[5] = panOffsetY;
  
      canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
    }
  };
  
  const previousPosition = { x: 400, y: 400 }; // Initial position for the object
  
  // set element attributes when element is selected
  export const handleCanvasSelectionCreated = ({
    options,
    canvas,
    isEditingRef,
    setElementAttributes,
    highlightShapesRef,
  }: CanvasSelectionCreated) => {
    // if user is editing manually, return
    //console.log('selection created : ', options.selected);
    let selectedElement = null;
    if (Array.isArray(options?.selected)) {
      selectedElement = options?.selected?.[0] as fabric.Object;
    } else {
      selectedElement = options?.selected as fabric.Object;
    }
    if (!selectedElement) return;
    const properties = selectedElement.toObject();
  
    // Update the selected object store
    selectObject(properties.objectId);
    if (isEditingRef.current) return;
  };
  
  export const handleCanvasSelectionClear = () => {
    selectObject(null);
  };
  
  // Render canvas objects coming from storage on canvas
  export const renderCanvas = ({
    fabricRef,
    canvasObjects,
    activeObjectRef,
  }: RenderCanvas) => {
    // Clear the canvas
    //fabricRef.current?.remove(fabricRef.current?.getObjects());
  
    fabricRef.current?.clear();
    //console.log('------rendering objects ---------', canvasObjects);
    // Helper function to render objects, including any nested objects
    const addToCanvas = (object: fabric.Object) => {
      // Check if the object has an `objects` property (indicating a group or container)
  
      if ('objects' in object && Array.isArray(object.objects)) {
        // If it's a group, add each child object to the group and canvas
        const groupObjects = object.objects as fabric.Object[];
        groupObjects.forEach((childObject) => {
          fabricRef.current?.add(childObject);
        });
      }
  
      if (object.type === 'frame' && object.frameLabel)
        fabricRef.current?.add(object.frameLabel);
      if (object.type === 'autoLayout' && object.layoutLabel)
        fabricRef.current?.add(object.layoutLabel);
      // Add the main object itself to the canvas
      if (!object.isDeleted) fabricRef.current?.add(object);
    };
  
    // Render all objects on the canvas
    canvasObjects.forEach((canvasObject) => {
      const { objectId, properties } = canvasObject;
      const { shapeData } = properties;
      fabric.util
        .enlivenObjects([shapeData])
        .then((enlivenedObjects) => {
          enlivenedObjects.forEach((enlivenedObj) => {
            // If the element is active, keep it in an active state so it can be edited further
            if (activeObjectRef.current?.objectId === objectId) {
              fabricRef.current?.setActiveObject(enlivenedObj);
            }
            // Add the object (and any nested objects if it's a group) to the canvas
            addToCanvas(enlivenedObj);
          });
        })
        .catch((error) => {
          console.error('Error enlivening objects:', error);
        });
    });
  
    // Re-render the canvas
    fabricRef.current?.renderAll();
  };
  
  // resize canvas dimensions on window resize
  export const handleResize = ({ canvas }: { canvas: fabric.Canvas | null }) => {
    const canvasElement = document.getElementById('canvas');
    if (!canvasElement) return;
  
    if (!canvas) return;
  
    canvas.setDimensions({
      width: canvasElement.clientWidth,
      height: canvasElement.clientHeight,
    });
    //canvas.clear(); // Clear existing objects
    //drawGrid(canvas); // Redraw the grid
    canvas.renderAll();
  };
  
  // zoom canvas on mouse scroll
  export const handleCanvasZoom = ({
    options,
    canvas,
    grid,
  }: {
    options: any & { e: WheelEvent };
    canvas: fabric.Canvas;
  }) => {
    const delta = options.e?.deltaY * -1;
    let zoom = canvas.getZoom();
  
    // allow zooming to min 20% and max 100%
    const minZoom = 0.1;
    const maxZoom = 20;
    const zoomStep = 0.01;
  
    // calculate zoom based on mouse scroll wheel with min and max zoom
    zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);
  
    // set zoom to canvas
    // zoomToPoint: http://fabricjs.com/docs/fabric.Canvas.html#zoomToPoint
    canvas.zoomToPoint(
      new fabric.Point(options.e.offsetX, options.e.offsetY),
      zoom
    );
    canvas.getObjects().forEach((obj) => {
      if (obj.type === 'frame' && obj.frameLabel)
        obj.frameLabel.set({
          scaleX: 1 / zoom,
          scaleY: 1 / zoom,
          top: obj.top - 20 * (1 / zoom),
        });
      obj.setCoords();
    });
    canvas.requestRenderAll();
    canvas.setViewportTransform(canvas.viewportTransform);
    grid.updateOfZoom(zoom);
    //drawGrid(canvas);
    options.e.preventDefault();
    options.e.stopPropagation();
  };
  
  export const handleCanvasMouseOver = (
    options,
    canvas,
    selectedShapeRef,
    highlightTargetRef,
    highlightShapesRef,
    setHighlightedShape
  ) => {
    if (selectedShapeRef.current === 'hand') {
      canvas.defaultCursor = 'grab';
      canvas.hoverCursor = 'grab';
      return;
    } else if (
      selectedShapeRef.current === 'rectangle' ||
      selectedShapeRef.current === 'circle' ||
      selectedShapeRef.current === 'triangle' ||
      selectedShapeRef.current === 'line'
    ) {
      canvas.defaultCursor = cursors.selection_cursor;
      canvas.hoverCursor = cursors.selection_cursor;
    } else {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
    }
  
    createHighlighlightedShapes(options, canvas).then((shapes) => {
      //console.log('Total hilighted shapes ', shapes);
      shapes?.forEach((shape) => {
        canvas.add(shape);
        setHighlightedShape(shape);
        canvas.bringObjectToFront(shape);
        highlightShapesRef.current.push(shape);
      });
    });
    canvas.renderAll();
  };
  