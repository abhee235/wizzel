import * as fabric from 'fabric';
import { CanvasObject } from '@/types/type';

// State to manage rendering pause
let isRenderingPaused = false;

/**
 * Pause rendering on the canvas.
 */
export const pauseRendering = () => {
  if (isRenderingPaused) return;
  isRenderingPaused = true;
};

/**
 * Resume rendering on the canvas.
 * @param fabricRef Reference to the Fabric.js canvas.
 */
export const resumeRendering = (fabricRef: React.RefObject<fabric.Canvas>) => {
  isRenderingPaused = false;
  if (fabricRef.current) {
    fabricRef.current.renderAll(); // Force a render when resuming
  }
};

/**
 * Render the full canvas with all provided objects.
 * @param fabricRef Reference to the Fabric.js canvas.
 * @param canvasObjects List of objects to render on the canvas.
 * @param activeObjectRef Reference to the currently active object.
 */
export const renderFullCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: {
  fabricRef: React.RefObject<fabric.Canvas>;
  canvasObjects: CanvasObject[];
  activeObjectRef: React.RefObject<{ objectId: string | null }>;
}) => {
  if (!fabricRef.current) return;

  const canvas = fabricRef.current;

  // Clear the canvas
  canvas.clear();

  // Helper function to process and add objects
  const processObject = (object: fabric.Object) => {
    if ('objects' in object && Array.isArray(object.objects)) {
      // Handle groups or containers
      const groupObjects = object.objects as fabric.Object[];
      groupObjects.forEach((childObject) => canvas.add(childObject));
    }

    if (object.type === 'frame') canvas.add(object.frameLabel);
    if (!object.isDeleted) canvas.add(object); // Add object if not deleted
  };

  // Render all objects
  canvasObjects.forEach(({ objectId, properties }) => {
    const { shapeData } = properties;

    fabric.util
      .enlivenObjects([shapeData])
      .then((enlivenedObjects) => {
        enlivenedObjects.forEach((enlivenedObj) => {
          // If the element is active, keep it in an active state
          if (activeObjectRef.current?.objectId === objectId) {
            canvas.setActiveObject(enlivenedObj);
          }

          // Add the object to the canvas
          processObject(enlivenedObj);
        });

        // Render the canvas after all objects are added
        canvas.renderAll();
      })
      .catch((error) => {
        console.error('Error enlivening objects:', error);
      });
  });
};

interface Delta {
  objectId: string;
  operation: 'add' | 'modify' | 'remove';
  changes?: any;
}

interface RenderCanvasParams {
  fabricRef: React.RefObject<fabric.Canvas>;
  deltas: Delta[];
  activeObjectRef?: React.RefObject<{ objectId: string | null }>;
  clearDeltasCallback?: () => void;
  isRenderingPaused?: boolean;
}

/**
 * Render canvas changes based on deltas.
 * @param fabricRef Reference to the Fabric.js canvas.
 * @param deltas List of delta changes to apply.
 * @param activeObjectRef Reference to the currently active object.
 */
