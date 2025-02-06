import { createStore, createEvent } from 'effector';

// 1) Event to update a single user’s cursor
export const remoteCursorReceived = createEvent<{
  socketId: string;
  x: number;
  y: number;
  username: string;
}>();

// 2) Store holding remote cursor data
type CursorData = { x: number; y: number; username: string };
type RemoteCursorMap = Record<string, CursorData>;

export const $remoteCursors = createStore<RemoteCursorMap>({}).on(
  remoteCursorReceived,
  (state, payload) => {
    return {
      ...state,
      [payload.socketId]: {
        x: payload.x,
        y: payload.y,
        username: payload.username,
      },
    };
  }
);