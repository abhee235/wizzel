import React, { useEffect, useState, memo } from 'react';
//import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarStack } from '@/components/ui/avatar-stack';
//import useUserInformation from '@/hooks/useUserInformation';
//import { $remoteCursors } from '@/store/live-store';
import { useUnit } from 'effector-react';
import { $participantsStore } from '@/store/participant-store';

const ActiveUsers = () => {
  //const clients = useUserInformation();
  const participants = useUnit($participantsStore);
  //console.log('Total clients', participants);
  const [activeClients, setActiveClients] = useState<
    { image: string; name: string }[]
  >([]);

  useEffect(() => {
    // Ensure clients is not empty before proceeding
    if (Object.keys(participants).length === 0) return;

    // Map over the client IDs and create the activeClients array
    const updatedActiveClients = Object.values(participants).map(
      (participant) => ({
        image: '',
        name: participant.username,
      })
    );

    setActiveClients(updatedActiveClients);
  }, [participants]);

  return (
    <div className="absolute top-5 right-10 transform -translate-x/2">
      <AvatarStack avatars={activeClients} />
    </div>
    //   <Avatar>
    //   <AvatarFallback className='bg-purple-300' >AS</AvatarFallback>
    //   <AvatarFallback className='bg-green-300' >SP</AvatarFallback>
    // </Avatar>
  );
};

export default memo(ActiveUsers);

