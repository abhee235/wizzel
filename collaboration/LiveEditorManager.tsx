import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    RefObject,
  } from 'react';
  import throttle from 'lodash.throttle';
  import { useUnit } from 'effector-react';
  
  import { $canvasStore } from '@/store/canvas-store';
  import { remoteCursorReceived } from '@/store/live-store';
  import { applyDeltas, syncObjects } from '@/store/canvas-events';
  import LiveSocketManager from '@/collaboration/LiveSocketManager';
  import {
    Gesture,
    WebSocketMessagePayload,
    WebSocketMessageType,
    Participant,
  } from './types';
  
  import {
    decrypt,
    deriveKeyFromString,
    generateEncryptionKey,
  } from '@/lib/Security/encryption';
  import LiveCursor from '@/app/design/[designId]/_components/ui/LiveCursor';
  import ActiveUsers from '@/app/design/[designId]/_components/ui/ActiveUsers';
  import {
    addParticipant,
    updateParticipant,
    removeParticipant,
    $participantsStore,
    updateCursor,
    updateParticipantStatus,
  } from '@/store/participant-store';
  import { setSocketManagerInstance } from './shapeBroadcast';
  import { addInboundDeltas } from '@/store/inbound-deltas';
  import { initialBroadcast } from './initialBroadcast';
  import { CanvasObject } from '@/types/type';
  import { boardInit } from '@/store/board-init-store';
  import { $versionStore, updateUserVersion } from '@/store/version-store';
  
  export const EVENT = {
    BEFORE_UNLOAD: 'beforeunload',
    UNLOAD: 'unload',
    POINTER_MOVE: 'pointermove',
    VISIBILITY_CHANGE: 'visibilitychange',
  };
  
  export type ValueOf<T> = T[keyof T];
  
  export const IDLE_THRESHOLD = 5000; // 5s inactivity => idle
  export const ACTIVE_THRESHOLD = 3000; // 3s => considered active
  export const SYNC_FULL_SCENE_INTERVAL_MS = 10000;
  export const INITIAL_SCENE_UPDATE_TIMEOUT = 15000;
  export const LOAD_IMAGES_TIMEOUT = 3000;
  export const CURSOR_SYNC_TIMEOUT = 100;
  
  export interface BoardShape {
    id: string;
    version: number;
    status?: string;
    fileId?: string;
    [key: string]: any;
  }
  
  interface BoardProps {
    boardCore: {
      designId: string;
      cursorPosition: {
        pointer: any; // { x: number; y: number }
        button: string;
        pointersMap: Gesture['pointers'];
      };
      getAllShapes: () => BoardShape[];
      getAllShapesIncludingDeleted: () => BoardShape[];
      resetBoard: () => void;
      updateBoard: (args: {
        shapes?: BoardShape[];
        actionType?: string;
        appState?: any;
        participants?: Map<string, any>;
      }) => void;
      getBoardState: () => any;
      onUserFollow?: (cb: (payload: any) => void) => () => void;
      onScroll?: (cb: () => void) => () => void;
    };
  }
  
  interface BoardLocalState {
    errorMessage: string | null;
    dialogErrors: Record<string, boolean>;
    userAlias: string;
    activeSessionLink: string | null;
  }
  
  export function createResolvablePromise<T>() {
    let resolveFn!: (val: T) => void;
    let rejectFn!: (reason?: any) => void;
    const promise = new Promise<T>((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });
    return {
      promise,
      resolve: resolveFn,
      reject: rejectFn,
    };
  }
  
  async function generateRoomLinkData(designId: string) {
    const generateRoomId = async () => {
      const buffer = new Uint8Array(10);
      window.crypto.getRandomValues(buffer);
  
      return Array.from(buffer)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    };
  
    const roomId = designId; // or await generateRoomId();
    const roomKey = await deriveKeyFromString(designId);
    return { roomId, roomKey };
  }
  
  const LiveEditorManager: React.FC<BoardProps> = ({ boardCore }) => {
    // If your Effector store has shapes, read them:
    const [shapesData] = useUnit([syncObjects]);
  
    const [localState, setLocalState] = useState<BoardLocalState>({
      errorMessage: null,
      dialogErrors: {},
      userAlias: 'GuestUser',
      activeSessionLink: null,
    });
  
    const socketManagerRef = useRef<LiveSocketManager | null>(null);
  
    const versionRef = useRef<number>(-1);
    const participantsRef = useRef<Map<string, any>>(new Map());
  
    // 1) We'll store the local user's "idle" or "active" state
    const [myActivityState, setMyActivityState] = useState<
      'ACTIVE' | 'IDLE' | 'AWAY'
    >('ACTIVE');
  
    // 2) We'll track how many clients are in the room (based on "room-user-change")
    const [participantCount, setParticipantCount] = useState<number>(1);
  
    // Cleanup references
    const cleanupRef = useRef<null | (() => void)>(null);
    const socketInitTimerRef = useRef<number | null>(null);
    const fallbackInitHandlerRef = useRef<null | (() => void)>(null);
    const amIFirstInRoom = useRef<boolean>(false);
    const { canvasObjects } = useUnit($canvasStore); // Use Effector to manage canvas shapes
    const participants = useUnit($participantsStore); // Use Effector to manage participants
    const [
      addParticipantToStore,
      updateParticipantInStore,
      removeParticipantFromStore,
    ] = useUnit([addParticipant, updateParticipant, removeParticipant]);
  
    // Idle detection references
    const activeIntervalRef = useRef<number | null>(null);
    const idleTimeoutRef = useRef<number | null>(null);
    // Alias mapping for local usernames
    const userAliases = useRef<Record<string, string>>({}); // Store alias usernames by socketId
    const [allElements, setAllElements] = useState<CanvasObject[]>([]);
  
    // --------------------------------------------------------------------------
    // LIFECYCLE
    // --------------------------------------------------------------------------
    useEffect(() => {
      window.addEventListener(EVENT.BEFORE_UNLOAD, beforeUnload);
      window.addEventListener('online', handleNetworkStatus);
      window.addEventListener('offline', handleNetworkStatus);
      window.addEventListener(EVENT.UNLOAD, handleUnload);
      window.addEventListener(EVENT.VISIBILITY_CHANGE, handleVisibilityChange);
      window.addEventListener(EVENT.POINTER_MOVE, handlePointerMovement);
  
      // We'll do one initial local cursor update if we want.
      handleCursorUpdate({
        ...boardCore.cursorPosition,
        button: boardCore.cursorPosition.button as 'down' | 'up',
      });
  
      const relayVisibleBounds = () => {
        console.log('Relaying visible bounds...');
      };
  
      const unsubOnUserFollow = boardCore.onUserFollow?.((payload: any) => {
        socketManagerRef.current?.updateMousePosition(payload);
      });
  
      const throttledViewport = throttle(relayVisibleBounds, 200);
      const unsubScroll = boardCore.onScroll?.(() => throttledViewport());
  
      cleanupRef.current = () => {
        unsubOnUserFollow?.();
        unsubScroll?.();
      };
  
      handleNetworkStatus();
  
      return () => {
        window.removeEventListener('online', handleNetworkStatus);
        window.removeEventListener('offline', handleNetworkStatus);
        window.removeEventListener(EVENT.BEFORE_UNLOAD, beforeUnload);
        window.removeEventListener(EVENT.UNLOAD, handleUnload);
        window.removeEventListener(
          EVENT.VISIBILITY_CHANGE,
          handleVisibilityChange
        );
        window.removeEventListener(EVENT.POINTER_MOVE, handlePointerMovement);
  
        cleanupRef.current?.();
      };
    }, [boardCore]);
  
    // useEffect(() => {
    //   if (amIFirstInRoom.current && canvasObjects.length > 0) {
  
    //   }
    // }, [canvasObjects]);
  
    // --------------------------------------------------------------------------
    // NETWORK STATUS
    // --------------------------------------------------------------------------
    const handleNetworkStatus = useCallback(() => {
      const isOffline = !navigator.onLine;
      //console.log('Network status changed. Offline?', isOffline);
    }, []);
  
    // --------------------------------------------------------------------------
    // UNLOAD / CLEANUP
    // --------------------------------------------------------------------------
    const handleUnload = useCallback(() => {
      closeSocketClient({ isUnload: true });
    }, []);
  
    const beforeUnload = useCallback((e: BeforeUnloadEvent) => {
      // e.preventDefault();
      // e.returnValue = 'You have unsaved changes!';
    }, []);
  
    // --------------------------------------------------------------------------
    // SOCKET DISCONNECT
    // --------------------------------------------------------------------------
    const closeSocketClient = useCallback(
      (opts?: { isUnload: boolean }) => {
        versionRef.current = -1;
        socketManagerRef.current?.disconnect();
        socketManagerRef.current = null;
  
        // If user is leaving manually (not just reloading/unloading)
        if (!opts?.isUnload) {
          setLocalState((prev) => ({
            ...prev,
            activeSessionLink: null,
          }));
          participantsRef.current = new Map();
          boardCore.updateBoard({ participants: new Map() });
          console.log('Stopped collaboration, resumed local storage if needed.');
        }
        // Reset participantCount to 1 (just me)
        setParticipantCount(1);
      },
      [boardCore]
    );
  
    // --------------------------------------------------------------------------
    // INIT ROOM
    // --------------------------------------------------------------------------
    const initRoom = useCallback(
      async (opts: {
        fetchScene: boolean;
        roomData?: { roomId: string; roomKey: string };
      }) => {
        if (socketInitTimerRef.current) {
          clearTimeout(socketInitTimerRef.current);
        }
        if (socketManagerRef.current?.socket && fallbackInitHandlerRef.current) {
          socketManagerRef.current.socket.off(
            'connect_error',
            fallbackInitHandlerRef.current
          );
        }
  
        if (
          opts.fetchScene &&
          opts.roomData &&
          socketManagerRef.current?.socket
        ) {
          boardCore.resetBoard();
          try {
            const loadedShapes: BoardShape[] = [];
            if (loadedShapes.length > 0) {
              versionRef.current = 999;
              return { shapes: loadedShapes, scrollToContent: true };
            }
          } catch (err) {
            console.error('Error loading scene:', err);
          } finally {
            socketManagerRef.current.socketReady = true;
          }
        } else {
          if (socketManagerRef.current) {
            socketManagerRef.current.socketReady = true;
          }
        }
        return null;
      },
      [boardCore]
    );
  
    // --------------------------------------------------------------------------
    // IDLE / ACTIVE DETECTION
    // --------------------------------------------------------------------------
    const changeIdleState = useCallback((state: 'ACTIVE' | 'IDLE' | 'AWAY') => {
      //console.log('Updating idle state =>', state);
      setMyActivityState(state);
      socketManagerRef.current?.updateIdleState(state);
    }, []);
  
    const reportIdle = useCallback(() => {
      //console.log('User is idle');
      changeIdleState('IDLE');
      if (activeIntervalRef.current) {
        window.clearInterval(activeIntervalRef.current);
        activeIntervalRef.current = null;
      }
    }, [changeIdleState]);
  
    const reportActive = useCallback(() => {
      //console.log('User is active');
      changeIdleState('ACTIVE');
    }, [changeIdleState]);
  
    const handlePointerMovement = useCallback(
      throttle(() => {
        if (idleTimeoutRef.current) {
          window.clearTimeout(idleTimeoutRef.current);
        }
        idleTimeoutRef.current = window.setTimeout(reportIdle, IDLE_THRESHOLD);
  
        if (!activeIntervalRef.current) {
          activeIntervalRef.current = window.setInterval(
            reportActive,
            ACTIVE_THRESHOLD
          );
        }
      }, 200),
      [reportIdle, reportActive]
    );
  
    // --------------------------------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------------------------------
    const setErrorDialog = useCallback((msg: string | null) => {
      setLocalState((prev) => ({ ...prev, errorMessage: msg }));
    }, []);
  
    const resetErrorIndicator = useCallback((resetDialog?: boolean) => {
      if (resetDialog) {
        setLocalState((prev) => ({ ...prev, dialogErrors: {} }));
      }
    }, []);
  
    const handleNewUser = useCallback((socketId: string) => {
      const username = userAliases.current[socketId] || `User_${socketId}`;
      const Pa: Participant = {
        id: socketId,
        username,
        avatarUrl: '',
        cursorPosition: { x: undefined, y: undefined },
        status: 'ACTIVE',
      };
      addParticipantToStore(Pa); // Add to Effector store
    }, []);
  
    const handleRoomUserChange = useCallback((socketIds: string[]) => {
        // Step 1: Get the current participants from the store
        const currentParticipants = $participantsStore.getState();
    
        // Step 2: Add or update participants in the store based on the new socketIds
        socketIds.forEach((socketId) => {
          const username = userAliases.current[socketId] || `User_${socketId}`;
          if (currentParticipants.find((p) => p.id === socketId)) {
            updateParticipant({
              id: socketId,
              username,
              avatarUrl: '', // Default avatar URL or replace with a real one
              cursorPosition: { x: undefined, y: undefined }, // Default cursor position
              status: 'ACTIVE',
            });
          } else {
            const Pa: Participant = {
              id: socketId,
              username,
              avatarUrl: '',
              cursorPosition: { x: undefined, y: undefined },
              status: 'ACTIVE',
            };
            addParticipantToStore(Pa); // Add to Effector store
          }
        });
    
        // Step 3: Remove participants who are no longer in the `socketIds` list
        const participantsToRemove = currentParticipants.filter(
          (participant) => !socketIds.includes(participant.id)
        );
    
        participantsToRemove.forEach((participant) => {
          removeParticipant(participant.id);
        });
      }, []);
    
      const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
          //console.log('Tab is hidden => user AWAY');
          changeIdleState('AWAY');
    
          if (idleTimeoutRef.current) {
            window.clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = null;
          }
          if (activeIntervalRef.current) {
            window.clearInterval(activeIntervalRef.current);
            activeIntervalRef.current = null;
          }
        } else {
          //console.log('Tab is visible => user ACTIVE');
          idleTimeoutRef.current = window.setTimeout(reportIdle, IDLE_THRESHOLD);
          activeIntervalRef.current = window.setInterval(
            reportActive,
            ACTIVE_THRESHOLD
          );
          changeIdleState('ACTIVE');
        }
      }, [changeIdleState, reportActive, reportIdle]);
    
      useEffect(() => {
        document.addEventListener(EVENT.POINTER_MOVE, handlePointerMovement);
        document.addEventListener(EVENT.VISIBILITY_CHANGE, handleVisibilityChange);
        return () => {
          document.removeEventListener(EVENT.POINTER_MOVE, handlePointerMovement);
          document.removeEventListener(
            EVENT.VISIBILITY_CHANGE,
            handleVisibilityChange
          );
          if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
          if (activeIntervalRef.current)
            window.clearInterval(activeIntervalRef.current);
        };
      }, [handlePointerMovement, handleVisibilityChange]);
    
      // --------------------------------------------------------------------------
      // START / STOP SESSION
      // --------------------------------------------------------------------------
      const startSession = useCallback(
        async (roomData?: { roomId: string; roomKey: string }) => {
          console.log('startSession called', roomData);
    
          if (socketManagerRef.current?.socket) {
            console.warn('Socket already active. Not re-initializing.');
            return null;
          }
    
          // if (!localState.userAlias) {
          //   setLocalState((prev) => ({
          //     ...prev,
          //     userAlias: 'User_' + Math.floor(Math.random() * 1000),
          //   }));
          // }
    
          let rId: string;
          let rKey: string;
    
          if (roomData) {
            rId = roomData.roomId;
            rKey = roomData.roomKey;
          } else {
            const data = await generateRoomLinkData(boardCore.designId);
            rId = data.roomId;
            rKey = data.roomKey;
          }
    
          const sceneProm = createResolvablePromise<any>();
          const fallbackFn = () => {
            console.log('[LiveEditorManager] Fallback init triggered...');
            initRoom({ fetchScene: true, roomData: { roomId: rId, roomKey: rKey } })
              .then((scene) => sceneProm.resolve(scene))
              .catch((err) => {
                console.error('Fallback init error:', err);
              });
          };
          fallbackInitHandlerRef.current = fallbackFn;
    
          const { default: socketIOClient } = await import('socket.io-client');
    
          if (socketManagerRef.current?.socket) {
            socketManagerRef.current.socket.disconnect();
            socketManagerRef.current = null;
          }
    
          try {
            const socket = socketIOClient('ws://localhost:3001', {
              transports: ['websocket', 'polling'],
            });
    
            socketManagerRef.current = new LiveSocketManager({
              socket,
              roomId: rId,
              roomKey: rKey,
              stateManager: {
                getAllElements: () => shapesData.shapes || [],
                updateParticipants(pars) {
                  console.log('Participants updated from manager:', pars);
                },
                isElementSyncable(elem) {
                  return true;
                },
                getUsername: () => localState.userAlias,
                getSelectedElementIds: () => ({}),
                async saveFiles() {},
                showError(msg) {
                  console.error('[LiveSocketManager] error:', msg);
                },
              },
            });
    
            setSocketManagerInstance(socketManagerRef.current);
    
            socketManagerRef.current.socket.once('connect_error', (err: any) => {
              console.error('Socket connect_error:', err);
              fallbackFn();
            });
    
            // 3) Listen for "room-user-change" from your server
            // This event should pass us an array of socket IDs or something similar
            // We'll store the length in "participantCount"
            socketManagerRef.current.socket.on(
              'room-user-change',
              (socketIds: string[]) => {
                //console.log('[room-user-change]', socketIds);
                handleRoomUserChange(socketIds);
                setParticipantCount(socketIds.length);
              }
            );
          } catch (err: any) {
            console.error('Error init socket:', err);
            setErrorDialog(err.message);
            return null;
          }
    
          socketInitTimerRef.current = window.setTimeout(
            fallbackFn,
            INITIAL_SCENE_UPDATE_TIMEOUT
          );
    
          // Inbound data
          socketManagerRef.current.socket.on(
            'client-broadcast',
            async (encryptedData: ArrayBuffer, iv: Uint8Array) => {
              const decryptedData = await decryptPayload(iv, encryptedData, rKey);
              switch (decryptedData.type) {
                case WebSocketMessageType.INVALID_RESPONSE:
                  return;
                case WebSocketMessageType.INITIALIZE_BOARD:
                  boardInit(decryptedData.elements);
                  syncObjects(decryptedData.elements);
                case WebSocketMessageType.UPDATE_BOARD:
                  //console.log('Update board:', decryptedData);
                  console.log('shape to sync : ', decryptedData.elements);
                  //applyDeltas(decryptedData.elements);
                  addInboundDeltas(decryptedData.elements);
                  decryptedData?.elements?.forEach((element: any) => {
                    updateUserVersion({
                      userId: decryptedData.userId,
                      version: element.version,
                      lastSynced: Date.now(),
                    });
                  });
                  console.log('participant versions : ', $versionStore.getState());
                  break;
                case WebSocketMessageType.USER_ACTIVITY_STATUS:
                  //console.log('User activity status -------------:', decryptedData);
                  updateParticipantStatus({
                    id: decryptedData.userId,
                    status: decryptedData.state,
                  });
                  break;
                case WebSocketMessageType.CURSOR_POSITION:
                  const cursor_data = {
                    x: decryptedData.pointer.x,
                    y: decryptedData.pointer.y,
                    id: decryptedData.userId,
                  };
                  updateCursor(cursor_data);
    
                  break;
                default:
              }
            }
          );
    
          // If the server indicates this user is first in the room
          socketManagerRef.current.socket.on('first-in-room', async () => {
            console.log('I am the first in room');
            socketManagerRef.current?.socket.off('first-in-room');
            amIFirstInRoom.current = true;
            const ret = await initRoom({
              fetchScene: true,
              roomData: { roomId: rId, roomKey: rKey },
            });
            handleNewUser(socketManagerRef.current?.socket.id);
            sceneProm.resolve(ret);
          });
    
          socketManagerRef.current.socket.on(
            'new-user',
            async (socketId: string) => {
              handleNewUser(socketId);
              if (amIFirstInRoom.current) {
                console.log('New user joined:', socketId, $canvasStore.getState());
                //syncObjects($canvasStore.getState().canvasObjects);
                //setSocketManagerInstance(socketManagerRef.current);
                //initialBroadcast($canvasStore.getState().canvasObjects);
                socketManagerRef.current.syncBoard(
                  WebSocketMessageType.INITIALIZE_BOARD,
                  $canvasStore.getState().canvasObjects,
                  true
                );
              }
            }
          );
    
          return sceneProm.promise;
        },
        [boardCore, shapesData, initRoom, localState.userAlias, setErrorDialog]
      );
    
      // --------------------------------------------------------------------------
      // DECRYPT PAYLOAD
      // --------------------------------------------------------------------------
      const decryptPayload = async (
        iv: Uint8Array,
        encryptedData: ArrayBuffer,
        decryptionKey: string
      ): Promise<ValueOf<WebSocketMessagePayload>> => {
        try {
          const decrypted = await decrypt(decryptionKey, iv, encryptedData);
          const decodedData = new TextDecoder('utf-8').decode(
            new Uint8Array(decrypted)
          );
          return JSON.parse(decodedData);
        } catch (error) {
          window.alert('Failed to decrypt message!');
          console.error(error);
          return {
            type: WebSocketMessageType.INVALID_RESPONSE,
          };
        }
      };
    
      // --------------------------------------------------------------------------
      // STOP SESSION
      // --------------------------------------------------------------------------
      const stopSession = useCallback(() => {
        console.log('stopSession called');
        queueBroadcastAllElements.cancel();
        queueSaveToServer.cancel();
        loadImages.cancel();
    
        if (socketManagerRef.current?.socket && fallbackInitHandlerRef.current) {
          socketManagerRef.current.socket.off(
            'connect_error',
            fallbackInitHandlerRef.current
          );
        }
        closeSocketClient();
      }, [closeSocketClient]);
    
      // For auto-stop session on tab hide, re-start on focus
      // useEffect(() => {
      //   const handleVisChange = () => {
      //     if (document.hidden) {
      //       stopSession();
      //     } else {
      //       startSession();
      //     }
      //   };
      //   document.addEventListener(EVENT.VISIBILITY_CHANGE, handleVisChange);
      //   return () => {
      //     document.removeEventListener(EVENT.VISIBILITY_CHANGE, handleVisChange);
      //   };
      // }, [startSession, stopSession]);
    
      /**
       * Throttle the local pointer => broadcast to other clients.
       * We'll skip broadcasting if:
       *    (1) There's only 1 participant (me),
       * OR (2) My local state is not ACTIVE (IDLE/AWAY).
       */
      const handleCursorUpdate = throttle(
        (payload: {
          pointer: WebSocketMessagePayload['CURSOR_POSITION']['payload']['pointer'];
          button: WebSocketMessagePayload['CURSOR_POSITION']['payload']['buttonState'];
          pointersMap: Gesture['pointers'];
        }) => {
          // skip if I'm not active
          if (myActivityState !== 'ACTIVE') {
            // console.log('Skipping cursor update => I am idle/away');
            return;
          }
    
          // skip if only 1 participant in the room => me
          if (participantCount <= 1) {
            // console.log('Skipping cursor update => participantCount <= 1');
            return;
          }
    
          if (!socketManagerRef.current) return;
          socketManagerRef.current.updateMousePosition(payload);
        },
        CURSOR_SYNC_TIMEOUT
      );
    
      // --------------------------------------------------------------------------
      // BROADCASTING & SYNCING
      // --------------------------------------------------------------------------
      const broadcastAllShapes = useCallback((shapes: BoardShape[]) => {
        console.log('Broadcasting shapes to socket...');
        syncObjects(shapes);
        socketManagerRef.current?.syncBoard('UPDATE', shapes, false);
        versionRef.current = shapes.length;
      }, []);
    
      const syncShapesFromLocal = useCallback(
        (shapes: BoardShape[]) => {
          broadcastAllShapes(shapes);
          queueSaveToServer();
        },
        [broadcastAllShapes]
      );
    
      // Immediately start the session
      // Lifecycle: on mount, join the room
      useEffect(() => {
        // Start the session
        startSession();
    
        return () => {
          // On unmount or page close
          stopSession();
        };
      }, []);
    
      const queueBroadcastAllElements = throttle(() => {
        console.log('Full scene broadcast...');
        const allShapes = boardCore.getAllShapesIncludingDeleted();
        socketManagerRef.current?.syncBoard('UPDATE', allShapes, true);
        versionRef.current = allShapes.length;
      }, SYNC_FULL_SCENE_INTERVAL_MS);
    
      const queueSaveToServer = throttle(() => {
        if (socketManagerRef.current?.isSocketActive()) {
          console.log('Saving shapes to server (NO-OP).');
        }
      }, SYNC_FULL_SCENE_INTERVAL_MS);
    
      const loadImages = throttle(() => {
        console.log('Loading images (NO-OP).');
      }, LOAD_IMAGES_TIMEOUT);
    
      // --------------------------------------------------------------------------
      // RENDER
      // --------------------------------------------------------------------------
      return (
        <>
          {localState.errorMessage && (
            <div className="errorModal">
              <p>{localState.errorMessage}</p>
              <button onClick={() => setErrorDialog(null)}>Close</button>
            </div>
          )}
    
          {/* Your shapes or board rendering here */}
          <LiveCursor />
          <ActiveUsers />
    
          {/* Debug info or controls */}
          {/* <button onClick={() => startSession()}>Start Session</button>
              <button onClick={() => stopSession()}>Stop Session</button> */}
        </>
      );
    };

    export default LiveEditorManager;
