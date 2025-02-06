
'use server';

import prisma from '@/lib/prisma';

export const getDesignsByUserId = async (
  userId: string = 'bcf29a2c-df6a-4405-9076-85f8c4b5611f'
) => {
  try {
    const designs = await prisma.design.findMany({
      where: {
        userId,
      },
    });
    //console.log('Designs fetched', designs);
    return designs;
  } catch (error) {
    console.log('Error fetching designs', error);
  }
};

export const getDesignDetails = async (designId: string) => {
  try {
    const details = await prisma.design.findUnique({
      where: {
        designId: designId,
      },
    });
    //console.log('design details : ', details);
    return details;
  } catch (error) {
    console.log('Error fetching design details');
  }
};
