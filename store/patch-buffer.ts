
import { createEvent, createStore, sample } from 'effector';
import { $canvasStore } from './canvas-store';

// Events
export const addPatch = createEvent<{ objectId: string; changes: any }>();
export const clearPatchBuffer = createEvent();

// Store
export const $patchBuffer = createStore<
  Array<{ objectId: string; changes: any }>
>([])   
  .on(addPatch, (state, patch) => [...state, patch])
  .reset(clearPatchBuffer);

sample({
  clock: addPatch, // Triggered when a patch is added
  source: $canvasStore,
  fn: (state, { objectId, changes }) => {
    const index = state.canvasObjects.findIndex(
      (obj) => obj.objectId === objectId
    );

    if (index === -1) return state;

    const updatedObjects = [...state.canvasObjects];
    updatedObjects[index] = {
      ...updatedObjects[index],
      properties: {
        shapeData: {
          ...updatedObjects[index].properties.shapeData,
          ...changes.shapeData,
        },
        shapeCustomProperties: {
          ...updatedObjects[index].properties.shapeCustomProperties,
          ...changes.shapeCustomProperties,
        },
      },
    };

    return {
      ...state,
      canvasObjects: updatedObjects,
    };
  },
  target: $canvasStore,
});