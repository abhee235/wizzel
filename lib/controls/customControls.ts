import * as fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';
import PolygonShape from '@/lib/shapes/PolygonShape';
import Star from '@/lib/shapes/Star';

const initialRadius = 0; // Store the initial radius
const initialDistance = 0; // Store the initial distance from the center to the mouse

// mouseDownHandler to initialize radius and distance
function startRadiusAdjustment(eventData, transform) {
  //   const target = transform.target;

  //   // Store the initial radius values
  //   initialRadius = target.rx || 0;

  //   // Calculate the initial distance from the center of the rectangle to the mouse position
  //   const centerX = target.left + (target.width * target.scaleX) / 2;
  //   const centerY = target.top + (target.height * target.scaleY) / 2;
  //   const deltaX = eventData.x - centerX;
  //   const deltaY = eventData.y - centerY;

  //   // Store this initial distance as the baseline for radius calculation
  //   initialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  //   return true;
  const target = transform.target;

  // Store the initial radius
  target.__initialRx = target.rx || 0;
  target.__initialRy = target.ry || 0;

  return true;
}

function adjustInvertedCornerRadius(eventData, transform, x, y) {
  const target = transform.target;
  const scaleX = target.scaleX;
  const scaleY = target.scaleY;
  // Calculate the center of the rectangle
  const centerX = target.left + (target.width * target.scaleX) / 2;
  const centerY = target.top + (target.height * target.scaleY) / 2;

  // Calculate the top-right corner of the rectangle
  const topRightX = target.left + target.width * target.scaleX;
  const topRightY = target.top;

  // Constrain the pointer along the diagonal from center to top-right corner
  const pointerX = Math.max(centerX, Math.min(eventData.x, topRightX)); // Clamp pointerX
  const pointerY = Math.max(topRightY, Math.min(eventData.y, centerY)); // Clamp pointerY

  // Determine the diagonal progress (0: top-right corner, 1: center)
  const diagonalProgress =
    1 -
    Math.hypot(pointerX - centerX, pointerY - centerY) /
      Math.hypot(topRightX - centerX, topRightY - centerY);

  const clampedDiagonalProgress = Math.max(0, Math.min(diagonalProgress, 1)); // Clamp progress between 0 and 1

  // Calculate the maximum radius
  const maxRadius = Math.min(
    (target.width * scaleX) / 2,
    (target.height * scaleY) / 2
  );

  // Update radius based on diagonal progress
  const newRadius = clampedDiagonalProgress * maxRadius;

  // Apply the updated radius to both rx and ry for uniform rounding
  target.set({
    rx: newRadius,
    ry: newRadius,
  });

  target.setCoords(); // Update object's bounding box
  target.canvas.requestRenderAll(); // Re-render the canvas
  return true; // Indicate that the action was handled
}

