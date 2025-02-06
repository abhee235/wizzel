import * as fabric from 'fabric';
import { Frame } from './frame';
import { v4 as uuidv4 } from 'uuid';

function getObjectsInViewport(canvas: fabric.Canvas) {
  const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const zoom = canvas.getZoom();

  // Calculate the viewport bounds
  const left = -vpt[4] / zoom;
  const top = -vpt[5] / zoom;
  const right = left + canvas.getWidth() / zoom;
  const bottom = top + canvas.getHeight() / zoom;

  return canvas.getObjects().filter((obj) => {
    const objBounds = obj.getBoundingRect(true);
    return (
      objBounds.left < right &&
      objBounds.top < bottom &&
      objBounds.left + objBounds.width > left &&
      objBounds.top + objBounds.height > top
    );
  });
}

export async function genrateDesignPreviewImage({
  canvas,
  width = 350,
  height = 230,
}: {
  canvas: fabric.Canvas;
  width?: number;
  height?: number;
}) {
  const viewportObjects = getObjectsInViewport(canvas);

  if (!viewportObjects || viewportObjects.length === 0) {
    console.warn('No objects in the viewport to render.');
    return ''; // Return an empty string if there are no objects to render
  }

  const previewCanvas = new fabric.StaticCanvas(null, {
    width: width,
    height: height,
  });

  const scale = height / canvas.getHeight();

  // Calculate viewport offset for repositioning objects within preview canvas
  const vpt = canvas.viewportTransform;
  const zoom = canvas.getZoom();
  const viewportLeft = -vpt[4] / zoom;
  const viewportTop = -vpt[5] / zoom;

  // Clone and reposition objects within the viewport
  const clonedObjects = viewportObjects.map((obj) => obj.toObject());

  fabric.util.enlivenObjects(clonedObjects, (enlivenedObjects) => {
    enlivenedObjects.forEach((clone) => {
      // Adjust the position of each object relative to the viewport bounds
      clone.left = (clone.left - viewportLeft) * scale;
      clone.top = (clone.top - viewportTop) * scale;
      clone.scaleX = (clone.scaleX || 1) * scale;
      clone.scaleY = (clone.scaleY || 1) * scale;
      clone.setCoords();
      previewCanvas.add(clone);
    });
  });

  // Generate the data URL for the preview canvas
  const dataURL = previewCanvas.toDataURL({
    format: 'png',
    quality: 1,
  });

  // Clean up the preview canvas to save memory
  previewCanvas.dispose();

  console.log('Generated preview data URL:', dataURL);
  return dataURL;
}

// Check if an object's center is within container boundaries
export const isObjectWithinBounds = (
  activeObject: fabric.Object,
  object: fabric.Object
): boolean => {
  const objCenter = activeObject.getCenterPoint();
  const containerLeft = object.left || 0;
  const containerTop = object.top || 0;
  const containerRight = (object.left || 0) + (object.width || 0);
  const containerBottom = (object.top || 0) + (object.height || 0);

  return (
    objCenter.x >= containerLeft &&
    objCenter.x <= containerRight &&
    objCenter.y >= containerTop &&
    objCenter.y <= containerBottom
  );
};

/**
 * Retrieves the innermost frame at a given point on the canvas.
 * @param canvas - The Fabric.js canvas instance.
 * @param point - The point to check (fabric.Point).
 * @returns The innermost frame containing the point, or null if none.
 **/

export const getInnermostFrameAtPoint = (
  canvas: fabric.Canvas,
  point: fabric.Point
): Frame | null => {
  const framesAtPoint = findFramesAtPoint(canvas, point);

  for (const frame of framesAtPoint) {
    const innermostFrame = findInnermostFrame(frame, point);
    if (innermostFrame) {
      return innermostFrame;
    }
  }

  return null;
};

export const findTargetFrameForObject = (
  canvas: fabric.Canvas,
  object: fabric.FabricObject
) => {
  const frames: Frame[] = [];
  const objects = canvas.getObjects().slice().reverse(); // Topmost first
  for (const obj of objects) {
    if (obj.type === 'frame' && obj.objectId !== object.objectId) {
      const frame = obj as Frame;
      if (object.isContainedWithinObject(frame)) {
        return frame; // Exit immediately when a match is found
      }
    }
  }
  return undefined; // Return undefined if no frame is found
};

export const findFramesAtPoint = (
  canvas: fabric.Canvas,
  point: fabric.Point
): Frame[] => {
  const frames: Frame[] = [];
  const objects = canvas.getObjects().slice().reverse(); // Topmost first

  objects.forEach((obj) => {
    if (obj.type === 'frame') {
      const frame = obj as Frame;
      if (frame.containsPoint(point, true)) {
        // true for transformed coordinates
        frames.push(frame);
      }
    }
  });

  return frames;
};

/**
 * Recursively finds the innermost frame that contains the given point.
 * @param frame - The current frame to check.
 * @param point - The point to check (fabric.Point).
 * @returns The innermost frame containing the point, or null if none.
 */

export const findInnermostFrame = (
  frame: Frame,
  point: fabric.Point
): Frame | null => {
  const nestedFrames: Frame[] = [];

  // Iterate over child objects in reverse order (topmost first)
  frame
    .getObjects()
    .slice()
    .reverse()
    .forEach((obj) => {
      if (obj.type === 'frame') {
        const nestedFrame = obj as Frame;
        if (nestedFrame.containsPoint(point, true)) {
          nestedFrames.push(nestedFrame);
        }
      }
    });

  if (nestedFrames.length === 0) {
    return frame;
  } else {
    // Recursively check within the first nested frame
    return findInnermostFrame(nestedFrames[0], point);
  }
};

