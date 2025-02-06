import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import { Frame } from '@/lib/shapes/Frame';
import PolygonShape from '@/lib/shapes/PolygonShape';
import Star from '@/lib/shapes/Star';

import {
  CustomFabricObject,
  ElementDirection,
  ImageUpload,
  ModifyShape,
} from '@/types/type';
import {
  arcMouseControl,
  polygonRadiusControl,
  polygonSideControl,
  starInnerRadiusControl,
  uniformRadiusControl,
} from '@/lib/controls/customControls';
import Arrow from '@/lib/shapes/Arrow';
import { defaultControls }

 from '@/lib/controls/defaultControls';
import { autoLayoutControls } from '@/lib/controls/autolayout/autolayoutcontrols';
import { textControls } from '@/lib/controls/text/textControls';
import { TextInput } from './shapes/TextInput';
//import { TextInput } from './textInput';

export const shapeCustomProperties = {
  name: 'shape',
  isLockForModification: false,
  isHidden: false,
  isDeleted: false,
  fillColor: '#d9d9d9',
};

export const activeSelectionBox = {
  borderColor: '#3B82F6',
  cornerColor: 'white',
  cornerStrokeColor: '#3B82F6',
  cornerSize: 7,
  transparentCorners: false,
};

export const createRectangle = (pointer: PointerEvent) => {
  const rectObj = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#d9d9d9',
    objectId: uuidv4(),
    //stroke: '#d9d9d9',
    strokeUniform: true,
    noScaleCache: true,
    originX: 'left',
    originY: 'top',
    isDeleted: false,
    parentId: null,
    shapeName: fabric.Rect.type || 'shape',
    isLocked: false,
  } as CustomFabricObject<fabric.Rect>);

  const controls = rectObj.controls;
  delete controls.mtr;
  rectObj.controls = {
    ...fabric.Rect.createControls().controls,
    uniformRadiusControl,
    ...defaultControls(rectObj),
  };
  //applyDynamicControls(rect);
  return rectObj;
};

export const createTriangle = (pointer: PointerEvent) => {
  const triangle = new fabric.Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: '#d9d9d9',
    objectId: uuidv4(),
    stroke: '#d9d9d9',
    strokeUniform: true,
    isDeleted: false,
    parentId: null,
    shapeName: fabric.Triangle.type || 'shape',
    isLocked: false,
  } as CustomFabricObject<fabric.Triangle>);

  triangle.controls = {
    ...fabric.Rect.createControls().controls,
    ...defaultControls(triangle),
  };

  return triangle;
};

export const createCard = (pointer: PointerEvent) => {
  const cardBackground = new fabric.Rect({
    left: pointer.x,
    top: pointer.y,
    width: 300,
    height: 400,
    fill: '#ffffff',
    stroke: '#cccccc',
    strokeWidth: 1,
    rx: 1,
    ry: 1,
    selectable: true,
    strokeUniform: true,
    shadow: {
      color: 'rgba(0, 0, 0, 0.2)', // Shadow color with transparency
      blur: 10, // Shadow blur amount
      offsetX: 5, // Horizontal offset of the shadow
      offsetY: 5, // Vertical offset of the shadow
    },
  });

  const padding = 5;

  const cardLabel = new fabric.IText('Card Title', {
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    left: cardBackground.left + padding,
    top: cardBackground.top - 30 + padding,
    fill: 'black', // Text color
    selectable: true, // Allow selection for editing
    lockUniScaling: true,
  });

  // Create a rectangle as a background with padding
  const textBackground = new fabric.Rect({
    left: cardBackground.left,
    top: cardBackground.top - 30,
    width: cardLabel.width + padding * 2,
    height: cardLabel.height + padding * 2,
    fill: 'white', // Background color
    selectable: false, // Prevent selection of the background
    evented: false, // Prevent events on the background
    rx: 3,
    ry: 3,
    stroke: '#e3e3e3',
    strokeWidth: 0.5,
  });
  // Group the section background and label
  const card = new fabric.Group([cardBackground, textBackground, cardLabel], {
    left: pointer.x,
    top: pointer.y,
    selectable: false,
    objectId: uuidv4(),
  });

  // card.clipPath = new fabric.Rect({
  //   width: cardBackground.width,
  //   height: cardBackground.height + 50,
  //   originX: 'center',
  //   originY: 'center',
  // });

  return card;
};

