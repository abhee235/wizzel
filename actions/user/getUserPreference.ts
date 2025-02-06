
'use server';

import prisma from '@/lib/prisma';
import { UserPreferenceInput } from '@/types/types';

interface UserPreference {
  userId: string;
  designId: string;
  canvasData?: string | null;
  theme?: 'light' | 'dark' | undefined;
  zoomLevel?: number;
  lastActiveLayerId?: string | null;
  viewportTransform?: string | null;
  gridVisibility?: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export async function getUserPreferences(
  userId: string,
  designId: string
): Promise<UserPreference | null> {
  try {
    const preferences = await prisma.userPreference.findUnique({
      where: {
        userId_designId: { userId, designId }, // Composite unique constraint
      },
    });

    if (!preferences) {
      console.log(
        `No preferences found for user ${userId} and design ${designId}`
      );
      return null;
    }

    // Ensure theme is one of "light" or "dark"
    if (preferences.theme !== 'light' && preferences.theme !== 'dark') {
      preferences.theme = 'light'; // Default to "light" if theme is somehow invalid
    }

    //console.log('User preferences retrieved:', preferences);
    return preferences;
  } catch (error) {
    console.error('Error retrieving user preferences:', error);
    throw error;
  }
}