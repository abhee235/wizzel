
'use client';

import { useEffect, useRef, useState, memo } from 'react';
import * as Portal from '@radix-ui/react-portal';
import ThreadComposer from './ThreadComposer';

type ComposerCoords = null | { x: number; y: number };

const NewThread = ({ canvas, setTriggerNewThread, addNewComment }) => {
  const [commentState, setCommentState] = useState<
    'placing' | 'placed' | 'complete'
  >('placing');

  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  // Track the last pointer event
  const lastPointerEvent = useRef<PointerEvent>();

  useEffect(() => {
    if (!canvas) return;

    const handleNewComment = ({ scenePoint }) => {
      console.log('test comment state : ', commentState);
      setCommentState((prevState) => {
        console.log('Previous comment state:', prevState);
        if (prevState === 'placed') {
          setComposerCoords(null);
          return 'complete';
        }
        setComposerCoords({
          x: scenePoint.x,
          y: scenePoint.y,
        });
        return 'placed';
      });
    };

    console.log('resitring');
    // Add event listener for mouse clicks on the canvas
    canvas.on('mouse:up', handleNewComment);

    return () => {
      console.log('destryoing');
      canvas.off('mouse:up', handleNewComment);
    };
  }, [canvas]);

  const handleComposerSubmit = (text: string) => {
    console.log('Submitted Comment:', text);
    setComposerCoords(null);
    setCommentState('complete');
    setTriggerNewThread(false);
    addNewComment({
      content: text,
      x: composerCoords?.x,
      y: composerCoords?.y,
    });
  };

  console.log('cometns stat after change : ', commentState);

  return (
    <>
      {composerCoords && commentState === 'placed' && (
        <div
          className="absolute w-80 flex pointer-events-none gap-3 items-baseline transform -translate-y-9"
          style={{
            left: `${composerCoords?.x}px`,
            top: `${composerCoords?.y}px`,
            //transform: 'translate(-50%, -50%)',
          }}
        >
          <div className=" rounded-t-2xl rounded-br-2xl w-8 h-8  bg-white border text-center content-center p-[3px] border-gray-300">
            <div className="avatar bg-purple-500 text-white rounded-full w-6 h-6">
              A
            </div>
          </div>
          <ThreadComposer
            isNew={true}
            onSubmit={(text) => handleComposerSubmit(text)}
          />
        </div>
      )}
    </>
  );
};

export default memo(NewThread);

