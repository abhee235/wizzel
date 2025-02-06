 // store/version-store.ts
 import { createStore, createEvent } from 'effector';
  
 interface UserVersion {
   userId: string;
   version: number;
   lastSynced: number; // Unix timestamp
 }
 
 type VersionState = Record<string, UserVersion>;
 
 const initialVersionState: VersionState = {};
 
 export const updateUserVersion = createEvent<UserVersion>();
 export const removeUserVersion = createEvent<string>(); // Remove user by ID
 
 export const $versionStore = createStore<VersionState>(initialVersionState)
   .on(updateUserVersion, (state, userVersion) => ({
     ...state,
     [userVersion.userId]: userVersion,
   }))
   .on(removeUserVersion, (state, userId) => {
     const newState = { ...state };
     delete newState[userId];
     return newState;
   });
