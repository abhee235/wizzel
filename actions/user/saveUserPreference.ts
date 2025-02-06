
'use server';

import prisma from '@/lib/prisma';
import { UserPreferenceInput } from '@/types/types';

export async function saveUserPreferences(input: UserPreferenceInput) {
  // Set defaults for optional fields
  const theme = input.theme ?? 'light';
  const zoomLevel = input.zoomLevel ?? 1.0;
  const gridVisibility = input.gridVisibility ?? true;

  try {
    const result = await prisma.userPreference.upsert({
      where: {
        userId_designId: { userId: input.userId, designId: input.designId }, // Use composite key without relation
      },
      update: {
        canvasData: input.canvasData,
        theme: theme,
        zoomLevel: zoomLevel,
        lastActiveLayerId: input.lastActiveLayerId,
        viewportTransform: input.viewportTransform,
        gridVisibility: gridVisibility,
        updatedAt: new Date(), // Update timestamp
      },
      create: {
        userId: input.userId,
        designId: input.designId,
        canvasData: input.canvasData,
        theme: theme,
        zoomLevel: zoomLevel,
        lastActiveLayerId: input.lastActiveLayerId,
        viewportTransform: input.viewportTransform,
        gridVisibility: gridVisibility,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Upsert successful:', result);
    return result;
  } catch (error) {
    console.error('Error upserting user preferences:', error);
    throw error;
  }
}
