import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/ui/button';
import {
  faArrowUp,
  faEllipsis,
  faImagePortrait,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import ThreadContent from './ThreadContent';

import { faCheckCircle, faImage } from '@fortawesome/free-regular-svg-icons';
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card';
import ThreadComposer from './ThreadComposer';
import Image from 'next/image';

interface Thread {
  id: string;
  text: string;
  author: string;
  translateX: number;
  translateY: number;
  replies: { id: number; text: string; author: string; reactions: any[] }[];
  reactions: any[];
}

interface CommentBoxProps {
  thread: Thread;
  modal: boolean;
  setShowComments: (show: { show: boolean }) => void;
  handleResolveComment: (id: number) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  thread,
  modal,
  setShowComments,
  handleResolveComment,
  handleEmojiClick,
  addNewReply,
}) => {
  const cardRef = useRef();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleCommentClose = () => {
    console.log('closing comment box.');
    setShowComments({ show: false });
  };

  const handleNewReply = (text: string) => {
    addNewReply(thread.id, text);
  };

  useEffect(() => {
    if (!cardRef.current) return;
    //console.log('card height : ', cardRef.current.clientHeight);
    const adjustPosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const cardWidth = 350; // Width of the card
      const cardHeight = cardRef.current.clientHeight; // Approx height of the card
      const offsetX = 50; // Initial X offset
      const offsetY = -50; // Initial Y offset

      let newX = thread.translateX + offsetX;
      let newY = thread.translateY + offsetY;

      // Ensure the box stays inside the viewport horizontally
      if (newX + cardWidth > viewportWidth) {
        newX = viewportWidth - cardWidth - 10; // Adjust to fit within the viewport with padding
      } else if (newX < 0) {
        newX = 10; // Padding on the left
      }

      // Ensure the box stays inside the viewport vertically
      if (newY + cardHeight > viewportHeight) {
        newY = viewportHeight - cardHeight - 80; // Adjust to fit within the viewport with padding
      } else if (newY < 0) {
        newY = 10; // Padding at the top
      }

      setOffset({
        x: newX - thread.translateX - offsetX,
        y: newY - thread.translateY - offsetY,
      });
    };

    adjustPosition();

    // Optionally, listen for window resize to adjust dynamically
    window.addEventListener('resize', adjustPosition);
    return () => window.removeEventListener('resize', adjustPosition);
    //}, [thread.translateX, thread.translateY]);
  }, [cardRef]);

  return (
    <Card
      ref={cardRef}
      className="absolute w-[350px] shadow-lg border z-50 pointer-events-auto"
      style={{
        left: `${thread.translateX + 50 + offset.x}px`,
        top: `${thread.translateY - 50 + offset.y}px`,
      }}
    >
      <CardHeader className="p-1 px-4">
        <div className="flex justify-between items-center">
          <div className="text-[13px] font-medium">Comment</div>
          <div className="flex flex-start items-center gap-[1px]">
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={() => {}}
            >
              <FontAwesomeIcon icon={faEllipsis} size="xl" />
            </Button>
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={() => {
                handleResolveComment(thread.id);
                handleCommentClose();
              }}
            >
              <FontAwesomeIcon icon={faCheckCircle} size="lg" />
            </Button>
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={handleCommentClose}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="border-b mb-4"></div>
      <CardContent className="p-0 px-4">
        <ThreadContent
          id={thread.id}
          threadType={'comment'}
          content={thread.text}
          author={thread.author}
          index={thread.id}
          timeStamp={new Date()}
          handleEmojiClick={handleEmojiClick}
          reactions={thread.reactions}
        />
        {thread.replies.map((item) => (
          <ThreadContent
            id={item.id}
            threadType={'reply'}
            key={item.id}
            content={item.text}
            author={item.author}
            index={item.id}
            timeStamp={new Date()}
            handleEmojiClick={handleEmojiClick}
            reactions={item.reactions}
          />
        ))}
      </CardContent>
      <div className="px-4 pb-4">
        {/* Input Field */}
        <div className="flex items-baseline gap-2">
          <div className="avatar bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            A
          </div>

          <ThreadComposer onSubmit={handleNewReply} />
        </div>
      </div>
    </Card>
  );
};

export default CommentBox;
