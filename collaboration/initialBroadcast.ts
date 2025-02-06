// transport/delta-broadcast.ts

import { createEffect, sample } from 'effector';
import { syncObjects } from '@/store/canvas-events';
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
export const initialBroadcast = async (store: any[]) => {
  if (!socketManager) {
    console.warn('No socket manager set, skipping broadcast');
    return;
  }

  // For example, if your manager has a function like syncBoard('UPDATE', [], deltas, false)
  await socketManager.syncBoard(
    WebSocketMessageType.INITIALIZE_BOARD,
    store,
    true
  );
};
