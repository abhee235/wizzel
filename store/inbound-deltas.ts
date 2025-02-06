import { createStore, createEvent } from 'effector';

export const addInboundDeltas = createEvent<any[]>(); // event to push new deltas
export const clearInboundDeltas = createEvent(); // event to clear them

export const $inboundDeltas = createStore<any[]>([])
  .on(addInboundDeltas, (state, deltas) => [...state, ...deltas])
  .reset(clearInboundDeltas);