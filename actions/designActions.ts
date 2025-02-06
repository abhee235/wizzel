
'use server';

import prisma from '@/lib/prisma';
import { v4 as uuid4 } from 'uuid';
import { CanvasObject } from '@/types/types';

export async function saveFabricObjectForUser(userId: string, design: any) {
  const savedObject = await prisma.fabricObject.create({
    data: {
      userId, // Associate this object with a specific user
      objectId: design.objectId,
      shapeData: design.shapeData,
      shapeCustomProperties: design.shapeCustomProperties,
    },
  });

  //console.log('Fabric object saved for user:', savedObject);
}

export async function getObjectsByDesignId(designId: string) {
  const fabricObjects = await prisma.fabricObject.findMany({
    where: { designId },
  });

  const data = fabricObjects.map((obj) => {
    return {
      objectId: obj.objectId,
      properties: {
        shapeData: JSON.parse(obj.shapeData),
        shapeCustomProperties: JSON.parse(obj.shapeCustomProperties),
      },
    };
  });
  //console.log('Fabric objects for user:', fabricObjects, data);
  return data;
}

export const saveCanvasObjectsToDatabase = async (
  userId: string = 'bcf29a2c-df6a-4405-9076-85f8c4b5611f',
  canvasObjects: CanvasObject[] | [],
  designId: string // Ensure the designId is passed to link objects to a specific design
) => {
  //console.log('Starting sync to database:', userId, canvasObjects);

  try {
    // Step 1: Get all current FabricObject records for the user and design
    const existingObjects = await prisma.fabricObject.findMany({
      where: { userId, designId },
      select: { objectId: true },
    });

    // Convert to a set for quick lookups
    const objectIdsInStore = new Set(canvasObjects.map((obj) => obj.objectId));
    const objectIdsInDatabase = new Set(
      existingObjects.map((obj) => obj.objectId)
    );

    // Step 2: Identify objects to delete
    const idsToDelete = Array.from(objectIdsInDatabase).filter(
      (id) => !objectIdsInStore.has(id)
    );

    // Step 3: Mark stale objects as deleted
    if (idsToDelete.length > 0) {
      await prisma.fabricObject.updateMany({
        where: { objectId: { in: idsToDelete } },
        data: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      });
      //console.log(`Marked objects as deleted: ${idsToDelete.join(', ')}`);
    }

    //console.log('Upserting records:', canvasObjects);

    // Step 4: Upsert objects
    await Promise.all(
      canvasObjects.map(async (object) => {
        await prisma.fabricObject.upsert({
          where: { objectId: object.objectId },
          update: {
            shapeData: JSON.stringify(object.properties.shapeData),
            shapeCustomProperties: JSON.stringify(
              object.properties.shapeCustomProperties
            ),
            updatedAt: new Date(),
            isDeleted: false, // Ensure the object is marked as not deleted
          },
          create: {
            objectId: object.objectId,
            shapeData: JSON.stringify(object.properties.shapeData),
            shapeCustomProperties: JSON.stringify(
              object.properties.shapeCustomProperties
            ),
            userId: userId,
            designId: designId,
            nodeId: object.properties.shapeCustomProperties.nodeId || null, // Ensure nodeId is passed or set to null
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          },
        });
      })
    );

    console.log('Canvas objects synced with the database.');
  } catch (error) {
    console.error('Error syncing canvas objects:', error);
  }
};