import React from 'react';
import { useUnit } from 'effector-react';
import { $remoteCursors } from '@/store/live-store';
import Image from 'next/image';
import { $participantsStore } from '@/store/participant-store';
import { Participant } from '@/collaboration/types';

const LiveCursor = () => {
  const participants: Participant[] = useUnit($participantsStore);
  //console.log('--renderig live cursor --------------', participants);

  return (
    <>
      {Object.entries(
        participants.filter(
          (x) =>
            x.status === 'ACTIVE' &&
            (x.cursorPosition?.x !== undefined ||
              x.cursorPosition?.y !== undefined)
        )
      ).map(([userId, participant]) => (
        <div
          key={userId}
          style={{
            position: 'absolute',
            left: participant.cursorPosition.x,
            top: participant.cursorPosition.y,
            //transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <Image
            src="/assets/select.svg"
            alt="remote cursor"
            height={16}
            width={16}
            style={{ width: 16, height: 16 }}
          />
          <div style={{ fontSize: '0.75rem', color: 'blue' }}>
            {participant.username}
          </div>
        </div>
      ))}
    </>
  );
};

export default LiveCursor;