// Define a single control for adjusting `rx` and `ry` uniformly
export const uniformRadiusControl = new fabric.Control({
  x: 0.5,
  y: -0.5,
  offsetY: 16,
  offsetX: -16,
  cursorStyle: 'nesw-resize',
  mouseDownHandler: startRadiusAdjustment, // Initialize radius on mouse down
  actionHandler: adjustInvertedCornerRadius,
  positionHandler: function (dim, finalMatrix, fabricObject) {
    const fabricObj = fabricObject as fabric.Rect;

    // Get the canvas zoom level
    const canvasZoom = fabricObject.canvas?.getZoom() || 1;

    // Calculate the TR corner position relative to the center
    const maxRadius = Math.min(fabricObj.width / 2, fabricObj.height / 2);
    const x = Math.max(fabricObj.width / 2 - fabricObj.rx - 16, 0); // Adjust x based on rx
    const y = -Math.max(fabricObj.height / 2 - fabricObj.ry - 16, 0); // Adjust y based on ry

    // Apply the canvas zoom and transformation matrix
    const zoomedX = x * canvasZoom;
    const zoomedY = y * canvasZoom;

    const finalX =
      finalMatrix[0] * zoomedX + finalMatrix[2] * zoomedY + finalMatrix[4];
    const finalY =
      finalMatrix[1] * zoomedX + finalMatrix[3] * zoomedY + finalMatrix[5];

    return new fabric.Point(finalX, finalY);
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    if (fabricObject.type === 'rect' || fabricObject.type === 'star') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(left, top, 5, 0, 2 * Math.PI); // Draw a small circular control
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
});

// fabric.Object.prototype.controls.infoBoxAngle = new fabric.Control({
//   x: 0,
//   y: -0.5,
//   offsetY: -40,
//   offsetX: 0,
//   cursorStyle: 'default',

//   render: function (ctx, left, top, styleOverride, fabricObject) {
//     const text = `${Math.round(fabricObject.width * fabricObject.scaleX)} \u00D7 ${Math.round(fabricObject.height * fabricObject.scaleY)}`;
//     ctx.save();

//     const padding = 6; // Padding around the text for background

//     // Set the font style before measuring
//     ctx.font = '12px Inter, sans-serif';

//     // Measure the text width
//     const textWidth = ctx.measureText(text).width;
//     const textHeight = 7; // Approximate text height (adjust if needed)
//     const cornerRadius = 5;

//     // Calculate background rectangle dimensions
//     const rectWidth = textWidth + padding * 3;
//     const rectHeight = textHeight + padding * 2;

//     // Position the rectangle background to center below the control
//     ctx.translate(left + rectWidth / 2, top);

//     ctx.beginPath();
//     ctx.moveTo(cornerRadius, 0);
//     ctx.lineTo(rectWidth - cornerRadius, 0);
//     ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
//     ctx.lineTo(rectWidth, rectHeight - cornerRadius);
//     ctx.arcTo(
//       rectWidth,
//       rectHeight,
//       rectWidth - cornerRadius,
//       rectHeight,
//       cornerRadius
//     );
//     ctx.lineTo(cornerRadius, rectHeight);
//     ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
//     ctx.lineTo(0, cornerRadius);
//     ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

//     ctx.fillStyle = '#3B82F6'; // Background color
//     ctx.fill();

//     // Draw the text on top of the background
//     ctx.fillStyle = '#ffffff'; // Text color
//     ctx.textAlign = 'center';
//     ctx.textBaseline = 'middle';
//     ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);

//     ctx.restore();
//   },
// });

export const infoBox = new fabric.Control({
  x: 0,
  y: 0.5,
  offsetY: 16,
  cursorStyle: 'default',

  render: function (ctx, left, top, styleOverride, fabricObject) {
    const text = `${parseInt(fabricObject.width * fabricObject.scaleX)} \u00D7 ${parseInt(fabricObject.height * fabricObject.scaleY)}`;
    //const text = `${Math.round(fabricObject.width)} \u00D7 ${Math.round(fabricObject.height)}`;
    ctx.save();

    const padding = 6; // Padding around the text for background

    // Set the font style before measuring
    ctx.font = '12px Inter, sans-serif';

    // Measure the text width
    const textWidth = ctx.measureText(text).width;
    const textHeight = 7; // Approximate text height (adjust if needed)
    const cornerRadius = 5;

    // Calculate background rectangle dimensions
    const rectWidth = textWidth + padding * 3;
    const rectHeight = textHeight + padding * 2;

    // Position the rectangle background to center below the control
    ctx.translate(left - rectWidth / 2, top);

    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(rectWidth - cornerRadius, 0);
    ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
    ctx.lineTo(rectWidth, rectHeight - cornerRadius);
    ctx.arcTo(
      rectWidth,
      rectHeight,
      rectWidth - cornerRadius,
      rectHeight,
      cornerRadius
    );
    ctx.lineTo(cornerRadius, rectHeight);
    ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

    ctx.fillStyle = '#3B82F6'; // Background color
    ctx.fill();

    // Draw the text on top of the background
    ctx.fillStyle = '#ffffff'; // Text color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);

    ctx.restore();
  },
});

export const label = new fabric.Control({
  x: -0.5,
  y: -0.5,
  offsetX: 10,
  offsetY: -25,
  cursorStyle: 'default',
  mouseDownHandler: function (eventData, transform, x, y) {
    const target = transform.target;
    target.set({
      label: 'Label',
    });
    const point = new fabric.Point(x, y);
    target.set({ left: point.x, top: point.y });
    target.setCoords();
    return true;
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    const text = 'Frame 1';
    //const text = `${Math.round(fabricObject.width)} \u00D7 ${Math.round(fabricObject.height)}`;
    ctx.save();

    const padding = 6; // Padding around the text for background

    // Set the font style before measuring
    ctx.font = '12px Inter, sans-serif';

    // Measure the text width
    const textWidth = ctx.measureText(text).width;
    const textHeight = 7; // Approximate text height (adjust if needed)
    const cornerRadius = 5;

    // Calculate background rectangle dimensions
    const rectWidth = textWidth + padding * 3;
    const rectHeight = textHeight + padding * 2;

    // Position the rectangle background to center below the control
    ctx.translate(left - rectWidth / 2, top);

    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(rectWidth - cornerRadius, 0);
    ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
    ctx.lineTo(rectWidth, rectHeight - cornerRadius);
    ctx.arcTo(
      rectWidth,
      rectHeight,
      rectWidth - cornerRadius,
      rectHeight,
      cornerRadius
    );
    ctx.lineTo(cornerRadius, rectHeight);
    ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

    ctx.fillStyle = 'transparent'; // Background color
    ctx.fill();

    // Draw the text on top of the background
    ctx.fillStyle = '#3B82F6'; // Text color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);

    ctx.restore();
  },
});

// Variables to store initial positions and angles
const initialMouseAngleDeg = 0;
const controlX = 0.5;
const controlY = 0;
const controlOffsetX = -16;
const controlOffsetY = 0;

function createClipPath(target, radius, startAngle, endAngle) {
  //console.log('calling clip path::.......................');
  if (target.clipPath) {
    target.canvas.remove(target.clipPath);
  }
  // Normalize angles: convert negative angles to equivalent positive angles
  startAngle = startAngle < 0 ? startAngle + 360 : startAngle;
  endAngle = endAngle < 0 ? endAngle + 360 : endAngle;

  // Convert angles from degrees to radians for path calculation
  const startAngleRad = fabric.util.degreesToRadians(startAngle);
  const endAngleRad = fabric.util.degreesToRadians(endAngle);

  // Calculate the start and end points for the arc
  const startX = radius * Math.cos(startAngleRad);
  const startY = radius * Math.sin(startAngleRad);
  const endX = radius * Math.cos(endAngleRad);
  const endY = radius * Math.sin(endAngleRad);

  // Determine if the arc is "large" (greater than 180 degrees)
  const angleDifference = Math.abs(endAngle - startAngle);
  const largeArcFlag = angleDifference > 180 ? 0 : 1;

  // Determine the sweep direction (1 for clockwise, 0 for counterclockwise)
  const sweepFlag = endAngle > startAngle ? 0 : 1;

  // Create an SVG path string for the clip path
  const clipPathString = [
    `M 0 0`, // Move to the circle's center
    `L ${startX} ${startY}`, // Line to the arc's start point
    `A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`, // Arc command
    `Z`, // Close path
  ].join(' ');

  console.log('clip path string', clipPathString);

  // Create a debug path for visualization
  // const debugPath = new fabric.Path(clipPathString, {
  //   left: target.left,
  //   top: target.top,
  //   fill: 'rgba(0, 0, 255, 0.5)', // Semi-transparent fill for debugging
  //   originX: 'center',
  //   originY: 'center',
  //   selectable: false,
  // });

  // // Store the debug path on the target for easy removal later
  // target.debugPath = debugPath;

  // // Add the debug path to the canvas for inspection
  // target.canvas.add(debugPath);
  // target.canvas.requestRenderAll();

  return new fabric.Path(clipPathString, {
    originX: 'center',
    originY: 'center',
    fill: 'rgba(255, 0, 0, 1)', // Fully opaque fill for clipping
    absolutePositioned: false,
  });
}

fabric.FabricObject.customProperties = [
  'shapeName',
  'isDeleted',
  'objectId',
  'parentId',
  'isLocked',
];

// fabric.FabricObject.prototype.toObject = (function (toObject) {
//   return function (properties) {
//     return fabric.util.o.extend(toObject.call(this, properties), {
//       isDeleted: this.isDeleted || false,
//     });
//   };
// })(fabric.FabricObject.prototype.toObject);

fabric.FabricObject.prototype.toObject = (function (toObject) {
  return function (this: fabric.Object, properties: any) {
    return {
      ...toObject.call(this, properties),
      isDeleted: this?.isDeleted || false,
      objectId: this?.objectId || uuidv4(),
      parentId: this?.parentId || null,
      shapeName: this?.shapeName || this?.type || 'shape',
      isLocked: this?.isLocked || false,
    };
  };
})(fabric.FabricObject.prototype.toObject);

// fabric.FabricObject.prototype.toObject = function (propertiesToInclude = []) {
//   const allProperties = [...propertiesToInclude, 'isDeleted'];
//   return fabric.FabricObject.prototype.toObject.call(this, allProperties);
// };

// fabric.Circle.prototype.toObject = (function (toObject) {
//   return function (propertiesToInclude = []) {
//     return toObject.call(this, [
//       ...propertiesToInclude,
//       'archStartAngle',
//       'archEndAngle',
//     ]);
//   }
// });

fabric.Circle.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude = []) {
    return {
      ...toObject.call(this, propertiesToInclude),
      archStartAngle: this.archStartAngle || 0,
      archEndAngle: this.archEndAngle || 360,
    };
  };
})(fabric.Circle.prototype.toObject);

