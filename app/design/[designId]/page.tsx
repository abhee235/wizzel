'use client';

import Image from 'next/image';
import Navbar from './_components/ui/Navbar';
import { useRef, useState, useEffect, use, useCallback } from 'react';
import { ActiveElement, Attributes } from './_components/types/type';
import * as fabric from 'fabric';
import Surface from './_components/ui/Surface';
import { defaultNavElement } from './_components/constants';
import {
  initializeFabric,
  handleCanvasMouseDown,
  handleCanvaseMouseMove,
  renderCanvas,
  handleCanvasMouseUp,
  handlePathCreated,
  handleCanvasObjectModified,
  handleCanvasObjectMoving,
  handleCanvasSelectionCreated,
  handleCanvasObjectScaling,
  handleCanvasZoom,
  handleResize,
  drawGrid,
  handleCanvasMouseOver,
} from '@/lib/canvas';
//import useLocalStorage from '@/hooks/useLocalStorage';
import {
  handleDelete,
  handleCopy,
  handlePaste,
  handleKeyDown,
} from '@/lib/key-events';
import LeftSidebar from './_components/ui/LeftSidebar';
import ControlPanel from './_components/ui/ControlPanel';
import useBroadcastEvent from '@/hooks/useBroadcastEvent';
import useEventListener from '@/hooks/useEventListner';
import useIntervals from '@/hooks/useIntervals';
import usePersistentClientId from '@/hooks/usePersistentClientId';
//import useCanvasReducer from "../app/store/reducers/canvas";
import CanvasProvider from '@/providers/CanvasProvider';
import { useSelector } from '@/hooks/useSelector';
import { useDispatch } from '@/hooks/useDispatch';
// import {
//   addShapeToCanvas,
//   removeShapeFromCanvas,
//   modifyShapeInCanvas,
//   resetCanvas,
//   undo,
//   redo,
//   syncShapes,
// } from '../../../store/actions/canvas';
import { useUnit } from 'effector-react';
import { $canvasStore, $selectedObject } from '@/store/canvas-store';
import { $inboundDeltas, clearInboundDeltas } from '@/store/inbound-deltas';
import { $patchBuffer } from '@/store/patch-buffer';
import {
  addObject,
  removeObject,
  modifyObject,
  removeGroupPreserveChildren,
  undo,
  redo,
  clearDeltas,
} from '@/store/canvas-events';
import {
  activeSelectionBox,
  shapeCustomProperties,
  updateHighlightedShpaes,
} from '@/lib/shapes';
import { getShapeInfo } from '@/lib/utils';
//import usePeriodicStoreSave from '@/hooks/usePeriodicStoreSave';
import {
  saveCanvasObjectsToDatabase,
  getObjectsByDesignId,
} from '@/actions/designActions';
import { v4 as uuidv4 } from 'uuid';
import { restoreUserPreferences } from './_components/helper';
import { saveUserPreferences } from '@/actions/user/saveUserPreference';
import { getUserPreferences } from '@/actions/user/getUserPreference';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserPreferenceInput, Disign, UpdateDesignData } from '@/types/type';
import { updateDesign } from '@/actions/dashboard/updateDesign';
import { getDesignDetails } from '@/actions/dashboard/getDesign';
import { Design } from '@prisma/client';
import {
  calculateTileInfo,
  createGrid,
  genrateDesignPreviewImage,
} from '@/lib/canvas-helper';
import ThreadOverlay from './_components/Thread/ThreadOverlay';
import NewThread from './_components/Thread/NewThread';
import { cursors } from '@/lib/canvas-cursor';
import { reset, syncObjects } from '@/store/canvas-events';
import {
  renderCanvasWithDeltas,
  renderFullCanvas,
  resumeRendering,
  batchUpdateCanvas,
  pauseRendering,
} from '@/lib/renderer';
import { initializeCanvasEvents } from '@/lib/canvasEvents';
import debounce from 'lodash.debounce';
import LiveBoardManager, { BoardShape } from '@/Collaboration/LiveBoardManager';
import { $boardInitStore, resetBoardInit } from '@/store/board-init-store';