export const createCircle = (pointer: PointerEvent) => {
  const circle = new fabric.Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 70,
    fill: '#d9d9d9',
    // startAngle: 0, // Start angle in radians (0 radians is the 3 o'clock position)
    // endAngle: 360, // Initial end angle (full circle)
    objectId: uuidv4(),
    stroke: '#d9d9d9',
    strokeUniform: true,
    isDeleted: false,
    parentId: null,
    shapeName: fabric.Circle.type || 'shape',
    isLocked: false,
  } as any);

  circle.controls = {
    ...fabric.Circle.createControls().controls,
    arcMouseControl,
    ...defaultControls(circle),
  };
  return circle;
};

export const createPolygon = (pointer: PointerEvent) => {
  const polygon = new PolygonShape({
    left: pointer.x,
    top: pointer.y,
    radius: 60,
    numberOfSides: 5,
    fill: '#d9d9d9',
    objectId: uuidv4(),
    stroke: '#d9d9d9',
    strokeUniform: true,
    mouseX: pointer.x,
    mouseY: pointer.y,
    isDeleted: false,
    parentId: null,
    shapeName: 'polygon',
    isLocked: false,
  } as any);

  const controls = {
    ...fabric.Polygon.createControls().controls,
    polygonRadiusControl: polygonRadiusControl,
    polygonSideControl: polygonSideControl,
    starInnerRadiusControl: starInnerRadiusControl,
    ...defaultControls(polygon),
  };
  polygon.controls = controls;
  return polygon;
};

export const createStar = (pointer: PointerEvent) => {
  const polygon = new Star({
    left: pointer.x,
    top: pointer.y,
    numberOfSides: 5,
    fill: '#d9d9d9',
    objectId: uuidv4(),
    stroke: '#d9d9d9',
    strokeUniform: true,
    spikes: 5, // Number of points
    outerRadius: 70,
    innerRadius: 35,
    centerX: 200,
    centerY: 200,
    isDeleted: false,
    parentId: null,
    shapeName: 'start',
    isLocked: false,
  } as any);

  const controls = {
    ...fabric.Polygon.createControls().controls,
    polygonRadiusControl: polygonRadiusControl,
    polygonSideControl: polygonSideControl,
    starInnerRadiusControl: starInnerRadiusControl,
    ...defaultControls(polygon),
  };
  polygon.controls = controls;
  return polygon;
};

export const createArrow = (pointer: PointerEvent) => {
  const arrow = new Arrow({
    left: pointer.x,
    top: pointer.y,
    objectId: uuidv4(),
    stroke: '#000000',
    strokeWidth: 1,
    strokeUniform: true,
    isDeleted: false,
    parentId: null,
    shapeName: 'arrow',
    isLocked: false,
  });
  return arrow;
};

export const createLine = (pointer: PointerEvent) => {
  return new fabric.Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
    {
      objectId: uuidv4(),
      stroke: '#000000',
      strokeWidth: 1,
      strokeUniform: true,
      isDeleted: false,
      parentId: null,
      shapeName: fabric.Line.type || 'shape',
      isLocked: false,
    } as CustomFabricObject<fabric.Line>
  );
};

export const createText = (pointer: PointerEvent, text: string) => {
  const t = new TextInput(text, {
    left: pointer.x,
    top: pointer.y,
    fill: '#000000',
    fontFamily: 'Inter, sans-serif',
    fontSize: 18,
    fontWeight: '400',
    objectId: uuidv4(),
    noScaleCache: true,
    strokeUniform: true,
    width: 200,
    height: 50,
    objectCaching: false,
    isDeleted: false,
    parentId: null,
    shapeName: fabric.Textbox.type || 'shape',
    isLocked: false,
    padding: 6,
  });

  t.controls = {
    ...fabric.Textbox.prototype.controls,
    ...textControls(t),
  };
  return t;
};

export const createFrame = (pointer: PointerEvent) => {
  const frame = new Frame(
    [],
    {
      left: pointer.x,
      top: pointer.y,
      width: 300,
      height: 400,
      strokeUniform: true,
      isDeleted: false,
      parentId: null,
      shapeName: 'frame',
      isLocked: false,
    },
    false
  );

  frame.controls = {
    ...fabric.Rect.createControls().controls,
    ...autoLayoutControls(frame),
  };
  // frame.controls = {
  //   ...fabric.Rect.createControls().controls,
  //   ...defaultControls(frame),
  // };

  //container.setCoords();
  return frame;
  //return null;
};

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerEvent,
  canvas: fabric.Canvas
) => {
  switch (shapeType) {
    case 'rectangle':
      return createRectangle(pointer);

    case 'triangle':
      return createTriangle(pointer);

    case 'circle':
      return createCircle(pointer);

    case 'line':
      return createLine(pointer);

    case 'text':
      return createText(pointer, 'Tap to Type');

    case 'frame':
      return createFrame(pointer);

    case 'polygon':
      return createPolygon(pointer);

    case 'star':
      return createStar(pointer);

    case 'arrow':
      return createArrow(pointer);

    default:
      return null;
  }
};

