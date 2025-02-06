// store/canvas-store.ts

import { createStore, sample } from 'effector';
import {
  addObject,
  removeObject,
  modifyObject,
  syncObjects,
  undo,
  redo,
  reset,
  trackDelta,
  clearDeltas,
  removeGroupPreserveChildren,
  selectObject,
  updateSelectedObject,
  deltasReady,
  applyDeltas,
} from './canvas-events';
import { $participantsStore } from '@/store/participant-store';
import { CanvasObject } from '@/types/type';
import { HierarchyUtils } from '@/store/store-utils'; // Import the utility class
import { broadcastDeltasFx } from '@/Collaboration/shapeBroadcast';

// -------------------------------------------------
// Initial State
// -------------------------------------------------
interface Delta {
  objectId: string;
  operation: 'add' | 'remove' | 'modify';
  changes?: any; // The shape properties that changed
  version: number; // Global version at the time of the delta
  timestamp: number; // Unix timestamp in milliseconds
}

interface CanvasState {
  canvasObjects: CanvasObject[];
  undoStack: CanvasObject[][]; // snapshot-based undo
  redoStack: CanvasObject[][]; // snapshot-based redo
  deltas: Delta[];
  selectedId: string | null;
  version: number; // Global version
  lastUpdated: number; // Unix timestamp in milliseconds
}

const initialState: CanvasState = {
  canvasObjects: [],
  undoStack: [],
  redoStack: [],
  deltas: [],
  selectedId: null,
  version: 0, // Initialize version
  lastUpdated: Date.now(), // Initialize timestamp
};