function throttle(func: (...args: any[]) => void, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const getObjectById = (canvasObjects: Array<any>, objectId: string) => {
  return canvasObjects.find(
    (canvasObject) => canvasObject.objectId === objectId
  );
};

export default function Home({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name: '',
    value: '',
    icon: '',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const gridRef = useRef<fabric.Canvas | null>(null);
  const shapeRef = useRef<fabric.Object | null>(null);
  const highlightShapesRef = useRef<fabric.Object[]>([]);
  const isEditingRef = useRef<boolean>(false);
  const selectedShapeRef = useRef<string | null>();
  const isDrawing = useRef<boolean>(false);
  const activeObjectRef = useRef<fabric.Object | null>(null);
  // const [storedCanvasObjects, setStoredvalue] = useLocalStorage(
  //   'canvasObjects',
  //   {}
  // );
  //const [ {canvasObjects}, dispatch] = useCanvasReducer();
  // const [canvasObjects, setCanvasObjects] = useState<any>(canvasInitials);
  const [updateFromUser, setUpdateFromUser] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [syncObjects, setSyncObjects] = useState(canvasObjects);
  const canvasElementRef = useRef<fabric.Canvas | null>(null);
  const isLocalUpdate = useRef(false);
  const [isEventRunning, setIsEventRunning] = useState(false);
  //const canvasObjects = useSelector((state) => state.canvasObjects);
  const [canvasData] = useUnit([$canvasStore]);
  const [
    { canvasObjects },
    handleAddObject,
    handleRemoveObject,
    handleModifyObject,
    handleRemoveGroupPreserveChildren,
    handleSyncObject,
    handleUndo,
    handleRedo,
    handleReset,
    handleClearDeltas,
  ] = useUnit([
    $canvasStore,
    addObject,
    removeObject,
    modifyObject,
    removeGroupPreserveChildren,
    syncObjects,
    undo,
    redo,
    reset,
    clearDeltas,
  ]);
  const [inboundDeltas] = useUnit([$inboundDeltas]);
  const dispatch = useDispatch();
  const [highlightedShape, setHighlightedShape] =
    useState<fabric.Object | null>(null);
  const highlightedLayerRef = useRef<fabric.Object | null>(null);
  const [hiddenShapes, setHiddenShapes] = useState<any[]>([]);
  //console.log("canvas objects ............", canvasObjects);
  const canvasObjectsRef = useRef(canvasObjects);
  const [canvasOptions, setCanvasOptions] = useState({
    isPanning: false,
    lastPosX: 0,
    lastPosY: 0,
  });

  const canvasDraggingRef = useRef(false);
  const initialViewportTransformRef = useRef<any[] | null>(null);
  const mouseTouchRef = useRef({ initialDistance: 0, initialZoom: 0 });
  const isPanning = useRef(false); // Track if panning is active
  const scrollSpeed = useRef(0); // Speed at which the viewport should scroll
  const lastPositionX = useRef(0); // Track the previous X position to calculate delta
  const lastPositionY = useRef(0); // Track the previous Y position to calculate delta
  const panAnimationFrame = useRef(null); // Store the requestAnimationFrame ID
  const [triggerNewThread, setTriggerNewThread] = useState(false);
  const margin = 0; // Margin to start panning early
  // Attach the scroll handler to the canvas's HTML element

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const isFirstRunRef = useRef(true);
  const isCanvasInitialized = useRef(false);
  const { designId } = use(params);
  const { isInitialized, data } = useUnit($boardInitStore);
  const shouldApplyUserPreferenceRef = useRef({
    applied: false,
    data: null,
  });
  const { data: userPreference } = useQuery({
    queryKey: [
      'User Preference',
      { userId: 'bcf29a2c-df6a-4405-9076-85f8c4b5611f', designId },
    ],
    queryFn: () =>
      getUserPreferences('bcf29a2c-df6a-4405-9076-85f8c4b5611f', designId),
  });

  const { data: designData } = useQuery({
    queryKey: ['designDetails', designId],
    queryFn: () => getDesignDetails(designId),
  });

  const [designDetails, setDesignDetail] = useState<Design | undefined>(
    () => designData || undefined
  );

  useEffect(() => {
    if (designData) setDesignDetail(designData);
  }, [designData]);

  const { mutate: saveDesignDetails } = useMutation({
    mutationFn: updateDesign,
  });

  useEffect(() => {
    if (userPreference) {
      shouldApplyUserPreferenceRef.current = {
        applied: true,
        data: userPreference,
      };
    }
  }, [userPreference]);

  const { mutate: preferenceMutate } = useMutation({
    mutationFn: saveUserPreferences,
    onSuccess: (data) => {
      console.log('Design created', data);
    },
    onError: (error) => {
      console.log('Error creating design', error);
    },
  });

  const handleCanvasSave = useCallback(async () => {
    const canvas = canvasElementRef.current;
    if (!canvas) console.warn('canvas not initilize yet');
    const imgPreview = await genrateDesignPreviewImage({ canvas });

    const data: UpdateDesignData = {
      title: designDetails?.title,
      description: designDetails?.description,
      status: 'PUBLISHED',
      previewImage: imgPreview,
    };
    //console.log('design data with image : ', imgPreview, data);
    saveDesignDetails({ designId, updateData: data });
  }, [saveDesignDetails, designDetails, canvasElementRef.current]);

  const savePreference = useCallback(
    (canvas: fabric.Canvas, activeObject: fabric.Object) => {
      const userPref: UserPreferenceInput = {
        userId: 'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
        designId,
        viewportTransform: JSON.stringify(canvas.viewportTransform),
        canvasData: JSON.stringify(canvas),
        zoomLevel: canvas.getZoom(),
        theme: 'light',
        lastActiveLayerId: activeObject.ObjectId,
      };
      preferenceMutate(userPref);
    },
    [preferenceMutate]
  );

  // const userPreference = getUserPreferences(
  //   'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
  //   designId
  // );

  // useEffect(() => {
  //   if (isFirstRunRef.current) {
  //     handleReset();

  //     setTimeout(() => {
  //       gridRef?.current?.updateOfZoom(1);
  //     }, 0);
  //     isFirstRunRef.current = false; // Set to false after the initial load logic runs
  //   }
  // }, [isFirstRunRef.current]);

  // Update the ref whenever canvasObjects changes
  useEffect(() => {
    if (!canvasRef.current) return;
    if (!isInitialized) return;

    console.log('Full and first time render ...................');
    renderFullCanvas({
      fabricRef,
      canvasObjects: data,
      activeObjectRef,
    });
    resetBoardInit();
  }, [isInitialized, data]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (inboundDeltas.length === 0) return;

    renderCanvasWithDeltas({
      fabricRef: canvasElementRef,
      deltas: inboundDeltas,
      activeObjectRef,
      clearDeltasCallback: () => {
        // clear from our store so we don’t re-apply them again
        clearInboundDeltas();
      },
      // if you have a paused rendering state, pass isRenderingPaused: true or false
    });
  }, [inboundDeltas]);

  useEffect(() => {
    canvasElementRef.current = initializeFabric({
      canvasRef,
      fabricRef,
    });
    gridRef.current = createGrid(
      {
        lineCount: 25,
        distance: 20,
        width: canvasElementRef.current.width,
        height: canvasElementRef.current.height,
        param: {
          stroke: '#ebebeb',
          strokeWidth: 1,
          selectable: false,
        },
      },
      canvasElementRef.current,
      {
        min: 1,
        max: 100,
      }
    );
  }, [canvasRef, fabricRef]);

  //const clientId = useRef('client_' + Math.random().toString(36).substr(2, 9));
  const clientId = usePersistentClientId();

  useEffect(() => {
    //console.log('saving in database', canvasObjectsRef.current);
    if (canvasObjectsRef.current.length === 0 || isFirstRunRef.current) return;

    const intervalId = setInterval(async () => {
      try {
        // await saveCanvasObjectsToDatabase(
        //   'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
        //   canvasObjectsRef.current,
        //   designId
        // );
        console.log('Database save successful');
      } catch (error) {
        console.error('Error saving to database:', error);
      }
      // }, 120000);
    }, 10000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [canvasObjectsRef.current, isFirstRunRef.current]);

  useEffect(() => {
    // Each time canvasObjects (from the store) changes,
    // update the ref to match the newest array
    canvasObjectsRef.current = canvasObjects;
  }, [canvasObjects]);

  useEffect(() => {
    const fetchData = async () => {
      return await getObjectsByDesignId(designId);
    };

    fetchData().then((canvasObjects) => {
      //console.log('Canvas objects:', canvasObjects);
      if (canvasObjectsRef.current.length === 0 && canvasObjects?.length > 0) {
        //dispatch(syncShapes(canvasObjects));
        handleSyncObject(canvasObjects);
      }
    });
    //dispatch(syncShapes(canvasObjects));
  }, []);

  //usePeriodicStoreSave('bcf29a2c-df6a-4405-9076-85f8c4b5611f');

  // Function to add or update tile and shape data in the local store and sync with the global store
  const syncShapeInStorage = useCallback(
    async (object: fabric.Object) => {
      if (!object) return;

      // Calculate tile information with UUID nodeId
      const { nodeId, xIndex, yIndex } = calculateTileInfo(
        canvasElementRef.current,
        object,
        canvasObjectsRef.current
      );

      // Serialize the object data, including nodeId
      const objectId = object.objectId;

      const shapeData = object.toJSON();
      //console.log(' saving objects check : ', shapeData);

      shapeData.objectId = objectId;

      // if (object.type === 'circle') {
      //   shapeData.controlOffsetX = object.controlOffsetX;
      //   shapeData.controlOffsetY = object.controlOffsetY;
      //   shapeData.archStartAngle = object.archStartAngle;
      //   shapeData.archEndAngle = object.archEndAngle;
      // }

      //console.log('object type check : ', object.type, shapeData);
      // if (object.type === 'group') {
      // shapeData["objects"] = { sh}
      //   };
      // }

      // console.log(
      //   'syncing store locally with : ',
      //   shapeData,
      //   canvasObjectsRef.current
      // );

      console.log(
        'Syncing shape  in global store see delta',
        $canvasStore.getState()
      );
      // Update local store (canvasObjectsRef)
      const objectIndex = canvasObjectsRef.current.findIndex(
        (obj) => obj.objectId === objectId
      );

      if (objectIndex !== -1) {
        console.log('Object exists, update tile and shape data in local store');
        // Object exists, update tile and shape data in local store
        const updatedObject = {
          shapeData: {
            ...canvasObjectsRef.current[objectIndex].properties.shapeData,
            ...shapeData,
          },
          shapeCustomProperties: {
            ...canvasObjectsRef.current[objectIndex].properties
              .shapeCustomProperties,
            nodeId,
            nodeIndex: { xIndex, yIndex },
          },
        };
        // Dispatch to global store
        //dispatch(modifyShapeInCanvas(objectId, updatedObject));
        handleModifyObject({ objectId, shapeProperties: updatedObject });
      } else {
        // Object does not exist in local store, add it
        const p = shapeCustomProperties;
        const newObject = {
          shapeData,

          shapeCustomProperties: {
            ...p,
            nodeId,
            nodeIndex: { xIndex, yIndex },
          },
        };

        //dispatch(addShapeToCanvas(objectId, newObject));
        handleAddObject({ objectId, shapeProperties: newObject });
      }

      // console.log(
      //   'Synced shape with tile info in global store',
      //   canvasObjectsRef.current
      // );
      isLocalUpdate.current = true;
    },
    [canvasObjectsRef.current]
  );

  canvasElementRef.current?.on('mouse:move', (event) => {
    //console.log('object moving event ', event);
    setCursorPosition({ x: event.scenePoint.x, y: event.scenePoint.y });
  });

  // Function to update tile information if the object moves to a new tile
  const updateTileOnMove = (canvas, object) => {
    // Calculate the new tile details
    const {
      nodeId: newNodeId,
      xIndex: newXIndex,
      yIndex: newYIndex,
    } = calculateTileInfo(canvas, object, canvasObjectsRef);

    // Check if the object has moved to a new tile by comparing nodeId
    if (object.properties.shapeCustomProperties.nodeId !== newNodeId) {
      //console.log(`Object moved to a new tile: ${newNodeId}`);

      // Create updated properties for the object
      const updatedProperties = {
        ...object.properties,
        shapeCustomProperties: {
          ...object.properties.shapeCustomProperties,
          nodeId: newNodeId,
          nodeIndex: { xIndex: newXIndex, yIndex: newYIndex },
        },
        shapeData: {
          ...object.properties.shapeData,
          ...object.toJSON(), // Include any additional data from serialization
        },
      };

     
      handleModifyObject({
        objectId: object.objectId,
        shapeProperties: updatedProperties,
      });

      console.log(
        'Updated object tile info after moving to a new tile',
        updatedProperties
      );
    }
  };

  // Throttle syncShapeInStorage to limit how often it's called
  const throttledSyncShapeInStorage = throttle(syncShapeInStorage, 100); // Throttled at 500ms

  const handleSelectionFromLayer = (objectId: string) => {
    const obj = getObjectById(canvasObjectsRef.current, objectId);
    //console.log("selected object",objectId, obj);

    if (!obj || !canvasElementRef.current) return;
    const activeShapeObject = canvasElementRef.current
      .getObjects()
      .find((shape: any) => shape.objectId === objectId);
    //console.log("canvas element", canvasElementRef.current.getObjects(), activeShapeObject);
    activeShapeObject.set(activeSelectionBox);
    canvasElementRef.current.setActiveObject(activeShapeObject);
    canvasElementRef.current.renderAll();
  };

  const handlSaveShapeName = (objectId: string, shapeName: string) => {
    // Use the helper function to find the object by objectId
    const obj = getObjectById(canvasObjectsRef.current, objectId);

    if (!obj) return;

   
    handleModifyObject({
      objectId,
      shapeProperties: {
        shapeData: obj.properties.shapeData, // Access shapeData from obj
        shapeCustomProperties: {
          ...obj.properties.shapeCustomProperties, // Access shapeCustomProperties from obj
          name: shapeName,
        },
      },
    });
  };

  const handleShapeLock = (objectId: string) => {
    // Find the object in the array using the helper function
    const obj = getObjectById(canvasObjectsRef.current, objectId);
    if (!obj) return;

    // Check if the object is currently locked
    const isLocked = obj.properties.shapeCustomProperties.isLockForModification;

    // Find the active shape object on the canvas by objectId
    const activeShapeObject = canvasElementRef.current
      .getObjects()
      .find((shape: any) => shape.objectId === objectId);
    if (!activeShapeObject) return;

    // Update the object's properties based on lock status
    if (!isLocked) {
      activeShapeObject.selectable = false;
      activeShapeObject.evented = false;
      activeShapeObject.hoverCursor = 'pointer';
      activeShapeObject.lockMovementX = true;
      activeShapeObject.lockMovementY = true;
    } else {
      activeShapeObject.selectable = true;
      activeShapeObject.evented = true;
      activeShapeObject.hoverCursor = 'move';
      activeShapeObject.lockMovementX = false;
      activeShapeObject.lockMovementY = false;
    }
    handleModifyObject({
      objectId,
      shapeProperties: {
        shapeData: obj.properties.shapeData,
        shapeCustomProperties: {
          ...obj.properties.shapeCustomProperties,
          isLockForModification: !isLocked,
        },
      },
    });

    activeShapeObject.setCoords();

    // Discard active object on the canvas and re-render
    canvasElementRef.current.discardActiveObject().renderAll();
  };

  const handleShapePresence = (objectId: string) => {
    // Find the object in the array using the helper function
    const obj = getObjectById(canvasObjectsRef.current, objectId);
    if (!obj) return;

    // Get the current hidden state and toggle it
    const isHidden = obj.properties.shapeCustomProperties.isHidden;
    const newIsHidden = !isHidden;

    
    handleModifyObject({
      objectId,
      shapeProperties: {
        shapeData: { ...obj.properties.shapeData, visible: !newIsHidden },
        shapeCustomProperties: {
          ...obj.properties.shapeCustomProperties,
          isHidden: newIsHidden,
        },
      },
    });

    canvasElementRef.current.requestRenderAll();
  };

  const highlightTargetRef = useRef(null);
  const handleShapeHighlightFromLayer = (
    objectId: string,
    isHighlight: boolean
  ) => {
    // Find the object in the array using the helper function
    const obj = getObjectById(canvasObjectsRef.current, objectId);
    if (!obj) return;

    // Find the shape on the canvas by objectId
    const activeShapeObject = canvasElementRef.current
      .getObjects()
      .find((shape: any) => shape.objectId === objectId);

    if (!activeShapeObject) return;

    if (isHighlight) {
      // Highlighting logic for text and non-text shapes
      if (activeShapeObject.type === 'i-text' && !highlightedLayerRef.current) {
        // Create an underline line if it's a text object
        highlightedLayerRef.current = new fabric.Line(
          [
            activeShapeObject.left,
            activeShapeObject.top + activeShapeObject.height,
            activeShapeObject.left + activeShapeObject.width,
            activeShapeObject.top + activeShapeObject.height,
          ],
          {
            stroke: '#3B82F6',
            strokeWidth: 2,
            selectable: false,
            evented: false,
            strokeUniform: true,
          }
        );
        canvasElementRef.current.add(highlightedLayerRef.current);
      } else if (!highlightedLayerRef.current) {
        // Clone the shape to create an overlay highlight effect if it's a non-text shape
        activeShapeObject.clone().then((cloned: fabric.Object) => {
          highlightedLayerRef.current = cloned;
          highlightedLayerRef.current.set({
            fill: 'transparent', // Transparent fill to only show stroke
            stroke: '#3B82F6', // Highlight stroke color
            strokeWidth: 2, // Increase stroke width for visibility
            selectable: false, // Non-interactive
            evented: false, // Non-responsive to events
            visible: true, // Ensure it’s visible
            strokeUniform: true,
          });

          // Add the highlight clone to the canvas with the highest z-index
          highlightedLayerRef.current.set({
            scaleX: activeShapeObject.scaleX,
            scaleY: activeShapeObject.scaleY,
          });
          canvasElementRef.current.add(highlightedLayerRef.current);
          canvasElementRef.current?.bringObjectToFront(
            highlightedLayerRef.current
          );
          canvasElementRef.current.requestRenderAll();
        });
      }
    } else if (highlightedLayerRef.current) {
      // Remove the highlight overlay when no longer highlighted
      canvasElementRef.current.remove(highlightedLayerRef.current);
      highlightedLayerRef.current = null; // Clear the reference
      canvasElementRef.current.renderAll();
    }
  };

  useEffect(() => {
    if (isLocalUpdate.current) isLocalUpdate.current = isEventRunning;
  }, [isEventRunning]);

  // Listen for shape changes broadcasted by other clients and sync the canvas
  useEventListener({
    eventName: 'canvasObjects',
    callback: (data: any) => {
      if (data.clientId !== clientId) {
        //console.log("Received canvas data from another client:", data);
        //dispatch(syncShapes(data.canvasObjects));
        handleSyncObject(data.canvasObject);
      }
    },
  });

  const deleteAllShapes = () => {
    //dispatch(resetCanvas());
    handleReset();
    isLocalUpdate.current = true;
  };

  const deleteShapeFromStorage = (objectId: string) => {
    isLocalUpdate.current = true;
    //dispatch(removeShapeFromCanvas(objectId));
    handleRemoveObject(objectId);
  };

  const undoCanvas = () => {
    //console.log("modifiying undo states");
    //dispatch(undo());
    handleUndo();
    isLocalUpdate.current = true;
  };

  const redoCanvas = () => {
    //dispatch(redo());
    handleRedo();
    isLocalUpdate.current = true;
  };

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    fill: '#D9D9D9',
    stroke: '#000000',
    strokeWidth: 0,
    fontSize: 0,
    fontFamily: '',
    fontWeight: '',
    fontStyle: '',
    width: '',
    height: '',
    scaleX: 1,
    scaleY: 1,
  });

  const currentHighlightedObject = useRef(null);

  useEffect(() => {
    if (!canvasElementRef.current) return;

    initialViewportTransformRef.current = [
      ...canvasElementRef.current.viewportTransform,
    ];

    initializeCanvasEvents({
      canvas: canvasElementRef.current,
      setIsEventRunning,
      selectedShapeRef,
      isDrawing,
      shapeRef,
      activeObjectRef,
      syncShapeInStorage: throttledSyncShapeInStorage,
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
    });
    
    const stopContinuousPanning = () => {
      isPanning.current = false;
      cancelAnimationFrame(panAnimationFrame.current);
    };

    // dispose the canvas and remove the event listeners when the component unmounts
    return () => {
      if (canvasElementRef.current) canvasElementRef.current.dispose();
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
  }, [canvasElementRef]);

   const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);
    if (elem.value === 'hand') {
      canvasDraggingRef.current = true;
      handleCanvasSave();
      selectedShapeRef.current = elem?.value as string;
      return;
    } else if (elem?.value === 'comments') {
      setTriggerNewThread(true);
    } else {
      canvasDraggingRef.current = false;
      setTriggerNewThread(false);
    }
    switch (elem?.value) {
      case 'reset':
        deleteAllShapes();
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement);
        break;

      case 'delete':
        // delete it from the canvas
        handleDelete(fabricRef.current as any, deleteShapeFromStorage);
        // set "select" as the active element
        setActiveElement(defaultNavElement);
        break;

      // upload an image to the canvas
      case 'image':
        // trigger the click event on the input element which opens the file dialog
        imageInputRef.current?.click();
        /**
         * set drawing mode to false
         * If the user is drawing on the canvas, we want to stop the
         * drawing mode when clicked on the image item from the dropdown.
         */
        isDrawing.current = false;

        if (fabricRef.current) {
          // disable the drawing mode of canvas
          fabricRef.current.isDrawingMode = false;
        }
        break;

      default:
        // set the selected shape to the selected element
        selectedShapeRef.current = elem?.value as string;
        break;
    }
  };

  return (
    <main className="h-screen overflow-hidden">
      <ThreadOverlay
        canvasObject={canvasElementRef?.current}
        triggerNewThread={triggerNewThread}
        setTriggerNewThread={setTriggerNewThread}
      />

      <Navbar
        imageInputRef={imageInputRef}
        activeElement={activeElement}
        // handleImageUpload={(e: any) => {
        //   // prevent the default behavior of the input element
        //   e.stopPropagation();

        //   handleImageUpload({
        //     file: e.target.files[0],
        //     canvas: fabricRef as any,
        //     shapeRef,
        //     syncShapeInStorage,
        //   });
        // }}
        handleActiveElement={handleActiveElement}
      />

      <section className="flex h-full flex-row">
        <LeftSidebar
          allShapes={canvasObjectsRef.current}
          //highlightedShape={highlightShapesRef.current}
          handleSelectionFromLayer={handleSelectionFromLayer}
          handleSaveShapeName={handlSaveShapeName}
          handleShapeLock={handleShapeLock}
          handleShapePresence={handleShapePresence}
          handleShapeHighlight={handleShapeHighlightFromLayer}
        />
        <LiveBoardManager
          boardCore={{
            designId: designId,
            cursorPosition: {
              pointer: { ...cursorPosition },
              button: 'up',
              pointersMap: {},
            },
            getAllShapes: () => [],
            getAllShapesIncludingDeleted: () => [],
            getBoardState: () => fabricRef.current,
            resetBoard: () => {},
            updateBoard: (data: any) => {},
            onUserFollow: (cb: (payload: any) => void) => () => {},
            onScroll: (cb: () => void) => () => {},
          }}
        />
        <Surface
          canvasRef={canvasRef}
          clientId={clientId}
          showDrawingCursor={true}
          fabricRef={fabricRef}
        />
        <ControlPanel
          // elementAttributes={elementAttributes}
          // setElementAttributes={setElementAttributes}
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          //selectedObject={selectedObject}
          //activeObjectRef={activeObjectRef}
          syncShapeInStorage={throttledSyncShapeInStorage}
        />
      </section>
    </main>
  );
}