export const handleImageUpload = ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result as string, (img) => {
      img.scaleToWidth(200);
      img.scaleToHeight(200);

      canvas.current.add(img);

      // @ts-ignore
      img.objectId = uuidv4();

      shapeRef.current = img;

      syncShapeInStorage(img);
      canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

export const createShape = (
  canvas: fabric.Canvas,
  pointer: PointerEvent,
  shapeType: string
) => {
  if (shapeType === 'freeform') {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

export const createHighlighlightedShapesFromObject = async (target) => {
    if (!target || (target.type === 'frame' && !target.parent)) return [];
  
    const highlightedShapes = [];
  
    if (
      target.type === 'autolayout' ||
      (target?.category && target?.parentLayout.type === 'autolayout')
    ) {
      const clone =
        target.type === 'autolayout'
          ? await target.clone()
          : await target.parentLayout.clone();
      const outline = new fabric.Rect({
        width: clone.width,
        height: clone.height,
        left: clone.left,
        top: clone.top,
        stroke: '#3B82F6', // Change the stroke color
        strokeWidth: 1.5, // Change the stroke width
        fill: 'transparent', // Make sure it’s transparent
        selectable: false, // Ensure the hover shape is not interactive
        evented: false, // Make sure it doesn’t respond to events
        visible: true, // Ensure it’s visible
        strokeUniform: true,
        objectId: uuidv4(),
        hasControls: false,
        originalRef: target.objectId,
        excludeFromAlignment: true,
        scaleX: clone.scaleX,
        scaleY: clone.scaleY,
        angle: clone.angle,
        originX: clone.originX,
        originY: clone.originY,
      });
      highlightedShapes.push(outline);
    } else if (target?.category && target?.parentFrame.type === 'frame') {
      const parentClone = await target.parentFrame.clone();
  
      const outline = new fabric.Rect({
        width: parentClone.width,
        height: parentClone.height,
        left: parentClone.left,
        top: parentClone.top,
        stroke: '#3B82F6', // Change the stroke color
        strokeWidth: 1.5, // Change the stroke width
        fill: 'transparent', // Make sure it’s transparent
        selectable: false, // Ensure the hover shape is not interactive
        evented: false, // Make sure it doesn’t respond to events
        visible: true, // Ensure it’s visible
        strokeUniform: true,
        objectId: uuidv4(),
        hasControls: false,
        originalRef: target.objectId,
        excludeFromAlignment: true,
        scaleX: parentClone.scaleX,
        scaleY: parentClone.scaleY,
        angle: parentClone.angle,
        originX: target.originX,
        originY: target.originY,
      });
      highlightedShapes.push(outline);
    } else if (
      (target.type === 'frame' || target.type === 'autolayout') &&
      target.parent
    ) {
      const clone = await target.clone();
      const outline = new fabric.Rect({
        width: clone.width + 2,
        height: clone.height + 2,
        left: clone.left,
        top: clone.top,
        stroke: '#3B82F6', // Change the stroke color
        strokeWidth: 1.5, // Change the stroke width
        fill: 'transparent', // Make sure it’s transparent
        selectable: false, // Ensure the hover shape is not interactive
        evented: false, // Make sure it doesn’t respond to events
        visible: true, // Ensure it’s visible
        strokeUniform: true,
        objectId: uuidv4(),
        hasControls: false,
        originalRef: target.objectId,
        excludeFromAlignment: true,
        scaleX: clone.scaleX,
        scaleY: clone.scaleY,
        angle: clone.angle,
        originX: target.originX,
        originY: target.originY,
      });
      fabric.util.sendObjectToPlane(outline, target.parent.calcTransformMatrix());
      highlightedShapes.push(outline);
    } else if (target.type === 'i-text' || target.type === 'textinput') {
      // Create a line highlight for text objects
      if (target.category) return highlightedShapes;
      const lineShape = new fabric.Line(
        [
          target.left,
          target.top + target.height,
          target.left + target.width,
          target.top + target.height,
        ],
        {
          stroke: '#3B82F6',
          strokeWidth: 1.5,
          selectable: false,
          evented: false,
          strokeUniform: true,
          objectId: uuidv4(),
          originalRef: target.objectId,
          excludeFromAlignment: true,
          hasControls: false,
        }
      );
      highlightedShapes.push(lineShape);
  
      // canvasElementRef.current.add(highlightShapeRef.current);
      // setHighlightedShape(target);
      // canvasElementRef.current.bringObjectToFront(highlightShapeRef.current);
    } else {
      const clonned = await target.clone();
      //setHighlightedShape(target);
      //highlightShapeRef.current = cloned;
      clonned.set({
        stroke: '#3B82F6', // Change the stroke color
        strokeWidth: 1.5, // Change the stroke width
        fill: 'transparent', // Make sure it’s transparent
        selectable: false, // Ensure the hover shape is not interactive
        evented: false, // Make sure it doesn’t respond to events
        visible: true, // Ensure it’s visible
        strokeUniform: true,
        objectId: uuidv4(),
        hasControls: false,
        originalRef: target.objectId,
        excludeFromAlignment: true,
      });
      if (
        target.parent &&
        (target.parent.type === 'frame' || target.parent.type === 'autolayout')
      ) {
        fabric.util.sendObjectToPlane(
          clonned,
          target.parent.calcTransformMatrix()
        );
      }
      highlightedShapes.push(clonned);
      //return highlightedShapes;
      // canvasElementRef.current.add(highlightShapeRef.current);
      // setHighlightedShape(target);
      // canvasElementRef.current.bringObjectToFront(highlightShapeRef.current);
      //});
    }
    if (target.clipPath) {
      //highlightTargetRef.current = target;
      const clonedClipPath = await target.clipPath.clone();
  
      clonedClipPath.set({
        stroke: '#3B82F6', // Highlight color
        strokeWidth: 1.5,
        fill: 'transparent', // Transparent fill to highlight the outline
        selectable: false,
        evented: false,
        strokeUniform: true,
        objectId: uuidv4(),
        originalRef: target.objectId,
        excludeFromAlignment: true,
        hasControls: false,
      });
      // Align the `clipPath` clone to the circle position and transformations
      clonedClipPath.set({
        left: target.left,
        top: target.top,
        originX: target.originX,
        originY: target.originY,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        angle: target.angle,
      });
      highlightedShapes.push(clonedClipPath);
      //return highlightedShapes;
      // canvasElementRef.current.add(highlightShapeRef.current);
      // setHighlightedShape(target);
      // canvasElementRef.current.bringObjectToFront(highlightShapeRef.current);
    }
    return highlightedShapes;
  };
  
  export const createHighlighlightedShapes = async (options, canvas) => {
    // Get the current viewport transform
  
    const vpt = canvas.viewportTransform;
    if (!vpt) return;
  
    // Extract the scale and translation components of the transform
    const scaleX = vpt[0];
    const scaleY = vpt[3];
    const offsetX = vpt[4];
    const offsetY = vpt[5];
  
    // Create transformed pointer coordinates using clientX and clientY
    const pointerX = (options.e.clientX - offsetX) / scaleX;
    const pointerY = (options.e.clientY - offsetY) / scaleY;
  
    // Create a new fabric.Point with transformed coordinates for targeting
    const transformedPointer = new fabric.Point(pointerX, pointerY);
  
    // Use the transformed pointer coordinates to find the target
    const target = canvas.findTarget(transformedPointer, false);
  
    //console.log('mouse over target', target);
    // Calculate the position based on the current transform
    // const transformedLeft = target.left * scaleX + offsetX;
    // const transformedTop = target.top * scaleY + offsetY;
    // const transformedWidth = target.width * scaleX;
    // const transformedHeight = target.height * scaleY;
  
    // Create or update the highlight shape at the transformed position
    // If the target has a `clipPath`, use the clipped area as a highlight
    //if (target.clipPath && highlightTargetRef.current !== target) {
  
    return await createHighlighlightedShapesFromObject(target);
  };
  
  export const updateHighlightedShpaes = (shapes, target) => {
    const shape = shapes.filter(
      (x) => x.originalRef === target.objectId && x.relationship
    )[0];
    //console.log('update highlight : ', shape, target, shapes);
    if (!shape || !shape.relationship) return;
  
    const newTransform = fabric.util.multiplyTransformMatrices(
      target.calcTransformMatrix(),
      shape.relationship
    );
    const opt = fabric.util.qrDecompose(newTransform);
    shape.set({
      flipX: false,
      flipY: false,
    });
    shape.setPositionByOrigin(
      { x: opt.translateX, y: opt.translateY },
      'center',
      'center'
    );
    shape.set(opt);
    shape.setCoords();
  };