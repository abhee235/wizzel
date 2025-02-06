import * as fabric from 'fabric';
import { encrypt } from '@/lib/Security/encryption';
import { SERVER_EVENTS, WebSocketMessageType } from './types';

interface StateManager {
  getAllElements(): any[];
  updateParticipants(participants: any[]): void;
  isElementSyncable(element: any): boolean;
  getUsername(): string;
  getSelectedElementIds(): Record<string, boolean>;
  saveFiles(): Promise<void>;
  showError(message: string): void;
}

/**
 * Data structure for messages we broadcast (before encryption).
 */
interface SocketData {
  type: string;
  [key: string]: any;
}

interface LiveSocketManagerParams {
  // Typically from import { io, Socket } from "socket.io-client";
  socket: any;
  roomId: string;
  roomKey: string;
  stateManager: StateManager;
}

class LiveSocketManager {
  private socket: any;
  public roomId: string;
  public roomKey: string;
  private stateManager: StateManager;
  private socketReady: boolean = false;

  /**
   * Track element version for minimal sync overhead.
   * elementVersionMap[element.id] = last synced version number
   */
  private elementVersionMap: Map<string, number> = new Map();

  constructor({
    socket,
    roomId,
    roomKey,
    stateManager,
  }: LiveSocketManagerParams) {
    this.socket = socket;
    this.roomId = roomId;
    this.roomKey = roomKey;
    this.stateManager = stateManager;

    this.initializeSocketHandlers();
  }

  /**
   * Set up basic socket event handlers.
   * (Inbound data processing is left for the Board Manager.)
   */
  private initializeSocketHandlers(): void {
    if (!this.socket) {
      throw new Error(
        'Socket instance is required to initialize LiveSocketManager'
      );
    }

    // When connected, attempt to join the specified room.
    this.socket.on('connect', () => {
      this.socket.emit('join-room', this.roomId);
      // console.log(
      //   '[LiveSocketManager] Connected to server; joining room:',
      //   this.roomId
      // );
    });

    // If your server signals a successful join or a new user joined,
    // mark the socket as ready and optionally do an initial sync.
    this.socket.on('user-joined', () => {
      console.log(
        '[LiveSocketManager] user-joined => marking socketReady, syncing board...'
      );
      this.socketReady = true;
      // Optionally broadcast a full "INITIALIZE" to new clients
      this.syncBoard('INITIALIZE', this.stateManager.getAllElements(), true);
    });

    // If participants list changes, pass to state manager.
    this.socket.on('room-participants-changed', (participants: any[]) => {
      this.stateManager.updateParticipants(participants);
    });

    // If the socket disconnects, mark it as inactive.
    this.socket.on('disconnect', () => {
      console.warn('[LiveSocketManager] Socket disconnected');
      this.socketReady = false;
    });
  }

  /**
   * Simple helper: Are we active (connected) and have valid room data?
   */
  public isSocketActive(): boolean {
    return !!(this.socketReady && this.socket && this.roomId && this.roomKey);
  }

  /**
   * Cleanly disconnect socket and reset internal state.
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.roomId = null;
      this.roomKey = null;
      this.socketReady = false;
      this.elementVersionMap.clear();
    }
  }

  /**
   * Encrypt & broadcast data to the server.
   * The server should re-broadcast to all other clients.
   */
  private async broadcastData(
    data: SocketData,
    isVolatile: boolean = false,
    specificRoomId: string = this.roomId
  ): Promise<void> {
    if (this.isSocketActive()) {
      try {
        const json = JSON.stringify(data);
        const encoded = new TextEncoder().encode(json);
        const { encryptedBuffer, iv } = await encrypt(this.roomKey, encoded);

        // By default, we emit "SERVER_EVENT" to the server,
        // which can re-emit "CLIENT_EVENT" to other clients.
        this.socket.emit(
          isVolatile ? SERVER_EVENTS.SERVER_VOLATILE : SERVER_EVENTS.SERVER,
          specificRoomId,
          encryptedBuffer,
          iv
        );
      } catch (err) {
        console.error('[LiveSocketManager] Broadcast error:', err);
        this.stateManager.showError(
          (err as Error).message || 'Unknown broadcast error'
        );
      }
    }
  }

  /**
   * Syncs board elements with other clients.
   * If syncType === 'INITIALIZE', must set syncAll=true for full sync.
   */
  public async syncBoard(
    syncType:
      | WebSocketMessageType.UPDATE_BOARD
      | WebSocketMessageType.INITIALIZE_BOARD,
    elements: any,
    syncAll: boolean = false
  ): Promise<void> {
    if (syncType === WebSocketMessageType.INITIALIZE_BOARD && !syncAll) {
      throw new Error('syncAll must be true when initializing the board');
    }

    if (this.socket?.id) {
      //Need to get dta from store and then broadcast it to cleint

      // Broadcast with a type (e.g. 'INITIALIZE', 'UPDATE')
      const payload: SocketData = {
        type: syncType,
        userId: this.socket.id,
        elements: elements,
      };

      await this.broadcastData(payload);
    }
  }

  /**
   * Update the user's idle state across the session.
   */
  public updateIdleState(idleState: string): void {
    if (this.socket?.id) {
      const payload: SocketData = {
        type: WebSocketMessageType.USER_ACTIVITY_STATUS,
        state: idleState,
        userId: this.socket.id,
        username: this.stateManager.getUsername(),
      };
      this.broadcastData(payload, true);
    }
  }

  /**
   * Update the user's mouse position and selection.
   */
  public updateMousePosition({
    pointer,
    button,
  }: {
    pointer: { x: number; y: number };
    button?: string;
  }): void {
    if (this.socket?.id) {
      const payload: SocketData = {
        type: WebSocketMessageType.CURSOR_POSITION,
        userId: this.socket.id,
        pointer,
        button: button || 'up',
        selectedElements: this.stateManager.getSelectedElementIds(),
        username: this.stateManager.getUsername(),
      };
      //console.log('[LiveSocketManager] Sending cursor position:', payload);
      this.broadcastData(payload, true);
    }
  }

  /**
   * Notify other clients about the current viewport or visible region.
   */
  public shareVisibleBounds(bounds: any): void {
    if (this.socket?.id) {
      const payload: SocketData = {
        type: 'VISIBLE_SCENE_BOUNDS',
        userId: this.socket.id,
        username: this.stateManager.getUsername(),
        bounds,
      };
      this.broadcastData(payload, true);
    }
  }

  // Optional: If you want to throttle file uploads, you can define a method here:
  // public scheduleFileUpload = throttle(async () => {
  //   try {
  //     await this.stateManager.saveFiles();
  //   } catch (error) {
  //     console.error('[LiveSocketManager] File upload failed:', error);
  //     this.stateManager.showError(error.message);
  //   }
  // }, 3000);
}

export default LiveSocketManager;
