import * as fabric from 'fabric';
import { cursors } from './../canvas-cursor';
import { treatAngle } from './../canvas-cursor';
import { changeLength } from './changeObjectLength';
import { changeLayoutDimensions } from './changeLayoutDimensions';
import {
  autoLayoutSpacingControls,
  AutoLayoutSpacingControls,
  createAutoLayoutSpacingControls,
  createAutoSpacingControl,
} from './autoLayoutSpacingControls';
import { AutoLayout } from '../AutoLayout';

const controlRotation = { ml: 45, mr: 135, mt: 225, mb: 315 };
function rotationStyleHandler(eventData, control, fabricObject) {
  if (fabricObject.lockRotation) {
    return 'not-allowed';
  }

  const angle = treatAngle(fabricObject.angle);
  return cursors.rotatationCursorIcon(angle);
}

//const rotationHandler = (eventData, control, fabricObject) => {

const createRotationControl = (position, cursorAngle, actionHandler) => {
  return new fabric.Control({
    x: position.x,
    y: position.y,
    offsetX: position.offsetX,
    offsetY: position.offsetY,
    sizeX: 20,
    sizeY: 20,
    getActionName: () => 'rotate',
    cursorStyleHandler: (eventData, control, fabricObject) => {
      if (fabricObject.lockRotation) {
        return 'not-allowed';
      }

      const angle = treatAngle(fabricObject.angle + cursorAngle);
      return cursors.rotatationCursorIcon(angle);
    },
    withConnection: false,
    actionHandler: actionHandler,
    render: function (ctx, left, top, styleOverride, fabricObject) {
      ctx.save();
      ctx.translate(left, top);
      const rotationAngle = fabric.util.degreesToRadians(
        fabricObject.angle || 0
      );
      ctx.rotate(rotationAngle);
      ctx.globalCompositeOperation = 'destination-over'; // Draw behind existing shapes
      ctx.fillStyle = '#ffffff00';
      ctx.strokeStyle = '#3B82F6';
      ctx.fillRect(-10, -10, 10, 10);
      //ctx.strokeRect(-4, -4, 8, 8);

      ctx.stroke();
      ctx.restore();
    },
  });
};

const createCornerControl = (position, cursorAngle, actionHandler) => {
  return new fabric.Control({
    x: position.x,
    y: position.y,
    offsetX: 0,
    offsetY: 0,
    sizeX: 12,
    sizeY: 12,
    cursorStyleHandler: (eventData, control, fabricObject) => {
      if (fabricObject.lockRotation) {
        return 'not-allowed';
      }
      return cursors.resizeCursorIcon(
        cursorAngle + Math.floor(fabricObject.angle % 180)
      );
    },
    withConnection: false,
    actionHandler: actionHandler,
    render: function (ctx, left, top, styleOverride, fabricObject) {
      ctx.save();
      ctx.translate(left, top);
      const rotationAngle = fabric.util.degreesToRadians(
        fabricObject.angle || 0
      );
      ctx.rotate(rotationAngle);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3B82F6';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.strokeRect(-4, -4, 8, 8);
      ctx.stroke();
      ctx.restore();
    },
  });
};