// fabric.Circle.prototype.toObject = (function (toObject) {
//     return function (properties) {
//       return toObject.call(this, properties), {
//         isDeleted: this.isDeleted || false,
//       });
//     };
//   })(fabric.FabricObject.prototype.toObject);

export const arcMouseControl = new fabric.Control({
  x: 0.5,
  y: 0,
  // offsetX: 15, // Initial offset if needed
  // offsetY: -15, // Initial offset if needed
  cursorStyle: 'crosshair',
  //cornerSize: 10,

  positionHandler: function (dim, finalMatrix, fabricObject, currentContol) {
    const fabObj = fabricObject as any;
    //const radius = fabricObject.radius;
    const adjustedRadius = fabObj.radius * 0.7;
    const archEndAngle = fabObj?.archEndAngle ?? 0;
    const x =
      Math.cos(fabric.util.degreesToRadians(archEndAngle)) * adjustedRadius;
    const y =
      Math.sin(fabric.util.degreesToRadians(archEndAngle)) * adjustedRadius;

    // Manually apply the transformation matrix to get the final position
    const finalX = finalMatrix[0] * x + finalMatrix[2] * y + finalMatrix[4];
    const finalY = finalMatrix[1] * x + finalMatrix[3] * y + finalMatrix[5];

    //console.log('new point in postion handler arching : ', finalX, finalY);
    return new fabric.Point(finalX, finalY);
  },
  mouseDownHandler: function (eventData, transform, x, y) {
    const target = transform.target as fabric.Circle;

    const canvas = target.canvas;

    // Get the mouse position in canvas coordinates
    // const pointer = canvas.getPointer(eventData.);
    // const pointerX = pointer.x;
    // const pointerY = pointer.y;

    // Calculate the center of the circle, including the radius and scaling
    const centerX = target.left + target.radius * target.scaleX;
    const centerY = target.top + target.radius * target.scaleY;

    // Calculate delta between the pointer and the center
    const deltaX = x - centerX;
    const deltaY = y - centerY;

    // console.log(
    //   'mouse down handler',
    //   eventData.x,
    //   eventData.y,
    //   centerX,
    //   centerY,
    //   deltaX,
    //   deltaY
    // );
    // Convert initial angle from radians to degrees
    target.archStartAngle = 0;
    //  fabric.util.radiansToDegrees(
    //   Math.atan2(deltaY, deltaX)
    //);

    // return true;
    // const target = transform.target;
    // const centerX = target.left;
    // const centerY = target.top;
    // const deltaX = eventData.x - centerX;
    // const deltaY = eventData.y - centerY;

    // // Set start angle based on initial mouse position
    // target.startAngle = fabric.util.radiansToDegrees(
    //   Math.atan2(deltaY, deltaX)
    // );
    // return true;
  }, 
  // `actionHandler` to adjust `endAngle` in degrees based on the current mouse position
  actionHandler: function (eventData, transform, x, y) {
    // const target = transform.target;

    // // Calculate the current angle relative to the circle's center using clientX and clientY
    // const centerX = target.left + target.radius * target.scaleX;
    // const centerY = target.top + target.radius * target.scaleY;
    // const deltaX = x - centerX;
    // const deltaY = y - centerY;
    // target.endAngle = fabric.util.radiansToDegrees(Math.atan2(deltaY, deltaX));

    // // Ensure the end angle is visually distinct from the start angle
    // if (Math.abs(target.endAngle - target.startAngle) < 1) {
    //   target.endAngle = target.startAngle + 1;
    // }

    // // Calculate control position and offset based on the updated end angle
    // const angleRad = fabric.util.degreesToRadians(target.endAngle);
    // const reduceRad = 16; //fabric.util.degreesToRadians(16);
    // target.controlOffsetX = (target.radius - reduceRad) * Math.cos(angleRad); // Store per-instance offsetX
    // target.controlOffsetY = (target.radius - reduceRad) * Math.sin(angleRad); // Store per-instance offsetY

    // console.log(
    //   `Updated control position - offsetX: ${target.controlOffsetX}, offsetY: ${target.controlOffsetY}`
    // );

    // target.setCoords();
    // target.canvas.renderAll();
    // return true;

    const target = transform.target as fabric.Circle;
    //console.log('arching : ', target, transform);
    if (!target || !target.canvas) return;
    const centerX = target.left + target.radius * target.scaleX;
    const centerY = target.top + target.radius * target.scaleY;
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const endAngle = fabric.util.radiansToDegrees(Math.atan2(deltaY, deltaX));
    const startAngle = target?.archStartAngle;
    //if (endAngle < 0) endAngle += 360; // Convert negative angles to positive

    //console.log('mouse move handler', x, y, centerX, centerY, deltaX, deltaY);
    target.archEndAngle = endAngle;
    //console.log('end anglecheck', target.archStartAngle, target.archStartAngle);

    //Ensure the end angle is visually distinct from the start angle
    if (Math.abs(endAngle - startAngle) < 1) {
      target.archEndAngle = startAngle + 1;
    }
    target.setCoords();

    // Update the clip path to reflect the new end angle
    target.clipPath = createClipPath(
      target,
      target.radius,
      target.archStartAngle,
      target.archEndAngle
    );

    target.canvas.requestRenderAll();
    return true;
    // const target = transform.target;
    // const centerX = target.left;
    // const centerY = target.top;
    // const deltaX = x - centerX;
    // const deltaY = y - centerY;
    // target.endAngle = fabric.util.radiansToDegrees(Math.atan2(deltaY, deltaX));

    // // Update the clip path to reflect the new end angle
    // target.clipPath = createClipPath(
    //   target,
    //   target.radius,
    //   target.startAngle,
    //   target.endAngle
    // );

    // target.setCoords();
    // target.canvas.requestRenderAll();
    // return true;
  },
  // mouseUpHandler: function (eventData, transform) {
  //   const target = transform.target;
  //   console.log('mouse up handler clicp path', target);
  //   target.clipPath = createClipPath(
  //     target,
  //     target.radius,
  //     target.archstartAngle,
  //     target.archEndAngle
  //   );
  //   target.setCoords();
  //   target.canvas.requestRenderAll();
  //   return true;
  // },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    if (fabricObject.type !== 'circle') return;
    const angleDegree = fabricObject.archEndAngle || 0;
    // console.log(
    //   'end Angle offset --------------------',
    //   fabricObject.archEndAngle
    // );
    const angleRad = fabric.util.degreesToRadians(angleDegree);

    // Calculate offset for control point on the perimeter
    const offsetX = Math.cos(angleRad);
    const offsetY = Math.sin(angleRad);

    ctx.save();
    //ctx.translate(offsetX, offsetY); // Apply instance-specific translation
    ctx.beginPath();
    ctx.arc(left, top, 5, 0, 2 * Math.PI); // Draw a small circular control
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  },
});

