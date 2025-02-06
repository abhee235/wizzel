
import { createEvent } from 'effector';
import { CanvasObject } from '@/types/type';

interface Delta {
  objectId: string;
  operation: 'add' | 'remove' | 'modify';
  changes?: any;
}

// Events
export const addObject = createEvent<{
  objectId: string;
  shapeProperties: any;
}>();
export const removeObject = createEvent<string>();
export const modifyObject = createEvent<{
  objectId: string;
  shapeProperties: any;
}>();
export const syncObjects = createEvent<CanvasObject[]>();
export const undo = createEvent();
export const redo = createEvent();
export const reset = createEvent();
export const trackDelta = createEvent<{ objectId: string; changes: any }>();
export const clearDeltas = createEvent();
export const removeGroupPreserveChildren = createEvent<string>();

export const selectObject = createEvent<string | null>(); // Set the selected object's ID
export const updateSelectedObject = createEvent<{ changes: any }>(); // Update selected object properties

export const deltasReady = createEvent<Delta[]>();
export const applyDeltas = createEvent<any[]>();