export const isObjectWithinFrame = (frame: Frame, obj: fabric.Object) => {
  // Update coordinates
  obj.setCoords();
  frame.setCoords();

  // Get frame's bounding box
  const frameBounds = frame.getBoundingRect();

  // Get object's corners
  const objCorners = obj.oCoords;

  // Function to check if a point is within the frame's bounding box
  function isPointWithinFrame(point) {
    return (
      point.x >= frameBounds.left &&
      point.x <= frameBounds.left + frameBounds.width &&
      point.y >= frameBounds.top &&
      point.y <= frameBounds.top + frameBounds.height
    );
  }

  // Check all four corners
  // return (
  //   isPointWithinFrame(objCorners.tl) &&
  //   isPointWithinFrame(objCorners.tr) &&
  //   isPointWithinFrame(objCorners.bl) &&
  //   isPointWithinFrame(objCorners.br)
  // );
  return obj.isContainedWithinObject(frame);
};

export const isObjectAlreadyInFrame = (
  frame: Frame,
  obj: fabric.Object
): boolean => {
  return frame._objects.some(
    (existingObj) => existingObj.objectId === obj.objectId
  );
};

export const drawSelectionBox = (canvas: fabric.Canvas) => {};

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 20;

export const createGrid = (options, canvas, { min, max }) => {
  const lines = [];

  const staticCanvas = new fabric.StaticCanvas();
  staticCanvas.setHeight(options.distance * options.lineCount);
  staticCanvas.setWidth(options.distance * options.lineCount);

  for (let i = 0; i < options.lineCount; i++) {
    const distance = i * options.distance;
    const horizontal = new fabric.Line(
      [distance, 0, distance, options.lineCount * options.distance],
      options.param
    );
    const vertical = new fabric.Line(
      [0, distance, options.lineCount * options.distance, distance],
      options.param
    );

    lines.push([vertical, horizontal]);

    staticCanvas.add(horizontal);
    staticCanvas.add(vertical);

    if (i % 5 === 0) {
      horizontal.set({ stroke: '#cccccc' });
      staticCanvas.bringObjectToFront(horizontal);
      vertical.set({ stroke: '#cccccc' });
      staticCanvas.bringObjectToFront(vertical);
    }
  }

  const getCoefficient = (zoom) => {
    let coefficient = options.distance;

    let min = ZOOM_MIN;
    const max = ZOOM_MAX;

    while (min < max) {
      if (min <= zoom) {
        coefficient = options.distance / min;
      }
      min *= 5;
    }

    return coefficient;
  };

  return {
    updateOfZoom: (zoom) => {
      const coefficient = getCoefficient(zoom);
      const distance = coefficient * zoom;

      staticCanvas.setHeight(distance * options.lineCount);
      staticCanvas.setWidth(distance * options.lineCount);

      lines.forEach(([verticalLine, horizontalLine], i) => {
        verticalLine.top = i * distance;
        verticalLine.width = distance * options.lineCount;
        verticalLine.setCoords();

        horizontalLine.left = i * distance;
        horizontalLine.height = distance * options.lineCount;
        horizontalLine.setCoords();
      });

      const pattern = new fabric.Pattern({
        source: staticCanvas.toCanvasElement(),
        repeat: 'repeat',
      });

      pattern.patternTransform = [1 / zoom, 0, 0, 1 / zoom, 0, 0];

      // canvas.setBackgroundColor(pattern, () => {});
      canvas.set({
        backgroundColor: pattern,
      });
      canvas.renderAll();
    },
  };
};

// Utility function to calculate tile information based on object position
export const calculateTileInfo = (canvas, object, canvasObjects) => {
  // const TILE_SIZE = 15000; // Define your tile size here
  // const zoomLevel = canvas.getZoom(); // Get the current zoom level

  // const transformMatrix = canvas.viewportTransform; // Get the viewport transform matrix

  // // // Apply the viewport transform to calculate the actual position in unzoomed canvas space
  // // const adjustedLeft = (object.left - transformMatrix[4]) / zoomLevel;
  // // const adjustedTop = (object.top - transformMatrix[5]) / zoomLevel;

  // const adjustedLeft = object.left;
  // const adjustedTop = object.top;
  // // Calculate the tile indices based on the adjusted positions
  // const xIndex = Math.floor(adjustedLeft / TILE_SIZE);
  // const yIndex = Math.floor(adjustedTop / TILE_SIZE);

  // // Generate a UUID for nodeId to uniquely identify the tile
  // const ob = canvasObjects.filter((x) => x.objectId === object.objectId);
  // const nodeId = uuidv4();
  // // if (ob.length > 0) {
  // //   console.log(
  // //     'Tile info:',
  // //     nodeId,
  // //     xIndex,
  // //     yIndex,
  // //     ob[0].properties.shapeCustomProperties,
  // //     ob[0].properties.shapeData.left,
  // //     ob[0].properties.shapeData.top,
  // //     object.left,
  // //     object.top
  // //   );
  // // }

  //return { nodeId, xIndex, yIndex };
  return { nodeId: 0, xIndex: 0, yIndex: 0 };
};

export const findControlNearPointer = (
  target: fabric.FabricObject,
  pointer: any
) => {
  let nearCorner = undefined;
  let minDistance = Infinity;
  const entries = Object.entries(target.oCoords);

  for (let i = 0; i < entries.length; i++) {
    const [key, corner] = entries[i];
    const distance = Math.hypot(pointer.x - corner.x, pointer.y - corner.y);

    if (distance < minDistance) {
      minDistance = distance;
      nearCorner = key;
    }
  }
  return { corner: nearCorner, coord: target.oCoords[nearCorner] };
};