export const polygonRadiusControl = new fabric.Control({
  x: 0, // Default position, can be adjusted dynamically
  y: -0.5, // Above the polygon by default
  offsetY: 16, // Offset vertically
  cursorStyle: 'ns-resize', // Cursor style
  mouseUpHandler: function (eventData, transform) {
    const target = transform.target;
    target.__radiusChanged = false;
  },
  mouseDownHandler: function (eventData, transform) {
    const target = transform.target;

    const center = target.getCenterPoint();
    // Store initial rx and ry values
    target.__initialRx = target.rx || 0;
    target.__initialRy = target.ry || 0;

    // Initialize the radiusChanged flag
    target.__radiusChanged = true;

    return true;
  },
  actionHandler: function (eventData, transform, x, y) {
    const target = transform.target;
    console.log('target type in polygon controls : ', target.type);
    const center = target.getCenterPoint();

    // Calculate the delta for radius adjustment
    const deltaY = Math.max(
      0,
      Math.min(center.y - eventData.y, target.height / 2)
    );
    const currentDistance = deltaY;

    // Adjust rx and ry based on delta
    const newRx = Math.max(0, target.height / 2 - deltaY);
    const newRy = Math.max(0, target.width / 2 - deltaY);

    // Check if the radius has changed
    if (newRy !== target.ry || newRx !== target.rx) {
      target.__radiusChanged = true; // Mark as changed
    }

    target.rx = newRx;
    target.ry = newRy;

    target.dirty = true;
    console.log(target.ry);
    return true;
  },
  positionHandler: function (dim, finalMatrix, fabricObject) {
    const fabricObj = fabricObject as fabric.PolygonShape;
    const canvasZoom = fabricObject.canvas.getZoom();
    // Adjust y-coordinate based on ry, height, and scaling
    const scaledHeight = fabricObj.height * fabricObj.scaleY * canvasZoom; // Include scaleY
    const scaledRy = fabricObj.ry * fabricObj.scaleY * canvasZoom; // Adjust ry for scaling

    // Calculate the y position with scaling and ensure it's within limits
    const y = Math.min(scaledRy - scaledHeight / 2 + 5, 0); // Clamp within bounds
    console.log('position : ', y);

    // Apply the transformation matrix to get the final position
    const finalX = finalMatrix[0] + finalMatrix[2] * y + finalMatrix[4];
    const finalY = finalMatrix[1] + finalMatrix[3] * y + finalMatrix[5];

    return new fabric.Point(finalX, finalY);
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    // Draw the control circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(left, top, 5, 0, 2 * Math.PI); // Draw a small circular control
    ctx.fillStyle = '#fff'; // Fill color
    ctx.strokeStyle = '#666'; // Border color
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Display the text and background only if the radius is changing
    if (fabricObject.__radiusChanged) {
      const text = `Radius ${Math.round(fabricObject.ry * fabricObject.scaleY)}`;
      const padding = 6; // Padding around the text for background
      ctx.font = '12px Inter, sans-serif';

      // Measure the text width
      const textWidth = ctx.measureText(text).width;
      const textHeight = 7; // Approximate text height (adjust if needed)
      const cornerRadius = 5;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding * 2;

      // Position the rectangle background to center below the control
      //   ctx.translate(
      //     left + fabricObject.width / 2 - rectWidth / 2 - 10,
      //     top - 30
      //   );
      ctx.translate(left + 10, top - 30);

      // Draw the rectangle with rounded corners
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(rectWidth - cornerRadius, 0);
      ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
      ctx.lineTo(rectWidth, rectHeight - cornerRadius);
      ctx.arcTo(
        rectWidth,
        rectHeight,
        rectWidth - cornerRadius,
        rectHeight,
        cornerRadius
      );
      ctx.lineTo(cornerRadius, rectHeight);
      ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

      ctx.fillStyle = '#3B82F6'; // Background color
      ctx.fill();

      // Draw the text on top of the background
      ctx.fillStyle = '#ffffff'; // Text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);
    }

    ctx.restore();
  },
});

export const polygonSideControl = new fabric.Control({
  x: 0.5, // Positioned at the second vertex
  y: -0.5,
  offsetY: 16,
  cursorStyle: 'ns-resize',
  mouseUpHandler: function (eventData, transform) {
    const target = transform.target;
    target.__sideCountChange = false;
  },
  mouseDownHandler: function (eventData, transform) {
    const target = transform.target;

    target.__startMouseY = eventData.y;
    if (target.type === 'polygonshape') {
      // Store the initial number of sides
      target.__initialSides = target.numberOfSides || 3;

      // Store the initial mouse Y position
    } else if (target.type === 'star') {
      target.__initialSpikes = target.spikes || 5;
    }

    target.__sideCountChange = false;
    return true;
  },
  actionHandler: function (eventData, transform) {
    const target = transform.target;
    const center = target.getCenterPoint();
    // Compare the current mouse Y with the start mouse Y
    const deltaY = eventData.y - target.__startMouseY;

    if (target.type === 'polygonshape') {
      // Use a threshold to prevent triggering side changes on mouseDown
      const threshold = 5;
      if (Math.abs(deltaY) < threshold) {
        return true; // Do nothing if movement is less than the threshold
      }

      // Increase or decrease the number of sides based on deltaY
      const newSides = Math.max(
        3, // Minimum 3 sides
        Math.round(target.__initialSides - deltaY / 10)
      );

      if (newSides !== target.numberOfSides) {
        target.numberOfSides = newSides;

        // Recalculate points
        const points = PolygonShape.generatePoints(
          target.numberOfSides,
          target.radius
        );
        target.points = points;
      }
    } else if (target.type === 'star') {
      // Adjust the number of spikes for stars
      const newSpikes = Math.max(
        3, // Minimum 3 spikes
        Math.round(target.__initialSpikes - deltaY / 10)
      );

      if (newSpikes !== target.spikes) {
        target.spikes = newSpikes;

        // Recalculate points for the star
        const points = Star.generatePoints(
          target.spikes,
          target.outerRadius,
          target.innerRadius,
          target.centerX,
          target.centerY
        );
        target.points = points;
      }
    }
    target.dirty = true;
    target.__sideCountChange = true;
    target.canvas.requestRenderAll();

    return true;
  },
  positionHandler: function (dim, finalMatrix, fabricObject) {
    const secondVertex =
      fabricObject.type === 'polygonshape'
        ? fabricObject.points[1]
        : fabricObject.points[2];

    if (!secondVertex) return new fabric.Point(0, 0);
    const canvasZoom = fabricObject.canvas?.getZoom();
    // Apply the object's transformations (scaling, rotation, etc.)
    const transformedX = secondVertex.x * fabricObject.scaleX * canvasZoom;
    const transformedY = secondVertex.y * fabricObject.scaleY * canvasZoom;

    // Apply the finalMatrix to get the control's global position
    const finalX =
      finalMatrix[0] * transformedX +
      finalMatrix[2] * transformedY +
      finalMatrix[4];
    const finalY =
      finalMatrix[1] * transformedX +
      finalMatrix[3] * transformedY +
      finalMatrix[5];

    return new fabric.Point(finalX, finalY);
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(left, top, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Display the text and background only if the side count is changing
    if (fabricObject.__sideCountChange) {
      const text =
        fabricObject.type === 'polygonshape'
          ? `Sides: ${Math.round(fabricObject.numberOfSides)}`
          : `Spikes: ${Math.round(fabricObject.spikes)}`;
      const padding = 6;
      ctx.font = '12px Inter, sans-serif';

      // Measure the text width
      const textWidth = ctx.measureText(text).width;
      const textHeight = 7; // Approximate text height (adjust if needed)
      const cornerRadius = 5;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding * 2;

      // Position the rectangle background to center below the control
      ctx.translate(left + 10, top - 30);

      // Draw the rectangle with rounded corners
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(rectWidth - cornerRadius, 0);
      ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
      ctx.lineTo(rectWidth, rectHeight - cornerRadius);
      ctx.arcTo(
        rectWidth,
        rectHeight,
        rectWidth - cornerRadius,
        rectHeight,
        cornerRadius
      );
      ctx.lineTo(cornerRadius, rectHeight);
      ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

      ctx.fillStyle = '#3B82F6'; // Background color
      ctx.fill();

      // Draw the text on top of the background
      ctx.fillStyle = '#ffffff'; // Text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);
    }

    ctx.restore();
  },
});

export const starInnerRadiusControl = new fabric.Control({
  x: 0.5, // Positioned at the third vertex
  y: -0.5,
  offsetY: 16,
  cursorStyle: 'nesw-resize',
  mouseUpHandler: function (eventData, transform) {
    const target = transform.target;
    target.__innerRadiusChange = false;
  },
  mouseDownHandler: function (eventData, transform) {
    const target = transform.target;

    if (target.type === 'star') {
      // Store the initial inner radius
      target.__initialInnerRadius = target.innerRadius || 0;
    }

    target.__innerRadiusChange = true;
    return true;
  },
  actionHandler: function (eventData, transform) {
    const target = transform.target;

    if (target.type === 'star') {
      const center = target.getCenterPoint();

      // Restrict changes only when the mouse is above the center
      if (eventData.y >= center.y) {
        return true; // Do nothing if the mouse is below the center
      }

      // Calculate deltaX and deltaY from the mouse position to the center
      const deltaX = Math.abs(eventData.x - center.x);
      const deltaY = Math.abs(eventData.y - center.y);

      // Clamp deltaX and deltaY to ensure they are within [0, outerRadius]
      const clampedDeltaX = Math.min(deltaX, target.outerRadius);
      const clampedDeltaY = Math.min(deltaY, target.outerRadius);

      // Calculate the new inner radius as the smaller of clampedDeltaX or clampedDeltaY
      const newInnerRadius = Math.max(
        10,
        Math.min(clampedDeltaX, clampedDeltaY)
      );

      // Update the inner radius only if it has changed
      if (newInnerRadius !== target.innerRadius) {
        target.innerRadius = newInnerRadius;

        // Recalculate the star's points based on the updated inner radius
        const points = Star.generatePoints(
          target.spikes,
          target.outerRadius,
          target.innerRadius,
          target.centerX,
          target.centerY
        );
        target.points = points;

        // Mark the star as dirty and request a canvas re-render
        target.dirty = true;
        target.__innerRadiusChange = true;
        target.canvas.requestRenderAll();
      }
    }

    return true;
  },
  positionHandler: function (dim, finalMatrix, fabricObject) {
    if (fabricObject.type !== 'star') return new fabric.Point(0, 0);

    // Access the third vertex of the star
    const secondVertex = fabricObject.points[1]; // Third vertex in the star's points array
    const maxRadius = fabricObject.outerRadius;
    const canvasZoom = fabricObject.canvas.getZoom();
    // Apply the object's transformations (scaling, rotation, etc.)
    const transformedX = Math.min(
      Math.max(secondVertex.x * fabricObject.scaleX * canvasZoom, -maxRadius),
      maxRadius
    );
    const transformedY = Math.min(
      Math.max(secondVertex.y * fabricObject.scaleY * canvasZoom, -maxRadius),
      maxRadius
    );

    // Apply the finalMatrix to get the control's global position
    const finalX =
      finalMatrix[0] * transformedX +
      finalMatrix[2] * transformedY +
      finalMatrix[4];
    const finalY =
      finalMatrix[1] * transformedX +
      finalMatrix[3] * transformedY +
      finalMatrix[5];

    return new fabric.Point(finalX, finalY);
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(left, top, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // Display the text and background only if the inner radius is changing
    if (fabricObject.__innerRadiusChange) {
      const text = `Inner Radius: ${Math.round(fabricObject.innerRadius)}`;
      const padding = 6; // Padding around the text for background
      ctx.font = '12px Inter, sans-serif';

      // Measure the text width
      const textWidth = ctx.measureText(text).width;
      const textHeight = 7; // Approximate text height (adjust if needed)
      const cornerRadius = 5;
      const rectWidth = textWidth + padding * 2;
      const rectHeight = textHeight + padding * 2;

      // Position the rectangle background to center below the control
      ctx.translate(left + 10, top - 30);

      // Draw the rectangle with rounded corners
      ctx.beginPath();
      ctx.moveTo(cornerRadius, 0);
      ctx.lineTo(rectWidth - cornerRadius, 0);
      ctx.arcTo(rectWidth, 0, rectWidth, cornerRadius, cornerRadius);
      ctx.lineTo(rectWidth, rectHeight - cornerRadius);
      ctx.arcTo(
        rectWidth,
        rectHeight,
        rectWidth - cornerRadius,
        rectHeight,
        cornerRadius
      );
      ctx.lineTo(cornerRadius, rectHeight);
      ctx.arcTo(0, rectHeight, 0, rectHeight - cornerRadius, cornerRadius);
      ctx.lineTo(0, cornerRadius);
      ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);

      ctx.fillStyle = '#3B82F6'; // Background color
      ctx.fill();

      // Draw the text on top of the background
      ctx.fillStyle = '#ffffff'; // Text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, rectWidth / 2, rectHeight / 2 + 1);
    }

    ctx.restore();
  },
});

export const labelControl = new fabric.Control({
  x: -0.5,
  y: -0.5,
  offsetX: 0,
  offsetY: -40,
  sizeX: 40,
  sizeY: 40,
  cursorStyle: 'move',
  actionHandler: function (eventData, transform, x, y) {
    const { target, offsetX, offsetY } = transform,
      newLeft = x - offsetX,
      newTop = y - offsetY,
      moveX = target.left !== newLeft,
      moveY = target.top !== newTop;
    moveX && target.set('left', newLeft);
    moveY && target.set('top', newTop);
    if (moveX || moveY) {
      target.fire('moving', {
        e: eventData,
        transform,
        pointer: new fabric.Point(x, y),
      });
      //fireEvent(MOVING, commonEventInfo(eventData, transform, x, y));
    }
    return moveX || moveY;
  },
  render: function (ctx, left, top, styleOverride, fabricObject) {
    ctx.save();
    ctx.translate(left, top);
    const rotationAngle = fabric.util.degreesToRadians(fabricObject.angle || 0);
    ctx.rotate(rotationAngle);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3B82F6';
    ctx.fillRect(-4, -4, 30, 20);
    ctx.strokeRect(-4, -4, 30, 20);
    ctx.stroke();
    ctx.restore();
  },
});