// -------------------------------------------------
// Main Store
// -------------------------------------------------
export const $canvasStore = createStore<CanvasState>(initialState)
  // -----------------------------------------------
  // Select Object
  // -----------------------------------------------
  .on(selectObject, (state, id) => ({
    ...state,
    selectedId: id, // Set the selected object's ID
  }))

  // -----------------------------------------------
  // Update Selected Object
  // -----------------------------------------------
  .on(updateSelectedObject, (state, { changes }) => {
    if (!state.selectedId) return state;

    const updatedObjects = state.canvasObjects.map((obj) =>
      obj.objectId === state.selectedId
        ? {
            ...obj,
            properties: {
              ...obj.properties,
              shapeData: {
                ...obj.properties.shapeData,
                ...changes,
              },
            },
          }
        : obj
    );

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const delta: Delta = {
      objectId: state.selectedId,
      operation: 'modify',
      changes: changes,
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      canvasObjects: updatedObjects,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      redoStack: [],
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  });

// -------------------------------------------------
// Derived Store for the currently selected object
// -------------------------------------------------
export const $selectedObject = createStore<{
  id: string | null;
  properties: any;
} | null>(null);

// Synchronize $selectedObject with $canvasStore
sample({
  clock: $canvasStore,
  source: $canvasStore,
  fn: (state) => {
    const selectedId = state.selectedId;
    if (!selectedId) return null;

    const selectedObject = state.canvasObjects.find(
      (obj) => obj.objectId === selectedId
    );

    return selectedObject
      ? { id: selectedId, properties: selectedObject.properties }
      : null;
  },
  target: $selectedObject,
});

// -------------------------------------------------
// Add Object
// -------------------------------------------------
sample({
  clock: addObject,
  source: $canvasStore,
  fn: (state, { objectId, shapeProperties }) => {
    const parentId = shapeProperties.shapeData.parentId || null;

    const newCanvasObject: CanvasObject = {
      objectId,
      parentId,
      properties: {
        shapeData: shapeProperties.shapeData,
        shapeCustomProperties: shapeProperties.shapeCustomProperties,
      },
    };

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const delta: Delta = {
      objectId,
      operation: 'add',
      changes: {
        shapeData: shapeProperties.shapeData,
        shapeCustomProperties: shapeProperties.shapeCustomProperties,
      },
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      canvasObjects: [...state.canvasObjects, newCanvasObject],
      redoStack: [],
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Remove Object
// -------------------------------------------------
sample({
  clock: removeObject,
  source: $canvasStore,
  fn: (state, objectId) => {
    const updatedCanvasObjects = state.canvasObjects.filter(
      (obj) => obj.objectId !== objectId
    );

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const delta: Delta = {
      objectId,
      operation: 'remove',
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      canvasObjects: updatedCanvasObjects,
      redoStack: [],
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Modify Object
// -------------------------------------------------
sample({
  clock: modifyObject,
  source: $canvasStore,
  fn: (state, { objectId, shapeProperties }) => {
    const index = state.canvasObjects.findIndex(
      (obj) => obj.objectId === objectId
    );
    if (index === -1) return state;

    const updatedObject: CanvasObject = {
      ...state.canvasObjects[index],
      properties: {
        shapeData: {
          ...state.canvasObjects[index].properties.shapeData,
          ...shapeProperties.shapeData,
        },
        shapeCustomProperties: {
          ...state.canvasObjects[index].properties.shapeCustomProperties,
          ...shapeProperties.shapeCustomProperties,
        },
      },
    };

    const updatedObjects = [...state.canvasObjects];
    updatedObjects[index] = updatedObject;

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const delta: Delta = {
      objectId,
      operation: 'modify',
      changes: {
        shapeData: shapeProperties.shapeData,
        shapeCustomProperties: shapeProperties.shapeCustomProperties,
      },
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      canvasObjects: updatedObjects,
      redoStack: [],
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Remove Group but Preserve Children
// -------------------------------------------------
sample({
  clock: removeGroupPreserveChildren,
  source: $canvasStore,
  fn: (state, groupId) => {
    const utils = new HierarchyUtils(state.canvasObjects);

    const group = utils.getObject(groupId);
    if (!group) return state;

    const parentId = group.parentId;
    const updatedObjects = utils.flatList.map((obj) =>
      obj.parentId === groupId ? { ...obj, parentId } : obj
    );

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const delta: Delta = {
      objectId: groupId,
      operation: 'remove',
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      canvasObjects: updatedObjects.filter((obj) => obj.objectId !== groupId),
      redoStack: [],
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Sync Objects (full set sync)
// -------------------------------------------------
sample({
  clock: syncObjects,
  source: $canvasStore,
  fn: (state, incomingObjects) => {
    // Merge existing with incoming
    const incomingIds = incomingObjects.map((obj) => obj.objectId);
    const existingButInIncoming = state.canvasObjects.filter((obj) =>
      incomingIds.includes(obj.objectId)
    );

    const finalCanvasObjects = [
      ...existingButInIncoming,
      ...incomingObjects.filter(
        (incomingObj) =>
          existingButInIncoming.findIndex(
            (obj) => obj.objectId === incomingObj.objectId
          ) === -1
      ),
    ];

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    return {
      ...state,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      canvasObjects: finalCanvasObjects,
      redoStack: [],
      deltas: [], // Assuming bulk sync doesn't generate deltas
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// trackDelta - For partial updates (collaboration)
// -------------------------------------------------
sample({
  clock: trackDelta,
  source: $canvasStore,
  fn: (state, delta) => {
    const { objectId, operation, changes } = delta;
    const updatedObjects = [...state.canvasObjects];

    const index = updatedObjects.findIndex((obj) => obj.objectId === objectId);

    switch (operation) {
      case 'add': {
        if (index === -1) {
          updatedObjects.push({
            objectId,
            parentId: changes?.shapeData?.parentId || null,
            properties: {
              shapeData: changes?.shapeData || {},
              shapeCustomProperties: changes?.shapeCustomProperties || {},
            },
          });
        }
        break;
      }

      case 'remove': {
        return {
          ...state,
          canvasObjects: updatedObjects.filter(
            (obj) => obj.objectId !== objectId
          ),
        };
      }

      case 'modify': {
        if (index !== -1) {
          updatedObjects[index] = {
            ...updatedObjects[index],
            properties: {
              shapeData: {
                ...updatedObjects[index].properties.shapeData,
                ...changes?.shapeData,
              },
              shapeCustomProperties: {
                ...updatedObjects[index].properties.shapeCustomProperties,
                ...changes?.shapeCustomProperties,
              },
            },
          };
        }
        break;
      }

      default:
        // Unknown operation, do nothing
        break;
    }

    const newVersion = state.version + 1;
    const timestamp = Date.now();

    const newDelta: Delta = {
      objectId,
      operation,
      changes,
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      canvasObjects: updatedObjects,
      undoStack: [...state.undoStack, [...state.canvasObjects]],
      redoStack: [],
      deltas: [...state.deltas, newDelta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// Apply inbound deltas from remote sources
sample({
  clock: applyDeltas,
  source: $canvasStore,
  fn: (state, inboundDeltas) => {
    let updatedObjects = [...state.canvasObjects];
    let latestVersion = state.version;

    inboundDeltas.forEach((delta) => {
      const { objectId, operation, changes, version, timestamp } = delta;

      // Ensure deltas are applied in order
      if (version <= state.version) {
        // Already applied or outdated
        return;
      }

      latestVersion = Math.max(latestVersion, version);

      const index = updatedObjects.findIndex(
        (obj) => obj.objectId === objectId
      );

      switch (operation) {
        case 'add':
          if (index === -1) {
            updatedObjects.push({
              objectId,
              parentId: changes?.shapeData?.parentId || null,
              properties: {
                shapeData: changes?.shapeData || {},
                shapeCustomProperties: changes?.shapeCustomProperties || {},
              },
            });
          }
          break;

        case 'modify':
          if (index !== -1) {
            updatedObjects[index] = {
              ...updatedObjects[index],
              properties: {
                shapeData: {
                  ...updatedObjects[index].properties.shapeData,
                  ...changes?.shapeData,
                },
                shapeCustomProperties: {
                  ...updatedObjects[index].properties.shapeCustomProperties,
                  ...changes?.shapeCustomProperties,
                },
              },
            };
          }
          break;

        case 'remove':
          updatedObjects = updatedObjects.filter(
            (obj) => obj.objectId !== objectId
          );
          break;

        default:
          break;
      }
    });

    return {
      ...state,
      canvasObjects: updatedObjects,
      deltas: [],
      version: latestVersion,
      lastUpdated: Date.now(),
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Undo
// -------------------------------------------------
sample({
  clock: undo,
  source: $canvasStore,
  fn: (state) => {
    if (state.undoStack.length === 0) return state;

    const previousState = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    const newRedoStack = [state.canvasObjects, ...state.redoStack];
    const newVersion = state.version + 1; // Increment version
    const timestamp = Date.now();

    const delta: Delta = {
      objectId: 'undo', // Special identifier for undo operation
      operation: 'undo',
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      canvasObjects: [...previousState],
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Redo
// -------------------------------------------------
sample({
  clock: redo,
  source: $canvasStore,
  fn: (state) => {
    if (state.redoStack.length === 0) return state;

    const nextState = state.redoStack[0];
    const newRedoStack = state.redoStack.slice(1);
    const newUndoStack = [...state.undoStack, state.canvasObjects];
    const newVersion = state.version + 1; // Increment version
    const timestamp = Date.now();

    const delta: Delta = {
      objectId: 'redo', // Special identifier for redo operation
      operation: 'redo',
      version: newVersion,
      timestamp,
    };

    return {
      ...state,
      canvasObjects: [...nextState],
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      deltas: [...state.deltas, delta],
      version: newVersion,
      lastUpdated: timestamp,
    };
  },
  target: $canvasStore,
});

// -------------------------------------------------
// Reset State
// -------------------------------------------------
sample({
  clock: reset,
  source: $canvasStore,
  fn: () => ({
    ...initialState,
    lastUpdated: Date.now(),
  }),
  target: $canvasStore,
});

// -------------------------------------------------
// Clear Deltas
// -------------------------------------------------
sample({
  clock: clearDeltas,
  source: $canvasStore,
  fn: (state) => ({
    ...state,
    deltas: [],
  }),
  target: $canvasStore,
});

// -------------------------------------------------
// Broadcast Deltas if there are deltas and participants > 1
// -------------------------------------------------
sample({
  clock: $canvasStore,
  source: {
    participants: $participantsStore, // store with an array or a count
    canvasStore: $canvasStore,
  },
  filter: ({ canvasStore, participants }) =>
    canvasStore.deltas.length > 0 && participants.length > 1,
  fn: ({ canvasStore }) => canvasStore.deltas,
  target: deltasReady,
});