export const renderCanvasWithDeltas = ({
  fabricRef,
  deltas,
  activeObjectRef,
  clearDeltasCallback,
  isRenderingPaused = false,
}: RenderCanvasParams) => {
  // 1) Check for paused rendering or missing Fabric instance
  if (isRenderingPaused || !fabricRef.current) {
    return;
  }

  const canvas = fabricRef.current;

  // 2) Helper: If we group certain objects or have frames, etc.
  const processObject = (obj: fabric.Object) => {
    // E.g., if it's a group, un-group (if that’s your logic)
    if ('objects' in obj && Array.isArray(obj.objects)) {
      const groupObjects = obj.objects as fabric.Object[];
      groupObjects.forEach((child) => canvas.add(child));
    }

    // Example: If we have a custom 'frame' object with a label
    if ((obj as any).type === 'frame') {
      canvas.add((obj as any).frameLabel);
    }

    // If not marked deleted, add to canvas
    if (!(obj as any).isDeleted) {
      canvas.add(obj);
    }
  };

  // 3) Iterate over all deltas (synchronously for remove/modify)
  //    For add, we might do an async enlivenObjects call.
  //    We'll call canvas.renderAll() once at the end of sync changes,
  //    then again after each async add completes.

  let needsRender = false; // track if we need a final renderAll

  deltas.forEach(({ objectId, operation, changes }) => {
    // Find an existing Fabric object by ID
    const existingObject = canvas
      .getObjects()
      .find((obj: any) => obj.objectId === objectId);

    if (operation === 'remove') {
      if (existingObject) {
        canvas.remove(existingObject);
        needsRender = true;
      }
    } else if (operation === 'modify' && existingObject && changes) {
      delete changes.shapeData.type; // Remove type from changes
      // For 'modify', we assume changes is a partial fabric.Object config
      existingObject.set({ ...changes.shapeData }); // shallow or deep merge
      existingObject.setCoords();
      needsRender = true;
    } else if (operation === 'add' && changes) {
      // Usually, changes has the shape data for enlivenObjects
      fabric.util
        .enlivenObjects([changes.shapeData], undefined)
        .then((enlivenedObjects) => {
          enlivenedObjects.forEach((enlivenedObj) => {
            // Set a custom property so we can find it later
            (enlivenedObj as any).objectId = objectId;

            processObject(enlivenedObj);

            // If this object is currently “active” for the user, re-select it
            if (
              activeObjectRef?.current?.objectId &&
              activeObjectRef.current.objectId === objectId
            ) {
              canvas.setActiveObject(enlivenedObj);
            }
          });

          // Re-render after async add
          canvas.renderAll();
        })
        .catch((error) => {
          console.error(`Error enlivening objectId ${objectId}:`, error);
        });
      // Note: do NOT set needsRender = true here, because we do an async renderAll above
    }
  });

  // 4) If we performed any synchronous remove/modify, do a single renderAll
  if (needsRender) {
    canvas.renderAll();
  }

  // 5) Clear deltas after processing
  if (typeof clearDeltasCallback === 'function') {
    clearDeltasCallback();
  }
};

export const incrementalRender = ({
  fabricRef,
  objectState,
  deltas,
}: {
  fabricRef: React.RefObject<fabric.Canvas>;
  objectState: CanvasObject[];
  deltas: Array<{
    objectId: string;
    operation: 'add' | 'modify' | 'remove';
    changes?: any;
  }>;
}) => {
  if (!fabricRef.current) return;

  const canvas = fabricRef.current;

  deltas.forEach(({ objectId, operation, changes }) => {
    const existingObject = canvas
      .getObjects()
      .find((obj: any) => obj.objectId === objectId);

    if (operation === 'remove' && existingObject) {
      canvas.remove(existingObject);
    } else if ((operation === 'add' || operation === 'modify') && changes) {
      const { shapeData } = changes;

      fabric.util
        .enlivenObjects([shapeData])
        .then((enlivenedObjects) => {
          enlivenedObjects.forEach((enlivenedObj) => {
            if (operation === 'add') {
              canvas.add(enlivenedObj);
            } else if (operation === 'modify' && existingObject) {
              existingObject.set(enlivenedObj.toObject());
              existingObject.setCoords();
            }

            canvas.renderAll();
          });
        })
        .catch((error) => {
          console.error(
            `Error processing delta for objectId ${objectId}:`,
            error
          );
        });
    }
  });
};

/**
 * Perform batch updates on the canvas.
 * @param fabricRef Reference to the Fabric.js canvas.
 * @param updateFn Function containing the batch updates to perform.
 */
export const batchUpdateCanvas = (
  fabricRef: React.RefObject<fabric.Canvas>,
  updateFn: (canvas: fabric.Canvas) => void
) => {
  if (!fabricRef.current) return;

  const canvas = fabricRef.current;

  // Pause rendering during batch updates
  pauseRendering();

  try {
    // Perform batch updates
    updateFn(canvas);
  } catch (error) {
    console.error('Error during batch updates:', error);
  } finally {
    // Resume rendering after updates
    resumeRendering(fabricRef);
  }
};