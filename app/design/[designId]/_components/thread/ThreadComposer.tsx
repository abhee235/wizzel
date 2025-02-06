
import React, { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { Button } from '@/components/ui/button';

const ThreadComposer = ({ isNew = false, onSubmit }) => {
  const [hasInputValue, setHasInputValue] = React.useState(false);
  const commentInputRef = useRef();
  const [newComment, setNewComment] = useState();

  // const handleInputChange = (e) => {
  //   console.log(e.currentTa.value);
  //   setNewComment(e.target.value);
  // };
  return (
    <div
      className={`relative flex flex-col flex-1 z-auto  rounded-xl pointer-events-auto ${isNew ? 'shadow bg-white ' : ' bg-gray-100'} `}
    >
      <span
        ref={commentInputRef}
        contentEditable="true"
        className={`w-full p-2 flex-1 ${hasInputValue ? 'min-h-12' : 'min-h-10'} align-middle content-center max-h-max px-4 max-w-72 rounded-t-xl text-[13px] outline-none`}
        data-placeholder="Write a comment..."
        onInput={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.setAttribute('data-empty', 'true');
            setHasInputValue(false);
          } else {
            e.currentTarget.removeAttribute('data-empty');
            setHasInputValue(true);
          }
          setNewComment(e.currentTarget.textContent);
          //handleInputChange(e);
        }}
        onFocus={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.setAttribute('data-empty', 'true');
          }
        }}
        onBlur={(e) => {
          if (e.currentTarget.textContent.trim() === '') {
            e.currentTarget.setAttribute('data-empty', 'true');
          }
        }}
        data-empty="true"
      />
      {!hasInputValue && (
        <span className="absolute right-2 bottom-1.5 bg-gray-300 text-white rounded-full h-7 w-7 text-center content-center">
          <FontAwesomeIcon icon={faArrowUp} />
        </span>
      )}

      {hasInputValue && (
        <div
          className="flex justify-between items-center p-1 px-2"
          style={{ borderTop: '1px solid #d5d5e5' }}
        >
          <div className="flex flex-start items-center gap-[1px] ">
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={() => {}}
            >
              <span className="text-sm">&#128522;</span>
            </Button>
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={() => {}}
            >
              <span className="text-base">@</span>
            </Button>
            <Button
              variant="ghost"
              className="w-8 h-8 text-primary-grey-300 px-2"
              onClick={() => {}}
            >
              <FontAwesomeIcon icon={faImage} className="text-base" />
            </Button>
          </div>
          <button
            className=" bg-blue-500 text-white rounded-full h-6 w-6"
            onClick={() => {
              if (commentInputRef.current)
                commentInputRef.current.textContent = '';
              onSubmit(newComment);
              setNewComment('');
              setHasInputValue(false);
            }}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreadComposer;

