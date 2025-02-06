//import { UserPer}
import * as fabric from 'fabric';

export function restoreUserPreferences(
  canvas: fabric.Canvas,
  preferences: any
) {
  console.log('Apply pref ----------- ', preferences);
  if (preferences) {
    // Restore viewport transform
    if (preferences.viewportTransform) {
      canvas.setViewportTransform(JSON.parse(preferences.viewportTransform));
    }

    // Restore last active layer
    if (preferences.lastActiveLayerId) {
      const lastActiveLayer = canvas
        .getObjects()
        .find(
          (obj) =>
            obj.objectId === preferences.lastActiveLayerId ||
            obj.id === preferences.lastActiveLayerId
        );
      if (lastActiveLayer) {
        canvas.setActiveObject(lastActiveLayer);
      }
    }

    // if (preferences.viewportTransform) {
    //   const vpt = canvas.viewportTransform;
    //   const viewport = JSON.parse(preferences.viewportTransform);
    //   vpt[4] = viewport[4];
    //   vpt[5] = viewport[5];
    //   canvas.setViewportTransform(vpt);
    // }
    canvas.requestRenderAll(); // Re-render the canvas with the updated transform
  }
}
