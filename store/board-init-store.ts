// board-init-store.ts
import { createEvent, createStore } from 'effector';
import { CanvasObject } from '@/types/type';

// Event: host data is fully loaded
export const boardInit = createEvent<CanvasObject[]>();
// Optional event to reset the flag after rendering
export const resetBoardInit = createEvent();

// Store: keep a flag and the data
interface BoardInitState {
  isInitialized: boolean;
  data: CanvasObject[];
}

export const $boardInitStore = createStore<BoardInitState>({
  isInitialized: false,
  data: [],
})
  // When the host data is in, set isInitialized + store data
  .on(boardInit, (_, payload) => ({
    isInitialized: true,
    data: payload,
  }))
  // Optionally, if you want to reset after rendering once
  .on(resetBoardInit, () => ({
    isInitialized: false,
    data: [],
  }));
