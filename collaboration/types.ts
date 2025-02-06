// Enum for WebSocket message subtypes

export interface Participant {
    id: string;
    username: string;
    avatarUrl: string;
    cursorPosition?: { x: number | undefined; y: number | undefined }; // Optional for real-time updates
    status: UserActivityState;
  }
  
  export const SERVER_EVENTS = {
    SERVER_VOLATILE: 'server-volatile-broadcast',
    SERVER: 'server-broadcast',
    USER_FOLLOW_CHANGE: 'user-follow',
    USER_FOLLOW_ROOM_CHANGE: 'user-follow-room-change',
  };
  
  export enum WebSocketMessageType {
    INVALID_RESPONSE = 'invalid_response',
    INITIALIZE_BOARD = 'init',
    UPDATE_BOARD = 'update',
    CURSOR_POSITION = 'cursor_position',
    USER_ACTIVITY_STATUS = 'user_activity_status',
    VIEWPORT_BOUNDS = 'viewport_bounds',
  }
  
  export type PointerCoords = Readonly<{
    x: number;
    y: number;
  }>;
  
  export type Gesture = {
    pointers: Map<number, PointerCoords>;
    lastCenter: { x: number; y: number } | null;
    initialDistance: number | null;
    initialScale: number | null;
  };
  
  // Enum for user activity states
  export enum UserActivityState {
    ACTIVE = 'active',
    AWAY = 'away',
    IDLE = 'idle',
  }
  
  // Type for scene viewport bounds
  export type ViewportBounds = readonly [
    xStart: number,
    yStart: number,
    xEnd: number,
    yEnd: number,
  ];
  
  // WebSocket data structure for different message types
  export type WebSocketMessagePayload = {
    INVALID_RESPONSE: {
      type: WebSocketMessageType.INVALID_RESPONSE;
    };
    INITIALIZE_BOARD: {
      type: WebSocketMessageType.INITIALIZE_BOARD;
      payload: {
        elements: readonly [];
      };
    };
    UPDATE_BOARD: {
      type: WebSocketMessageType.UPDATE_BOARD;
      payload: {
        elements: readonly [];
      };
    };
    CURSOR_POSITION: {
      type: WebSocketMessageType.CURSOR_POSITION;
      payload: {
        socketId: string;
        userId: string;
        pointer: {
          x: number;
          y: number;
          tool: 'pointer' | 'laser';
        };
        buttonState: 'down' | 'up';
        selectedShapeIds: string[];
        username: string;
      };
    };
    VIEWPORT_BOUNDS: {
      type: WebSocketMessageType.VIEWPORT_BOUNDS;
      payload: {
        userId: string;
        username: string;
        bounds: ViewportBounds;
      };
    };
    USER_ACTIVITY_STATUS: {
      type: WebSocketMessageType.USER_ACTIVITY_STATUS;
      payload: {
        userId: string;
        activityState: UserActivityState;
        username: string;
      };
    };
  };

  