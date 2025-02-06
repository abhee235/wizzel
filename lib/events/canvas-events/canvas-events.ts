import { Canvas, FabricObject, Point, util } from 'fabric';
import {
  handleCanvasMouseDown,
  handleCanvaseMouseMove,
  handleCanvasMouseUp,
  handlePathCreated,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasSelectionCreated,
  handleCanvasZoom,
  handleResize,
  handleCanvasMouseOver,
  handleCanvasSelectionClear,
} from '@/lib/events/canvas-events/canvas';
import { handleKeyDown } from '@/lib/events/key-events';
import { throttle } from '@/lib//utils';
import { cursors, treatAngle } from '@/lib/canvas-cursor';
import { findControlNearPointer } from '@/lib/canvas-helper';
import { selectObject } from '@/store/canvas-events';

export const initializeCanvasEvents = ({
  canvas,
  setIsEventRunning,
  selectedShapeRef,
  isDrawing,
  shapeRef,
  activeObjectRef,
  syncShapeInStorage,
  updateHighlightedShpaes,
  highlightShapesRef,
  deleteShapeFromStorage,
  handleUndo,
  handleRedo,
  highlightTargetRef,
  setHighlightedShape,
  undoCanvas,
  activeElement,
  setActiveElement,
  isEditingRef,
  setElementAttributes,
  redoCanvas,
  gridRef,
}) => {
  let isPanning = false;
  let panAnimationFrame = null;
  let scrollSpeed = 0;
  const margin = 0;
  let lastPositionX = 0; // Track the previous X position to calculate delta
  let lastPositionY = 0;
  //.current = [...canvas.viewportTransform];

  //observeCanvasObjects(canvas);

  // canvas.on('object:removed', (options) => {
  //   const target = options.target;
  //   console.log('removing object check : ', target);
  //   if (!target) return;
  //   deleteShapeFromStorage(target?.objectId);
  // });

  canvas.on('mouse:down', (options: any) => {
    //console.log('mouse down', canvasObjectsRef.current);
    setIsEventRunning(true);

    //if (!canvas._activeObject) removeHighlighted();

    handleCanvasMouseDown({
      options,
      canvas,
      selectedShapeRef,
      isDrawing,
      shapeRef,
      activeObjectRef,
      syncShapeInStorage,
    });
  });

  // canvas.on('object:scaling', (options) => {
  //   const target = options.target;
  //   if (!target) return;
  //   console.log('scaling ', canvas);
  //   canvas.setActiveObject(target);
  // });

  //canvas.on('sel')
  const throttleMouseMove = throttle(handleCanvaseMouseMove, 50);
  const throttledSyncShapeInStorage = throttle(syncShapeInStorage, 50);

  canvas.on('mouse:move', (options: any) => {
    setIsEventRunning(true);

    //if (selectedShapeRef.current === 'hand') return;

    if (selectedShapeRef.current === 'hand') return;

    handleCanvaseMouseMove({
      options,
      canvas: canvas,
      isDrawing,
      selectedShapeRef,
      shapeRef,
      syncShapeInStorage: throttledSyncShapeInStorage,
    });
    // const target = canvas.findTarget(options.e, true);

    // // If we're no longer over the highlighted target, remove the highlight
    // if (highlightTargetRef.current && target === highlightTargetRef.current) {
    //   // highlightShapeRef.current.set({
    //   //   stroke: 'transparent', // Highlight color
    //   //   strokeWidth: 1,
    //   //   fill: 'transparent', // Transparent fill to highlight the outline
    //   //   selectable: false,
    //   //   evented: false,
    //   // });
    //   canvas.remove(highlightShapeRef.current);
    //   highlightShapeRef.current = null;
    //   highlightTargetRef.current = null;
    //   canvas.renderAll();
    // }
  });

  canvas.on('mouse:up', (options) => {
    setIsEventRunning(false);

    //activeObjectRef.current = canvas.getActiveObject();
    console.log('active object : ', activeObjectRef);
    stopContinuousPanning();
    // if (highlightShapeRef.current) {
    //   setHighlightedShape(null);
    //   canvas.remove(highlightShapeRef.current);
    //   highlightShapeRef.current = null; // Clear the reference
    //   canvas.renderAll();
    // }
    handleCanvasMouseUp({
      options,
      canvas: canvas,
      isDrawing,
      shapeRef,
      activeObjectRef,
      selectedShapeRef,
      syncShapeInStorage,
      activeElement,
      setActiveElement,
      deleteShapeFromStorage,
    });
  });

  canvas.on('object:scaling', (options) => {
    // options.target.set({
    //   rx: 10 * (1 / options.target.scaleX),
    //   ry: 10 * (1 / options.target.scaleY),
    // });
    // options.target.set({ dirty: true });
    if (highlightShapesRef.current.length > 0 && options.target) {
      updateHighlightedShpaes(highlightShapesRef.current, options.target);
      canvas?.requestRenderAll();
    }
  });

  canvas.on('mouse:over', (event) => {
    // if (isPanning.current) stopContinuousPanning();
    console.log('select shape : ', selectedShapeRef.current);
    // if (selectedShapeRef.current)
    //   canvas.hoverCursor = 'crosshair';
    handleCanvasMouseOver(
      event,
      canvas,
      selectedShapeRef,
      highlightTargetRef,
      highlightShapesRef,
      setHighlightedShape
    );
  });

  // Revert to original style on mouse out
  canvas.on('mouse:out', (event) => {
    // if (event.target && isPanning.current === true) {
    //   startContinuousPanning(event.target);
    // }
    if (!selectedShapeRef.current) {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'default';
    }
    if (!canvas?._activeObject) removeHighlighted();
  });

  const removeHighlighted = () => {
    if (highlightShapesRef.current.length > 0 && canvas) {
      //syncShapeInStorage(highlightedShape?.current);
      //setHighlightedShape(null);
      highlightShapesRef.current.forEach((shape) => {
        canvas.remove(shape);
      });
      //canvas.remove(highlightShapeRef.current);
      // Clear the reference
      //canvas.renderAll();
    }
    highlightShapesRef.current = [];
  };
  canvas.on('path:created', (options: any) => {
    setIsEventRunning(true);
    handlePathCreated({
      options,
      syncShapeInStorage: throttledSyncShapeInStorage,
    });
  });

  // canvas.on('object:created', (options: any) => {
  //   drawGrid(canvas);
  // });
  const startContinuousPanning = (obj) => {
    isPanning = true;

    const panLoop = () => {
      // Sync the viewport to keep the object in view
      const shouldContinuePanning = syncViewportToObject(obj);

      if (shouldContinuePanning && isPanning) {
        // Continue panning if the object is still out of bounds
        panAnimationFrame = requestAnimationFrame(panLoop);
      } else {
        // Stop panning when the object is fully within bounds
        isPanning = false;
      }
    };

    panLoop(); // Start the panning loop
  };

  const stopContinuousPanning = () => {
    isPanning = false;
    cancelAnimationFrame(panAnimationFrame);
  };

  const syncViewportToObject = (obj) => {
    //const canvas = canvas;
    const vpt = canvas.viewportTransform.slice(); // Get the current viewport transform

    if (!vpt || !obj) return false;

    const zoomFactor = canvas.getZoom();
    const horizontalPanOffset = (scrollSpeed * 3) / zoomFactor; // Smoother panning offset based on the speed
    const verticalPanOffset = (scrollSpeed * 3) / zoomFactor; // Smoother panning offset based on the speed

    const boundingBox = obj;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // Scale margins based on current zoom level
    const scaledMarginX = margin * zoomFactor; // Adjust for horizontal scaling
    const scaledMarginY = margin * zoomFactor; // Adjust for vertical scaling

    // Calculate the left, right, top, and bottom positions within the viewport
    const objectLeftInViewport = boundingBox.left * zoomFactor + vpt[4];
    const objectRightInViewport =
      (boundingBox.left + boundingBox.width) * zoomFactor + vpt[4];
    const objectTopInViewport = boundingBox.top * zoomFactor + vpt[5];
    const objectBottomInViewport =
      (boundingBox.top + boundingBox.height) * zoomFactor + vpt[5];

    const rightBoundary = canvasWidth - scaledMarginX;
    const bottomBoundary = canvasHeight - scaledMarginY;

    // Check for left boundary
    if (objectLeftInViewport <= scaledMarginX) {
      vpt[4] += horizontalPanOffset; // Move viewport to the right
      canvas.setViewportTransform(vpt);
      obj.set({ left: (scaledMarginX - vpt[4]) / zoomFactor });
      obj.setCoords();
      //canvas.requestRenderAll();
      return true;
    }

    // Check for right boundary
    if (objectRightInViewport >= rightBoundary) {
      vpt[4] -= horizontalPanOffset; // Move viewport to the left
      canvas.setViewportTransform(vpt);
      obj.set({
        left: (rightBoundary - boundingBox.width - vpt[4]) / zoomFactor,
      });
      obj.setCoords();
      //canvas.requestRenderAll();
      return true;
    }

    // Check for top boundary
    if (objectTopInViewport <= scaledMarginY) {
      vpt[5] += verticalPanOffset; // Move viewport down
      canvas.setViewportTransform(vpt);
      obj.set({ top: (scaledMarginY - vpt[5]) / zoomFactor });
      obj.setCoords();
      //canvas.requestRenderAll();
      return true;
    }

    // Check for bottom boundary
    if (objectBottomInViewport >= bottomBoundary) {
      vpt[5] -= verticalPanOffset; // Move viewport up
      canvas.setViewportTransform(vpt);
      obj.set({
        top: (bottomBoundary - boundingBox.height - vpt[5]) / zoomFactor,
      });
      obj.setCoords();
      //canvas.requestRenderAll();
      return true;
    }

    return false; // Stop panning if the object is within bounds
  };

  canvas?.on('object:moving', async (options) => {
    setIsEventRunning(true);
    //pauseRendering();
    if (!canvas) return;

    const object = options.target;
    if (!object) return;

    removeHighlighted();

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform; // Retrieve the viewport transform once
    const margin = 0; // Example margin
    const scaledMarginX = margin * zoom;
    const scaledMarginY = margin * zoom;

    // Calculate object's absolute coordinates in the canvas coordinate system
    const objectAbsoluteCoords = object.getCoords();
  
    // Check if any of the object's transformed coordinates are out of bounds
    const isOutOfBounds = objectAbsoluteCoords.some((coord) => {
      const xInViewport = coord.x * zoom + vpt[4];
      const yInViewport = coord.y * zoom + vpt[5];
      return (
        xInViewport <= scaledMarginX ||
        xInViewport >= canvas.getWidth() - scaledMarginX ||
        yInViewport <= scaledMarginY ||
        yInViewport >= canvas.getHeight() - scaledMarginY
      );
    });

    if (!isPanning && isOutOfBounds) {
      startContinuousPanning(object);
    }

    // Handle movement deltas for scroll speed calculation
    const currentPositionX = object.left;
    const currentPositionY = object.top;

    const deltaX = currentPositionX - lastPositionX;
    const deltaY = currentPositionY - lastPositionY;
    lastPositionX = currentPositionX;
    lastPositionY = currentPositionY;

    const movementDistance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    scrollSpeed = Math.min(Math.max(movementDistance, 0.4), 1); // Cap speed between 0.4 and 1

    await handleCanvasObjectMoving({
      options,
      canvas: canvas,
      syncShapeInStorage,
    });
  });

  let pointerOn = { cornerName: '', angle: 0 };
  canvas.on('object:rotating', (options) => {
    const target = options.target;
    if (!target) return;

    const angle = target.angle;
    //if (!pointerOn.cornerName) {
    const control = findControlNearPointer(
      target,
      canvas.getPointer(options.e)
    );

    const center = target.getCenterPoint();
    console.log('rotating : ', control);
    pointerOn.cornerName = control?.corner;
    // const middleTop = new fabric.Point(
    //   center.x,
    //   center.y - target.getScaledHeight() / 2
    // );
    pointerOn.angle =
      180 -
      util.radiansToDegrees(
        Math.atan2(control.coord.x - center.x, control.coord.y - center.y)
      );

    //angle += pointerOn.angle;
    //}

    console.log('rotating : ', pointerOn);
    const totalAngle = treatAngle(pointerOn?.angle || 0);
    canvas.setCursor(cursors.rotatationCursorIcon(totalAngle));
  });

  canvas.on('object:added', (options) => {
    const target = options.target;
    if (!target) return;
    if (target.type === 'autolayout') syncShapeInStorage(target);
  });

  canvas.on('object:modified', (options: any) => {
    pointerOn = { cornerName: '', angle: 0 };
    setIsEventRunning(true);
    //drawGrid(canvas);

    //syncViewportToObject(options.target);

    stopContinuousPanning();
    handleCanvasObjectModified({
      options,
      syncShapeInStorage: throttledSyncShapeInStorage,
    });
    // saveUserPreferences({
    //   userId: 'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
    //   designId,
    //   viewportTransform: JSON.stringify(
    //     canvas.viewportTransform
    //   ),
    //   canvasData: JSON.stringify(canvas),
    //   zoomLevel: canvas.getZoom(),
    //   theme: 'light',
    //   //lastActiveLayerId: activeObject.ObjectId,
    // });
    options.target.set({ dirty: false });
    canvas.renderAll();
  });

  canvas.on('object:moved', (options: any) => {
    stopContinuousPanning();
    // Event listener to update tile info when an object is moved to a new tile
    const object = options.target;
    if (!object) return;
    updateTileOnMove(canvas, object);
  });

  canvas.on('selection:created', (options: any) => {
    setIsEventRunning(false);
    if (selectedShapeRef.current === 'hand') return;

    //savePreference(canvas, activeObject);

    removeHighlighted();

    handleCanvasSelectionCreated({
      options,
      canvas: canvas,
      isEditingRef,
      highlightShapesRef,
      setElementAttributes,
    });
  });

  canvas.on('selection:updated', (options: any) => {
    console.log('selection updated : ', options);
    const selection = options.selected;
    if (selection.length > 1) selectObject(null);
    else selectObject(selection[0].objectId);
  });

  canvas.on('selection:cleared', (options: any) => {
    handleCanvasSelectionClear();
  });

  canvas.on('object:scaling', (options: any) => {
    setIsEventRunning(false);
    // handleCanvasObjectScaling({
    //   options,
    //   setElementAttributes,
    // });
    syncShapeInStorage(options.target);
  });

  canvas.on('mouse:wheel', (options: any) => {
    setIsEventRunning(false);
    options.e.preventDefault(); // Prevent default scroll behavior

    if (options.e.ctrlKey) {
      handleCanvasZoom({
        options,
        canvas: canvas,
        grid: gridRef.current,
      });
    } else {
      // Get the scroll distance
      const deltaX = -options.e.deltaX;
      const deltaY = -options.e.deltaY;

      // Update the viewport transform with scroll values
      const vpt = canvas.viewportTransform;
      if (vpt) {
        vpt[4] += deltaX; // Update X position
        vpt[5] += deltaY; // Update Y position
      }

      //console.log('new view port :', vpt);
      canvas.setViewportTransform(vpt);
      // Redraw the canvas with the new viewport position
      canvas.requestRenderAll();
    }
  });

  window.addEventListener('resize', () => {
    setIsEventRunning(false);
    handleResize({
      canvas: canvas,
    });
  });

  window.addEventListener('keydown', (e) =>
    handleKeyDown({
      e,
      canvas: canvas,
      undo: undoCanvas,
      redo: redoCanvas,
      syncShapeInStorage: throttledSyncShapeInStorage,
      deleteShapeFromStorage,
    })
  );

  // dispose the canvas and remove the event listeners when the component unmounts
  return () => {
    if (canvas) canvas.dispose();
    stopContinuousPanning();
    //remove the event listeners
    window.removeEventListener('resize', () => {
      handleResize({
        canvas: null,
      });
    });

    window.removeEventListener('keydown', (e) =>
      handleKeyDown({
        e,
        canvas: fabricRef.current,
        undo: handleUndo,
        redo: handleRedo,
        syncShapeInStorage: throttledSyncShapeInStorage,
        deleteShapeFromStorage,
      })
    );
  };
};