
'use server';

import prisma from '@/lib/prisma';
import { UpdateDesignData } from '@/types/types';

export async function updateDesign({
  designId,
  updateData,
}: {
  designId: string;
  updateData: UpdateDesignData;
}) {
  try {
    const updatedDesign = await prisma.design.update({
      where: { designId: designId }, // Update based on designId
      data: updateData, // Fields to update
    });

    console.log('Design updated successfully:', updatedDesign);
    return updatedDesign;
  } catch (error) {
    console.error('Error updating design:', error);
    throw new Error('Failed to update design.');
  }
} 
