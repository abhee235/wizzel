import React, { Children, FC, useEffect, useState } from 'react';
import { Circle } from 'fabric';
import CommentBox from './ThreadCard';
import * as fabric from 'fabric';
import NewThread from './NewThread';
import { v4 as uuidv4 } from 'uuid';
import * as Portal from '@radix-ui/react-portal';

interface ThreadOverlayProps {
  canvasObject: fabric.Canvas;
}

const ThreadOverlay: FC = ({
  canvasObject,
  triggerNewThread,
  setTriggerNewThread,
}: ThreadOverlayProps) => {
  const [showCommentOnHover, setShowCommentOnHover] = useState({
    threadId: null,
    show: false,
  });
  const [scrolling, setScrolling] = useState(false); // Track scroll state
  const [showComments, setShowComments] = useState({
    threadId: null,
    show: false,
  });
  const createPin = (x, y) => {
    return new Circle({
      left: x,
      top: y,
      radius: 5,
      fill: 'red',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
  };

  const comments = [
    {
      id: 'comment-1',
      pin: createPin(100, 150),
      x: 100,
      y: 150,
      translateX: 100,
      translateY: 150,
      text: 'This is a great start!',
      replies: [
        {
          id: '1',
          author: 'Puja Singh',
          text: 'Hey, I want to work on this idea. what is next process?',
          timeStamp: new Date(),
          reactions: [
            {
              id: 1,
              author: 'Puja Singh',
              reaction: '🙂',
              timeStamp: new Date(),
            },
            {
              id: 2,
              author: 'Abhishek',
              reaction: '🙂',
              timeStamp: new Date(),
            },
          ],
        },
        {
          id: '2',
          author: 'Abhishek Singh',
          text: 'Sure We will connect on this one.',
          timeStamp: new Date(),
          reactions: [],
        },
      ],
      author: 'Abhishek Kumar Singh',
      timestamp: '2 min ago',
      resolved: true,
      reactions: [
        {
          id: 1,
          author: 'Puja Singh',
          reaction: '🙂',
          timeStamp: new Date(),
        },
      ],
    },
    {
      id: 'comment-2',
      pin: createPin(200, 250), // Will be set when added to the canvas
      x: 200,
      y: 250,
      translateX: 200,
      translateY: 250,
      text: 'Consider revising this section.',
      replies: [],
      author: 'Bob Marley',
      timestamp: '5 min ago',
      resolved: true,
      reactions: [
        {
          id: 1,
          author: 'Puja Singh',
          reaction: '🙂',
          timeStamp: new Date(),
        },
      ],
    },
    {
      id: 'comment-3',
      pin: createPin(300, 350), // Will be set when added to the canvas
      x: 300,
      y: 350,
      translateX: 300,
      translateY: 350,
      text: 'I like this idea!',
      replies: [],
      author: 'Charlie Adams',
      timestamp: '10 min ago',
      resolved: true,
      reactions: [
        {
          id: 1,
          author: 'Puja Singh',
          reaction: '🙂',
          timeStamp: new Date(),
        },
      ],
    },
  ];

  let animationFrame;

  const handleNewComment = (comment) => {
    console.log('Adding new comment');
    setThreads((prev) => [
      ...prev,
      {
        id: uuidv4(),
        pin: createPin(comment.x, comment.y), // Will be set when added to the canvas
        x: comment.x,
        y: comment.y,
        translateX: comment.x,
        translateY: comment.y,
        text: comment.content,
        replies: [],
        author: 'Abhishek Kumar Singh',
        timestamp: '1 min ago',
        resolved: false,
        reactions: [],
      },
    ]);
  };

  const addNewReply = (threadId: string, content: string) => {
    setThreads((prev: any) => {
      return prev.map((thread: any) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            replies: [
              ...thread.replies,
              {
                id: uuidv4(),
                author: 'Abhishek Kumar Singh',
                text: content,
                timeStamp: new Date(),
                reactions: [],
              },
            ],
          };
        }
        return thread;
      });
    });
  };

  const handleResolveComment = (threadId: string) => {
    console.log('resolving comments', threadId);
    setThreads((prev) => {
      return prev.map((thread) => {
        if (thread.id === threadId) {
          return { ...thread, resolved: true };
        }
        return thread;
      });
    });
  };

  const handleEmojiClick = (id: string, type: string, e: any) => {
    console.log(id, type, e);

    setThreads((prev) => {
      return prev.map((thread) => {
        if (thread.id === id) {
          return {
            ...thread,
            reactions: [
              ...thread.reactions,
              {
                id: thread.reactions.length + 1,
                author: 'Abhishek Kumar Singh',
                reaction: e.emoji || '[]',
                timeStamp: new Date(),
              },
            ],
          };
        }
        thread.replies = thread.replies.map((reply) => {
          if (reply.id === id) {
            return {
              ...reply,
              reactions: [
                ...reply.reactions,
                {
                  id: reply.reactions.length + 1,
                  author: 'Abhishek Kumar Singh',
                  reaction: e?.emoji || '[]',
                  timeStamp: new Date(),
                },
              ],
            };
          }
          return reply;
        });
        return thread;
      });
    });
  };

  const syncWithAnimationFrame = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() =>
      syncOverlayPositions(canvasObject)
    );
  };

  const [threads, setThreads] = useState(comments);
  const syncOverlayPositions = (canvas: any) => {
    const canvasZoom = canvas.getZoom();
    const canvasViewportTransform = canvas.viewportTransform;

    setThreads((prev) =>
      prev.map((thread) => {
        const { x, y } = thread;
        const left = x * canvasZoom + canvasViewportTransform[4];
        const top = y * canvasZoom + canvasViewportTransform[5];
        //console.log(left, top);
        return { ...thread, translateX: left, translateY: top };
      })
    );
  };

  useEffect(() => {
    // const handleWheel = (e) => {
    //   console.log('panning : ', e);
    //   // Temporarily disable pointer events on overlay during wheel scroll
    //   if (e.wheelDelta !== 0) setScrolling(true);
    //   else setScrolling(false);
    //   setTimeout(() => setScrolling(false), 5000); // Re-enable after 100ms
    // };

    if (canvasObject) {
      //window.addEventListener('wheel', handleWheel);
      canvasObject.on('after:render', () => syncWithAnimationFrame());
    }
    return () => {
      //window.removeEventListener('wheel', handleWheel);
      canvasObject?.off('after:render', () => syncWithAnimationFrame());
    };
  }, [canvasObject]);

  return (
    <Portal.Root>
      <div className="absolute pointer-events-none inset-0 z-50">
        {threads
          .filter((x) => !x.resolved)
          .map((comment) => (
            <div
              key={comment.id}
              className={` ${showCommentOnHover.show && comment.id === showCommentOnHover.threadId && !showComments.show ? 'p-2 rounded-t-2xl rounded-br-2xl' : showComments.show && comment.id === showComments.threadId ? 'p-1 border-blue-600 border-2 rounded-t-full rounded-br-full' : 'p-1 rounded-t-full rounded-br-full'}   absolute bg-white border border-gray-300 shadow-md transform -translate-y-full transition-transform duration-150 ease-in-out  ${scrolling ? 'pointer-events-none' : 'pointer-events-auto'}`}
              style={{
                left: `${comment.translateX}px`,
                top: `${comment.translateY - (showCommentOnHover ? 0 : 0)}px`,
                //transform: `translate(${comment.translateX}px, ${comment.translateY}px)`,
              }}
              onMouseOver={() =>
                setShowCommentOnHover({ threadId: comment.id, show: true })
              }
              onMouseLeave={() =>
                setShowCommentOnHover({ threadId: comment.id, show: false })
              }
              onClick={() => {
                setShowComments({ threadId: comment.id, show: true });
                setShowCommentOnHover(false);
              }}
            >
              {showCommentOnHover.show &&
              comment.id === showCommentOnHover.threadId &&
              !showComments.show ? (
                <div className="flex flex-start gap-2 p-1 pr-4 w-72 ">
                  <div className="w-6">
                    <span className="avatar bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      {comment.author.charAt(0)}
                    </span>
                  </div>
                  <div className="">
                    <div className="flex flex-start gap-3">
                      <div className="text-[11px] font-medium">
                        {comment.author}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        3 hours ago
                      </div>
                    </div>

                    <p className="text-[11px]">{comment.text}</p>
                    {comment.replies.length > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        {comment.replies.length} Repl
                        {comment.replies.length == 1 ? 'y' : 'ies'}{' '}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-transparent p-0 ">
                  <span className="avatar bg-purple-500 text-white rounded-2xl w-6 h-6 flex items-center justify-center">
                    {comment.author.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          ))}
        {showComments.show && (
          <CommentBox
            thread={threads.filter((x) => x.id === showComments?.threadId)[0]}
            modal={showComments}
            setShowComments={setShowComments}
            handleResolveComment={handleResolveComment}
            handleEmojiClick={handleEmojiClick}
            addNewReply={addNewReply}
          />
        )}
        {triggerNewThread && (
          <NewThread
            canvas={canvasObject}
            setTriggerNewThread={setTriggerNewThread}
            addNewComment={handleNewComment}
          />
        )}
      </div>
    </Portal.Root>
  );
};

export default ThreadOverlay;