export function createSideControl(side, position, cursorAngle, actionHandler) {
  return new fabric.Control({
    x: position.x,
    y: position.y,
    offsetX: 0,
    offsetY: 0,
    sizeX: position.sizeX(),
    sizeY: position.sizeY(),
    getActionName: () => 'resizing',
    cursorStyleHandler: (eventData, control, fabricObject) => {
      if (fabricObject.lockRotation) {
        return 'not-allowed';
      }

      //const angle = treatAngle(fabricObject.angle);
      //console.log('angle', cursorAngle + Math.floor(fabricObject.angle % 90));
      return cursors.resizeCursorIcon(
        cursorAngle + Math.floor(fabricObject.angle % 180)
      );
    },
    withConnection: false,
    actionHandler: actionHandler,

    render: function (ctx, left, top, styleOverride, fabricObject) {
      // Dynamically calculate control size

      const canvasZoom = fabricObject.canvas?.getZoom() || 1;
      this.sizeX =
        position.sizeX(fabricObject) *
          (side === 'mt' || side === 'mb' ? canvasZoom : 1) || 20;
      this.sizeY =
        position.sizeY(fabricObject) *
          (side === 'ml' || side === 'mr' ? canvasZoom : 1) || 20;

      // Save the canvas state
      ctx.save();

      // Translate to the control's position
      ctx.translate(left, top);

      // Apply rotation based on the object's angle
      const rotationAngle = fabric.util.degreesToRadians(
        fabricObject.angle || 0
      );
      ctx.rotate(rotationAngle);

      // Scale the control to account for zoom
      const scaleX = this.sizeX; // canvasZoom;
      const scaleY = this.sizeY; // canvasZoom;

      // Draw the control
      ctx.fillStyle = 'rgba(0, 0, 255, 0)';
      ctx.fillRect(-scaleX / 2, -scaleY / 2, scaleX, scaleY);

      // Restore the canvas state
      ctx.restore();
    },
  });
}

export const autoLayoutControls = (rect) => {
  console.log('Auto layout controls : ', rect);

  return {
    ...rect.controls,
    ...createAutoLayoutSpacingControls(rect),
    ml: createSideControl(
      'ml',
      {
        x: -0.5,
        y: 0,
        sizeX: () => 20, // Fixed width for the control
        sizeY: (obj) => rect.getScaledHeight(), // Dynamic height based on the object's scaled height
      },
      45,
      fabric.controlsUtils.changeWidth // Use the Fabric.js scaling handler
    ),
    mr: createSideControl(
      'mr',
      {
        x: 0.5,
        y: 0,
        sizeX: () => 20,
        sizeY: (obj) => rect.getScaledHeight(),
      },
      45,
      fabric.controlsUtils.changeWidth
    ),
    mt: createSideControl(
      'mt',
      {
        x: 0,
        y: -0.5,
        sizeX: (obj) => rect.getScaledWidth(),
        sizeY: () => 20,
      },
      135,
      changeLength
    ),
    mb: createSideControl(
      'mb',
      {
        x: 0,
        y: 0.5,
        sizeX: (obj) => rect.getScaledWidth(),
        sizeY: () => 20,
      },
      135,
      changeLength
    ),
    tl: createCornerControl(
      {
        x: -0.5,
        y: -0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      90,
      changeLayoutDimensions
    ),
    tr: createCornerControl(
      {
        x: 0.5,
        y: -0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      0,
      changeLayoutDimensions
    ),
    bl: createCornerControl(
      {
        x: -0.5,
        y: 0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      0,
      changeLayoutDimensions
    ),
    br: createCornerControl(
      {
        x: 0.5,
        y: 0.5,
        sizeX: (obj) => 20,
        sizeY: (obj) => 20,
      },
      90,
      changeLayoutDimensions
    ),
    mtr: createRotationControl(
      {
        x: 0.5,
        y: -0.5,
        offsetX: 10,
        offsetY: -10,
        sizeX: () => 20,
        sizeY: () => 20,
      },
      45,
      fabric.controlsUtils.rotationWithSnapping // Use the Fabric.js rotation handler
    ),
    rotationTL: createRotationControl(
      {
        x: -0.5,
        y: -0.5,
        offsetX: -10,
        offsetY: -10,
        sizeX: () => 20,
        sizeY: () => 20,
      },
      315,
      fabric.controlsUtils.rotationWithSnapping
    ),
    rotationBL: createRotationControl(
      {
        x: -0.5,
        y: 0.5,
        offsetX: -10,
        offsetY: 10,
        sizeX: () => 20,
        sizeY: () => 20,
      },
      225,
      fabric.controlsUtils.rotationWithSnapping
    ),
    rotationBR: createRotationControl(
      {
        x: 0.5,
        y: 0.5,
        offsetX: 10,
        offsetY: 10,
        sizeX: () => 20,
        sizeY: () => 20,
      },
      135,
      fabric.controlsUtils.rotationWithSnapping
    ),
  };
};
