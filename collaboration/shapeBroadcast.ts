import { createEffect, sample } from 'effector';
import { deltasReady, clearDeltas } from '@/store/canvas-events';
import { WebSocketMessageType } from './types';

// We'll store the socket manager reference in a simple variable
// or you can store it in an Effector store if you prefer:
let socketManager: any = null;

/**
 * Call this once you have your manager from your React code
 * or wherever you create it.
 */
export function setSocketManagerInstance(manager: any) {
  socketManager = manager;
}

// The effect that actually sends deltas over the network
export const broadcastDeltasFx = createEffect<any[], void>(async (deltas) => {
  if (!socketManager) {
    console.warn('No socket manager set, skipping broadcast');
    return;
  }

  // For example, if your manager has a function like syncBoard('UPDATE', [], deltas, false)
  console.log('Broadcasting deltas:', deltas);
  await socketManager.syncBoard(
    WebSocketMessageType.UPDATE_BOARD,
    deltas,
    false
  );
});

/**
 * Connect deltasReady => broadcastDeltasFx.
 * Then after broadcast, call clearDeltas.
 */
sample({
  clock: deltasReady,
  target: broadcastDeltasFx,
});

// Clear the deltas once the effect is done
sample({
  clock: broadcastDeltasFx.done,
  target: clearDeltas,
});
