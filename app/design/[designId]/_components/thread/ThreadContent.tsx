import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { Tooltip } from 'react-tooltip';

const ThreadContent = ({
  id,
  content,
  threadType,
  timeStamp,
  author,
  index,
  reactions,
  handleEmojiClick,
}: {
  id: string;
  threadType: string;
  content: string;
  timeStamp: Date;
  author: string;
  index: number;
  reactions: any[];
}) => {
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  console.log('reactions ------- ', reactions);
  const initial = author.charAt(0);
  return (
    <div
      key={index}
      className="group flex justify-between gap-2 mb-6 text-[13px]"
    >
      <Tooltip id="my-tooltip" />
      <div className="flex flex-start gap-2">
        <div className="w-6">
          <span className="avatar bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
            {initial}
          </span>
        </div>
        <div className="">
          <div className="flex flex-start gap-2">
            <div className="text-[13px] font-medium">{author}</div>
            <div className="text-[13px] text-gray-500">3 hours ago</div>
          </div>

          <p className="mt-2 text-[13px]">{content}</p>
          {reactions?.length > 0 && (
            <div className="group flex flex-wrap mt-3">
              {reactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant={'outline'}
                  className="w-[52px] h-8 mr-1 rounded-2xl"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={`${reaction.author}`}
                  data-tooltip-place="bottom"
                  data-tooltip-class-name="rounded"
                  data-tooltip-position-strategy="absolute"
                >
                  {reaction.reaction} 1
                </Button>
              ))}

              <Button
                variant="ghost"
                className="text-primary-grey-300 p-0 hidden h-0 w-0 ml-2 group-hover:w-6 group-hover:h-6 group-hover:inline"
                onClick={() => {
                  setShowEmojiPanel(true);
                }}
              >
                <Image
                  src={'/assets/emoji-reaction.svg'}
                  alt="image"
                  width={100}
                  height={100}
                />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="relative flex flex-col gap-1">
        <Button
          variant="ghost"
          className="w-6 h-5 text-gray-800 p-0"
          onClick={() => {}}
        >
          <FontAwesomeIcon icon={faEllipsis} size="lg" />
        </Button>
        {reactions.length === 0 && (
          <Button
            variant="ghost"
            className="text-primary-grey-300 p-0 hidden h-0 w-0 group-hover:w-6 group-hover:h-6 group-hover:inline"
            onClick={() => {
              setShowEmojiPanel(true);
            }}
          >
            <Image
              src={'/assets/emoji-reaction.svg'}
              alt="image"
              width={100}
              height={100}
              // style={{
              //   color: 'white',
              //   height: '20px !important',
              //   width: '20px !important',
              //   maxWidth: 'none',
              // }}
            />
          </Button>
        )}
        {showEmojiPanel && (
          <div className="absolute z-[50] transform translate-y-2 -translate-x-1/2 shadow-lg">
            <EmojiPicker
              onEmojiClick={(e) => {
                handleEmojiClick(id, threadType, e);
                setShowEmojiPanel(false);
              }}
              reactionsDefaultOpen={false}
              lazyLoadEmojis
              skinTonesDisabled={true}
              emojiStyle={EmojiStyle.NATIVE}
              width={320}
              height={380}
              style={{
                fontFamily: 'Inter, sans-serif',
                '--epr-emoji-size': '18px',
                '--epr-emoji-gap': '30px',
                '--epr-emoji-padding': '6px',
                '--epr-hover-bg-color': '#d3d3d3',
                '--epr-bg-color': '#ffffff',
                '--epr-text-color': '#222',
                '--epr-header-padding': '8px 8px 8px 8px',
                '--epr-search-input-height': '32px',
                '--epr-category-label-height': '36px',
                '--epr-category-label-text-size': '13px',
                '--epr-category-label-text-color': '#0F172A',
                '--epr-emoji-variation-picker-height': '20px',
                '--epr-preview-height': '40px',
                '--epr-preview-text-size': '13px',
                '--epr-category-navigation-button-size': '26px',
                '--epr-search-input-bg-color': '#e8e8e8',
                '--epr-search-input-padding': '18px 30px',
                '--epr-search-input-border-radius': '10px',
                '--epr-horizontal-padding': '12px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadContent;