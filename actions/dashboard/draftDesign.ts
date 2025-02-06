'use server';

import { DesignInput, DesignObjectstInput, DesignStatus } from '@/types/types';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const draftDesign = async ({
  designId,
  userId,
  title,
  description,
}: DesignInput) => {
  try {
    const design = await prisma.design.create({
      data: {
        userId: 'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
        status: DesignStatus.DRAFT,
        title,
        designId,
        description,
      },
    });

    if (!design) {
      throw new Error('Error creating design');
    }
  } catch (error) {
    console.log('Error creating design', error);
  }

  redirect(`/designs/${designId}`);
};
