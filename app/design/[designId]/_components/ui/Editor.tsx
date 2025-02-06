
import React, {
    useState,
    useEffect,
    useRef,
    memo,
    useMemo,
    useCallback,
  } from 'react';
  import Image from 'next/image';
  import io from 'socket.io-client';
  // import EmojiPanel from './EmojiPanel'; // Component for emoji sharing
  // import CommentsPanel from './CommentsPanel'; // Component for comments
  // import ActiveUsersPanel from './ActiveUsersPanel'; // Component to show active users
  // import { useCanvasEvents } from './useCanvasEvents'; // Custom hook for canvas-related events
  // import useEventListener from '@/hooks/useEventListner';
  // import useBroadcastEvent from '@/hooks/useBroadcastEvent';
  // import useIntervals from '@/hooks/useIntervals';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faArrowPointer } from '@fortawesome/free-solid-svg-icons';
  import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuShortcut,
    ContextMenuSeparator,
  } from '../../../../../components/ui/context-menu';
  import { shortcuts } from '../constants';
  import { SelectTool } from '../../public/assets/select.svg';
  import ActiveUsers from './ActiveUsers';
  import { throttle } from '@/lib/utils';
  import { dispatchAction } from '@/lib/ContextMenuActions';
  //import { $selectedObject } from '@/store/canvas-store';
  //import { useUnit } from 'effector-react';
  
  // Types for canvas state, comments, and emojis
  interface CanvasState {
    // Define the structure of your canvas state
    objects: any[];
  }
  
  interface Comment {
    id: string;
    text: string;
    timestamp: string;
  }
  
  interface Emoji {
    emoji: string;
    timestamp: string;
  }
  
  interface CursorPosition {
    id: string | null; // Each cursor has a unique ID (for each user)
    x: number; // X position of the cursor
    y: number; // Y position of the cursor
  }
  
  const Editor = ({ fabricRef, canvasRef, clientId }: any) => {
    const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(
      null
    ); // Store the user's cursor position
    const [cursors, setCursors] = useState<CursorPosition[]>([]); // Store other users' cursor positions
    const [mouseMovebroadcastData, setMouseMovebroadcastData] =
      useState<CursorPosition | null>(null); // Store broadcasted data
  
    const [contextMenuItems, setContextMenuItems] = useState(shortcuts); // State to toggle the context menu
  
    const myCursorId = useRef<string | null>(null); // Initialize as null
  
    useEffect(() => {
      if (clientId) {
        myCursorId.current = clientId; // Set myCursorId when clientId is received
      }
    }, [clientId]); // Runs when clientId changes
  
    // Track mouse movement and update local cursor state
    const handleMouseMove = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Get canvas bounding box to adjust for canvas position on the screen
      const rect = canvas.getBoundingClientRect();
      // Calculate the mouse position relative to the canvas
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      console.log('Mouse Position:', x, y); // Debugging log
      setCursorPosition((prev) => {
        return { ...prev, id: myCursorId.current, x, y };
      });
    };
  
    //Throttled update for external synchronization
    const throttledUpdateCursor = useMemo(
      () =>
        throttle((cursor) => {
          setCursorPosition(cursor);
        }, 50),
      []
    );
  
    const handleMouseLeave = () => {
      setCursorPosition((prev) => {
        return {
          id: myCursorId.current,
          x: -1, // Set x to -1 to indicate that the cursor has left the canvas
          y: -1, // Set y to -1 to indicate that the cursor has left the canvas
        }; // Reset cursor position when mouse leaves the canvas
      });
    };
  
    // useEffect(() => {
    //   //const canvas = canvasRef.current;
    //   const canvas = document.getElementById('canvas');
    //   //console.log("Canvas:", canvas);  // Debugging log
    //   if (canvas) {
    //     canvas.addEventListener('mousemove', throttledUpdateCursor);
    //   }
  
    //   return () => {
    //     // Clean up event listener when the component unmounts
    //     if (canvas) {
    //       canvas.removeEventListener('mousemove', handleMouseMove);
    //     }
    //   };
    // }, []);
  
    const handleContextMenuItemChange = useCallback((isOpen: boolean) => {
      if (!fabricRef.current) return;
      const activeObject = fabricRef.current.getActiveObjects();
      console.log('Active Objects:', activeObject);
      if (activeObject.length > 0 && isOpen) {
        setContextMenuItems(shortcuts.map((item) => ({ ...item, active: true })));
      } else {
        setContextMenuItems(shortcuts);
      }
    }, []);
  
    const handleContextMenuClick = useCallback((name: string) => {
      if (!fabricRef.current) return;
      dispatchAction({ canvas: fabricRef.current, action: name });
    }, []);
  
    // Use your custom useInterval hook to broadcast cursor position at regular intervals (e.g., every 100ms)
    // useIntervals(() => {
    //   if (cursorPosition) {
    //     //console.log('Broadcasting cursor position:', cursorPosition,cursors);
    //     setMouseMovebroadcastData(cursorPosition);
    //   }
    // }, 50); // Broadcast every 100 milliseconds
  
    //Broadcast cursor movements to other users
    // useBroadcastEvent({
    //   eventName: 'cursorMove',
    //   eventData: mouseMovebroadcastData,
    // });
  
    //Listen for cursor movements from other users
    // useEventListener<CursorPosition>({
    //   eventName: 'cursorMove',
    //   callback: (newCursorPosition) => {
    //     //console.log('Received cursor position:', newCursorPosition, myCursorId.current);  // Debugging log
    //     if (newCursorPosition.id !== myCursorId.current) {
    //       // Filter out your own cursor events
    //       setCursors((prevCursors) => {
    //         const existingCursor = prevCursors.find(
    //           (cursor) => cursor.id === newCursorPosition.id
    //         );
    //         if (existingCursor) {
    //           return prevCursors.map((cursor) =>
    //             cursor.id === newCursorPosition.id ? newCursorPosition : cursor
    //           );
    //         }
    //         return [...prevCursors, newCursorPosition];
    //       });
    //     }
    //   },
    //   currentState: mouseMovebroadcastData,
    // });
  
    //Listen for the 'removeCursor' event from the server
    // useEventListener({
    //   eventName: 'removeCursor',
    //   callback: (clientId: string) => {
    //     setCursors((prevCursors) =>
    //       prevCursors.filter((cursor) => cursor.id !== clientId)
    //     ); // Remove disconnected cursor
    //   },
    //   currentState: cursors,
    // });
  
    return (
      <ContextMenu
        onOpenChange={(isOpen) => {
          handleContextMenuItemChange(isOpen);
        }}
      >
        <ContextMenuTrigger className="mx-2">
          <div
            id="canvas"
            className="flex h-full w-full relative"
            onMouseMove={throttledUpdateCursor}
            onMouseLeave={handleMouseLeave}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
            <ActiveUsers />
            {/* Render the cursors of other users */}
            {cursors
              .filter((cursor) => cursor.x > -1 && cursor.y > -1)
              .map((cursor) => (
                <div
                  key={cursor.id}
                  style={{
                    position: 'absolute',
                    left: cursor.x,
                    top: cursor.y,
                    pointerEvents: 'none',
                  }}
                  className="flex flex-col items-start gap-1"
                >
                  <FontAwesomeIcon icon={faArrowPointer} />
                  {/* <Image
                      src={SelectTool}
                      alt={"Select Tool"}
                      width={100}
                      height={100}
                     
                      className={``}
                    /> */}
                  <span className="text-sm">{cursor.id}</span>
                </div>
              ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-60 py-2 bg-black rounded-2xl">
          {contextMenuItems
            ?.filter((x) => x.active)
            .map((shortcut) => (
              <div key={shortcut?.key}>
                {parseInt(shortcut.key) % 10 === 0 && (
                  <ContextMenuSeparator className="bg-gray-400 my-2" />
                )}
                <ContextMenuItem
                  inset
                  className="text-white focus:text-white focus:bg-[#0d99ff] py-1 text-xs px-3 rounded-md"
                  onClick={() => handleContextMenuClick(shortcut.value)}
                >
                  {shortcut.name}
                  <ContextMenuShortcut className="text-gray-300 focus:text-white text-xs">
                    {shortcut.shortcut}
                  </ContextMenuShortcut>
                </ContextMenuItem>
              </div>
            ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  };
  
  export default memo(Editor);