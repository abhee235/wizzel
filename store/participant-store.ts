
import { createStore, createEvent, sample } from 'effector';
import { UserActivityState } from '@/Collaboration/types';
import { removeUserVersion, updateUserVersion } from './version-store';

interface Participant {
  id: string;
  username: string;
  avatarUrl: string;
  cursorPosition?: { x: number | undefined; y: number | undefined }; // Cursor data for real-time updates
  status: UserActivityState; // User activity state
}

// Events
export const addParticipant = createEvent<Participant>(); // Add a new participant
export const updateParticipant = createEvent<
  Partial<Participant> & { id: string }
>(); // Update participant data
export const removeParticipant = createEvent<string>(); // Remove participant by ID
export const updateCursor = createEvent<{ id: string; x: number; y: number }>(); // Update cursor position
export const updateParticipantStatus = createEvent<{
  id: string;
  status: UserActivityState;
}>(); // Update participant status

// Store
export const $participantsStore = createStore<Participant[]>([])
  // Add a new participant
  .on(addParticipant, (state, participant) => {
    const existingParticipant = state.find((p) => p.id === participant.id);
    if (existingParticipant) return state;
    return [...state, participant];
  })

  // Update participant details
  .on(updateParticipant, (state, updatedParticipant) => {
    return state.map((participant) =>
      participant.id === updatedParticipant.id
        ? { ...participant, ...updatedParticipant }
        : participant
    );
  })

  // Remove a participant
  .on(removeParticipant, (state, participantId) => {
    return state.filter((participant) => participant.id !== participantId);
  })

  // Update cursor position for a participant
  .on(updateCursor, (state, { id, x, y }) => {
    return state.map((participant) =>
      participant.id === id
        ? { ...participant, cursorPosition: { x, y } }
        : participant


    );
  })

  .on(updateParticipantStatus, (state, { id, status }) => {
    return state.map((participant) =>
      participant.id === id ? { ...participant, status } : participant
    );
  });

// When a participant is added, initialize their version
sample({
  clock: addParticipant,
  fn: (participant: Participant) => ({
    userId: participant.id,
    version: 0,
    lastSynced: Date.now(),
  }),
  target: updateUserVersion,
});

sample({
  clock: removeParticipant,
  target: removeUserVersion,
});