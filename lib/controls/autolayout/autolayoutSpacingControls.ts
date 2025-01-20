import * as fabric from 'fabric';
import { AutoLayout } from '../AutoLayout'; // or your path
import { AutoLayoutStrategy } from '../AutoLayoutStrategy';
import { LAYOUT_TYPE_IMPERATIVE } from '../FrameLayoutManager';
import { drawInfoBox } from './drawInfoBox';
import { createSVGInfoBox } from './drawSVGInfoBox';
import { cursors } from '../canvas-cursor';
import { mergeSVGs } from '../mergeSVG';

/**
 * Creates an array of spacing controls between each consecutive pair of objects
 * in the given AutoLayout container.
 *
 * @param autoLayout The container (Fabric group or subclass) using AutoLayout
 * @returns A dictionary of spacing controls, keyed by "spacing-<index>".
 */
export function createAutoLayoutSpacingControls(autoLayout: AutoLayout) {
  const objects = autoLayout.getObjects();
  if (objects.length < 2) {
    return {}; // no spacing controls if only one or zero objects
  }

  const direction = autoLayout.layoutManager?.strategy.layoutDirection;
  const controls: Record<string, fabric.Control> = {};

  // We'll read the bounding box of the entire container if we need cross-axis centering
  const containerBBox = autoLayout;

  for (let i = 1; i < objects.length; i++) {
    const prevObj = objects[i - 1];
    const currObj = objects[i];

    // We'll create a new Control for the gap between prevObj and currObj
    const controlName = `spacing-${i}`;
    const spacingCtrl = buildSpacingControl(
      direction,
      prevObj,
      currObj,
      containerBBox
    );

    controls[controlName] = spacingCtrl;
  }

  return controls;
}

const prev_cursor_position = { x: 0, y: 0 };
let prev_horizontal_gap = 0;
let prev_vertical_gap = 0;
let isControlActivated = false;
let isVerticalSpacer = false;
function buildSpacingControl(
  direction: string | 'row',
  prevObj: fabric.Object,
  currObj: fabric.Object,
  containerBBox: fabric.FabricObject
): fabric.Control {
  // We'll store the midpoint in canvas coords, then transform to local in `positionHandler`.

  const layout = containerBBox as AutoLayout;
  const spacerWidth = currObj.left - prevObj.left - prevObj.width;
  //const direction = layout.layoutManager.strategy.layoutDirection;
  return new fabric.Control({
    // By default, top-left origin for a control is (0, 0), so we rely on positionHandler to place it.
    x: 0.5,
    y: 0.5,
    sizeX: 15,
    sizeY: 15,
    cursorStyle: isVerticalSpacer ? 'col-resize' : 'row-resize',
    positionHandler: function (dim, finalMatrix, fabricObject) {
      const { spacerCenter } = computeSpacerCoords(
        direction,
        prevObj,
        currObj,
        containerBBox
      );

      if (!spacerCenter) return new fabric.Point(0, 0);
      const canvasZoom = fabricObject.canvas?.getZoom() || 1;
      const newPoint = new fabric.Point(
        spacerCenter.x * canvasZoom,
        spacerCenter.y * canvasZoom
      );
      const transformPoint = newPoint.transform(finalMatrix);
      //console.log('transformPoint', transformPoint, spacerCenter);
      return transformPoint;
    },
    mouseDownHandler: function (eventData, transform, x, y) {
      prev_cursor_position.x = eventData.clientX;
      prev_cursor_position.y = eventData.clientY;
      prev_horizontal_gap =
        transform.target.layoutManager.strategy.horizontalGap ?? 0;
      prev_vertical_gap =
        transform.target.layoutManager.strategy.verticalGap ?? 0;
      isControlActivated = true;
    },
    actionHandler: function (eventData, transform, x, y) {
      const target = transform.target as AutoLayout;
      const { spacerDirection } =
        computeSpacerCoords(direction, prevObj, currObj, containerBBox) ||
        'row';
      //console.log('transformedPoint', x, y);
      // The layout's center in canvas coordinates
      const containerCenterX = target.getCenterPoint().x;

      let deltaX = 0,
        deltaY = 0,
        oldDist = 0,
        newDist = 0,
        sign = 1,
        rawDelta = 0;
      console.log(
        'moues move detection : ',
        prev_cursor_position.x,
        x,
        containerCenterX,
        eventData.clientX
        //eventData
      );
      if (spacerDirection === 'row') {
        //Decide if we are moving outward (increase gap) or inward (decrease gap)
        oldDist = Math.abs(prev_cursor_position.x - containerCenterX);
        newDist = Math.abs(eventData.clientX - containerCenterX);
      } else if (spacerDirection === 'column') {
        oldDist = Math.abs(prev_cursor_position.y - containerCenterX);
        newDist = Math.abs(eventData.clientY - containerCenterX);
      }

      // If newDist > oldDist => we interpret as positive delta (increase)
      // else negative delta (decrease)
      sign = newDist > oldDist ? 1 : -1;

      // The raw horizontal movement since last event
      rawDelta =
        spacerDirection === 'row'
          ? eventData.clientX - prev_cursor_position.x
          : eventData.clientY - prev_cursor_position.y;

      // Combine sign with the raw distance
      //deltaX = rawDelta;

      // Add to current gap, but clamp so it never goes below zero
      const oldGap =
        spacerDirection === 'row'
          ? (target.layoutManager.strategy.horizontalGap ?? 0)
          : (target.layoutManager.strategy.verticalGap ?? 0);
      //console.log('oldGap', oldGap, deltaX);

      const newGap =
        (spacerDirection === 'row' ? prev_horizontal_gap : prev_vertical_gap) +
        rawDelta;

      // 5. Update layout strategy
      target.layoutStrategy = new AutoLayoutStrategy({
        ...target.layoutStrategy,
        spacingType: 'manual',
        ...((spacerDirection === 'row' || direction === 'wrap') && {
          horizontalGap: newGap,
        }),
        ...((spacerDirection === 'column' || direction === 'wrap') && {
          verticalGap: newGap,
        }),
      });
      target.layoutManager.strategy = new AutoLayoutStrategy({
        ...target.layoutManager.strategy,
        spacingType: 'manual',
        ...(spacerDirection === 'row' && {
          horizontalGap: newGap,
        }),
        ...(spacerDirection === 'column' && {
          verticalGap: newGap,
        }),
      });

      target.setCoords();
      target.triggerLayout();

      return true;
    },
    // angle: 45,
    cursorStyleHandler: function (eventData, control, fabricObject) {
      //console.log('cursorStyleHandler', control);
      const layout = fabricObject as AutoLayout;
      const gap =
        direction === 'row'
          ? (layout.layoutManager.strategy.horizontalGap ?? 0)
          : (layout.layoutManager.strategy.verticalGap ?? 0);
      //console.log('gap cursor handler', gap);

      const { spacerDirection } = computeSpacerCoords(
        direction,
        prevObj,
        currObj,
        containerBBox
      );
      const col_resize = `<svg width="64px" height="64px" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="1.2"> <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00012 1.5C8.00012 1.22386 7.77626 1 7.50012 1C7.22398 1 7.00012 1.22386 7.00012 1.5V13.5C7.00012 13.7761 7.22398 14 7.50012 14C7.77626 14 8.00012 13.7761 8.00012 13.5V1.5ZM3.31812 5.818C3.49386 5.64227 3.49386 5.35734 3.31812 5.18161C3.14239 5.00587 2.85746 5.00587 2.68173 5.18161L0.681729 7.18161C0.505993 7.35734 0.505993 7.64227 0.681729 7.818L2.68173 9.818C2.85746 9.99374 3.14239 9.99374 3.31812 9.818C3.49386 9.64227 3.49386 9.35734 3.31812 9.18161L2.08632 7.9498H5.50017C5.7487 7.9498 5.95017 7.74833 5.95017 7.4998C5.95017 7.25128 5.7487 7.0498 5.50017 7.0498H2.08632L3.31812 5.818ZM12.3181 5.18161C12.1424 5.00587 11.8575 5.00587 11.6817 5.18161C11.506 5.35734 11.506 5.64227 11.6817 5.818L12.9135 7.0498H9.50017C9.25164 7.0498 9.05017 7.25128 9.05017 7.4998C9.05017 7.74833 9.25164 7.9498 9.50017 7.9498H12.9135L11.6817 9.18161C11.506 9.35734 11.506 9.64227 11.6817 9.818C11.8575 9.99374 12.1424 9.99374 12.3181 9.818L14.3181 7.818C14.4939 7.64227 14.4939 7.35734 14.3181 7.18161L12.3181 5.18161Z" fill="#000000"></path> </g>
       <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="1" dy="1" stdDeviation=".7" flood-color="rgba(0, 0, 0, 0.5)" />
    </filter>
  </defs>

  <!-- Apply the shadow filter to your elements -->
  <g filter="url(#shadow)">
   <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00012 1.5C8.00012 1.22386 7.77626 1 7.50012 1C7.22398 1 7.00012 1.22386 7.00012 1.5V13.5C7.00012 13.7761 7.22398 14 7.50012 14C7.77626 14 8.00012 13.7761 8.00012 13.5V1.5ZM3.31812 5.818C3.49386 5.64227 3.49386 5.35734 3.31812 5.18161C3.14239 5.00587 2.85746 5.00587 2.68173 5.18161L0.681729 7.18161C0.505993 7.35734 0.505993 7.64227 0.681729 7.818L2.68173 9.818C2.85746 9.99374 3.14239 9.99374 3.31812 9.818C3.49386 9.64227 3.49386 9.35734 3.31812 9.18161L2.08632 7.9498H5.50017C5.7487 7.9498 5.95017 7.74833 5.95017 7.4998C5.95017 7.25128 5.7487 7.0498 5.50017 7.0498H2.08632L3.31812 5.818ZM12.3181 5.18161C12.1424 5.00587 11.8575 5.00587 11.6817 5.18161C11.506 5.35734 11.506 5.64227 11.6817 5.818L12.9135 7.0498H9.50017C9.25164 7.0498 9.05017 7.25128 9.05017 7.4998C9.05017 7.74833 9.25164 7.9498 9.50017 7.9498H12.9135L11.6817 9.18161C11.506 9.35734 11.506 9.64227 11.6817 9.818C11.8575 9.99374 12.1424 9.99374 12.3181 9.818L14.3181 7.818C14.4939 7.64227 14.4939 7.35734 14.3181 7.18161L12.3181 5.18161Z" fill="#000000"></path> </g></svg>
`;
      //return createSVGInfoBox(gap.toString());
      const row_resize = `<svg width="64px" height="64px" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#ffffff" stroke-width="1.2"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.81832 0.68179C7.64258 0.506054 7.35766 0.506054 7.18192 0.68179L5.18192 2.68179C5.00619 2.85753 5.00619 3.14245 5.18192 3.31819C5.35766 3.49392 5.64258 3.49392 5.81832 3.31819L7.05012 2.08638L7.05012 5.50023C7.05012 5.74876 7.25159 5.95023 7.50012 5.95023C7.74865 5.95023 7.95012 5.74876 7.95012 5.50023L7.95012 2.08638L9.18192 3.31819C9.35766 3.49392 9.64258 3.49392 9.81832 3.31819C9.99406 3.14245 9.99406 2.85753 9.81832 2.68179L7.81832 0.68179ZM7.95012 12.9136V9.50023C7.95012 9.2517 7.74865 9.05023 7.50012 9.05023C7.25159 9.05023 7.05012 9.2517 7.05012 9.50023V12.9136L5.81832 11.6818C5.64258 11.5061 5.35766 11.5061 5.18192 11.6818C5.00619 11.8575 5.00619 12.1424 5.18192 12.3182L7.18192 14.3182C7.26632 14.4026 7.38077 14.45 7.50012 14.45C7.61947 14.45 7.73393 14.4026 7.81832 14.3182L9.81832 12.3182C9.99406 12.1424 9.99406 11.8575 9.81832 11.6818C9.64258 11.5061 9.35766 11.5061 9.18192 11.6818L7.95012 12.9136ZM1.49994 7.00017C1.2238 7.00017 0.999939 7.22403 0.999939 7.50017C0.999939 7.77631 1.2238 8.00017 1.49994 8.00017L13.4999 8.00017C13.7761 8.00017 13.9999 7.77631 13.9999 7.50017C13.9999 7.22403 13.7761 7.00017 13.4999 7.00017L1.49994 7.00017Z" fill="#000000"></path> </g>
      
      <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="1" dy="1" stdDeviation=".7" flood-color="rgba(0, 0, 0, 0.5)" />
    </filter>
  </defs>

  <!-- Apply the shadow filter to your elements -->
  <g filter="url(#shadow)">
       <path fill-rule="evenodd" clip-rule="evenodd" d="M7.81832 0.68179C7.64258 0.506054 7.35766 0.506054 7.18192 0.68179L5.18192 2.68179C5.00619 2.85753 5.00619 3.14245 5.18192 3.31819C5.35766 3.49392 5.64258 3.49392 5.81832 3.31819L7.05012 2.08638L7.05012 5.50023C7.05012 5.74876 7.25159 5.95023 7.50012 5.95023C7.74865 5.95023 7.95012 5.74876 7.95012 5.50023L7.95012 2.08638L9.18192 3.31819C9.35766 3.49392 9.64258 3.49392 9.81832 3.31819C9.99406 3.14245 9.99406 2.85753 9.81832 2.68179L7.81832 0.68179ZM7.95012 12.9136V9.50023C7.95012 9.2517 7.74865 9.05023 7.50012 9.05023C7.25159 9.05023 7.05012 9.2517 7.05012 9.50023V12.9136L5.81832 11.6818C5.64258 11.5061 5.35766 11.5061 5.18192 11.6818C5.00619 11.8575 5.00619 12.1424 5.18192 12.3182L7.18192 14.3182C7.26632 14.4026 7.38077 14.45 7.50012 14.45C7.61947 14.45 7.73393 14.4026 7.81832 14.3182L9.81832 12.3182C9.99406 12.1424 9.99406 11.8575 9.81832 11.6818C9.64258 11.5061 9.35766 11.5061 9.18192 11.6818L7.95012 12.9136ZM1.49994 7.00017C1.2238 7.00017 0.999939 7.22403 0.999939 7.50017C0.999939 7.77631 1.2238 8.00017 1.49994 8.00017L13.4999 8.00017C13.7761 8.00017 13.9999 7.77631 13.9999 7.50017C13.9999 7.22403 13.7761 7.00017 13.4999 7.00017L1.49994 7.00017Z" fill="#000000"></path> </g></svg>`;

      const cursor = mergeSVGs(
        spacerDirection === 'row' ? col_resize : row_resize,
        createSVGInfoBox({ text: Math.round(gap).toString(), svgType: 'html' }),
        20,
        20,
        true
      );
      return `url(${cursor}) 9 9, auto`;
    },
    mouseUpHandler: function (eventData, transform) {
      prev_cursor_position.x = 0;
      prev_cursor_position.y = 0;
      prev_horizontal_gap = 0;
      prev_vertical_gap = 0;
      isControlActivated = false;
    },
    // (Optional) if you want a custom render
    render: function (ctx, left, top, styleOverride, fabricObject) {
      const size = 30;
      //console.log('Object controls ', , fabricObject.__corner);

      const layout = fabricObject as AutoLayout;

      const canvasZoom = fabricObject.canvas?.getZoom() || 1;
      const { rectParams, spacerDirection, spacerCenter } = computeSpacerCoords(
        direction,
        prevObj,
        currObj,
        containerBBox
      );

      if (!rectParams || !spacerCenter) return;

      //console.log('spacerTL', this.getActionName(), spacerDirection);
      //if (this.actionName !== spacerDirection) return;

      let newPoint = new fabric.Point(0, 0);
      if (direction === 'row') {
        newPoint = new fabric.Point(
          spacerCenter.x - rectParams.width / 2,
          spacerCenter.y - rectParams.height / 2
        ).subtract(new fabric.Point(spacerCenter.x, spacerCenter.y));

        //console.log('checkPoint ...........', checkPoint, newPoint);
      } else if (direction === 'column') {
        newPoint = new fabric.Point(
          spacerCenter.x - rectParams.width / 2,
          spacerCenter.y - rectParams.height / 2
        ).subtract(new fabric.Point(spacerCenter.x, spacerCenter.y));
      } else if (direction === 'wrap') {
        if (spacerDirection === 'row') {
          newPoint = new fabric.Point(
            spacerCenter.x - rectParams.width / 2,
            spacerCenter.y - rectParams.height / 2
          ).subtract(new fabric.Point(spacerCenter.x, spacerCenter.y));
        } else {
          newPoint = new fabric.Point(
            spacerCenter.x - rectParams.width / 2,
            spacerCenter.y - rectParams.height / 2
          ).subtract(new fabric.Point(spacerCenter.x, spacerCenter.y));
        }
      }

      //console.log('spacerTL', this);
      ctx.save();
      ctx.translate(left, top);

      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));

      ctx.beginPath();

      ctx.lineWidth = 1;

      ctx.strokeStyle = '#3B82F6';

      if (isControlActivated) {
        ctx.strokeRect(
          newPoint.x * canvasZoom,
          newPoint.y * canvasZoom,
          rectParams.width * canvasZoom,
          rectParams.height * canvasZoom
        );
      }

      //drawInfoBox(ctx, left, top, fabricObject, gap.toString());
      ctx.stroke();
      ctx.restore();
      // Begin drawing the second line
      ctx.save(); // Save the context again
      ctx.translate(left, top);
      ctx.lineCap = 'round';
      //ctx.shadowBlur = 2;
      ctx.lineWidth = 2; // Line width for the second line
      ctx.shadowColor = 'white';

      ctx.beginPath(); // Ensure you're starting a new path for the second line

      if (spacerDirection === 'column') {
        ctx.moveTo(-size / 4, -0.2);
        ctx.lineTo(-size / 4 + size / 2, -0.2);
      } else {
        ctx.moveTo(-0.2, -size / 5);
        ctx.lineTo(-0.2, -size / 5 + size / 2);
      }

      // Stroke the second line
      ctx.stroke();
      ctx.restore(); // Restore after the second line
    },
  });
}

function computeSpacerCoords(
  direction: string,
  prevObj: fabric.Object,
  currObj: fabric.Object,
  containerBBox: fabric.FabricObject
): any {
  if (direction === 'row') {
    isVerticalSpacer = false;

    const spacerX = (prevObj.left ?? 0) + (prevObj.width ?? 0);
    const spacerWidth = (currObj.left ?? 0) - spacerX;
    const spacerY = -containerBBox.height / 2;
    const spacerHeight = containerBBox.height;

    const spacerCenter = new fabric.Point(
      spacerX + spacerWidth / 2,
      spacerY + spacerHeight / 2
    );

    const rectParams = {
      x: spacerX,
      y: spacerY,
      width: spacerWidth,
      height: spacerHeight,
    };
    return {
      spacerCenter,
      rectParams,
      spacerDirection: 'row',
    };
  } else if (direction === 'column') {
    isVerticalSpacer = true;
    const spacerY = (prevObj.top ?? 0) + (prevObj.height ?? 0);
    const spacerHeight = (currObj.top ?? 0) - spacerY;
    const spacerX = -containerBBox.width / 2;
    const spacerWidth = containerBBox.width;

    const spacerCenter = new fabric.Point(
      spacerX + spacerWidth / 2,
      spacerY + spacerHeight / 2
    );

    const rectParams = {
      x: spacerX,
      y: spacerY,
      width: spacerWidth,
      height: spacerHeight,
    };
    return {
      spacerCenter,
      rectParams,
      spacerDirection: 'column',
    };
  } else if (direction === 'wrap') {
    let lines: any[] = [];

    lines = buildLinesForWrap(containerBBox as AutoLayout);

    // 2) Find the lines containing prevObj and currObj
    let prevLineIndex = -1;
    let currLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.objects.includes(prevObj)) {
        prevLineIndex = i;
      }
      if (line.objects.includes(currObj)) {
        currLineIndex = i;
      }
    }
    if (prevLineIndex === currLineIndex && prevLineIndex >= 0) {
      return computeRowSpacer(
        prevObj,
        currObj,
        prevLineIndex,
        currLineIndex,
        lines,
        containerBBox
      );
    }
    // If consecutive lines => column spacer
    else if (prevLineIndex >= 0 && currLineIndex === prevLineIndex + 1) {
      return computeColumnSpacerBetweenLines(
        prevLineIndex,
        currLineIndex,
        lines,
        containerBBox
      );
    } else {
      return {
        spacerCenter: { x: 0, y: 0 },
        rectParams: { x: 0, y: 0, width: 0, height: 0 },
        spacerDirection: 'wrap',
      };
    }
  }
}

/////////////////////////////
// computeRowSpacer
// For row layout or row lines in wrap
/////////////////////////////
function computeRowSpacer(
  prevObj: fabric.Object,
  currObj: fabric.Object,
  prevLineIndex: number,
  currLineIndex: number,
  lines: any[],
  containerBBox: fabric.FabricObject
): any {
  if (prevLineIndex < 0 || currLineIndex < 0) return null;
  const line = lines[prevLineIndex];

  // horizontal gap from prevObj.right to currObj.left
  const spacerX = (prevObj.left ?? 0) + (prevObj.width ?? 0);
  const spacerWidth = (currObj.left ?? 0) - spacerX;

  // for a pure "row" layout => full container height
  // but for wrap lines => each line has its own cross dimension
  // so we check line.maxCross if we want to limit to the line's height
  // or containerBBox.height if it's a pure row layout
  let crossSize: number;
  if (
    lines.length === 1 &&
    containerBBox.layoutManager?.strategy?.layoutDirection === 'row'
  ) {
    // Single-line row layout => full container height
    crossSize = containerBBox.height ?? 300;
  } else {
    // In wrap scenario => use line.maxCross
    crossSize = line.maxCross;
  }

  // The top of the line is line.verticalOffset in local coords
  const spacerY = line.verticalOffset;
  const spacerHeight = crossSize;

  return {
    spacerCenter: new fabric.Point(
      spacerX + spacerWidth / 2,
      spacerY + spacerHeight / 2
    ),
    rectParams: {
      x: spacerX,
      y: spacerY,
      width: spacerWidth,
      height: spacerHeight,
    },
    spacerDirection: 'row',
  };
}

/////////////////////////////
// computeColumnSpacerBetweenLines
// For column layout or consecutive lines in wrap
/////////////////////////////
function computeColumnSpacerBetweenLines(
  prevLineIndex: number,
  currLineIndex: number,
  lines: any[],
  containerBBox: fabric.FabricObject
): any {
  if (prevLineIndex < 0 || currLineIndex < 0) return null;
  const prevLine = lines[prevLineIndex];
  const currLine = lines[currLineIndex];

  // vertical gap from prevLine.bottom => prevLine.verticalOffset + prevLine.totalMain
  // to currLine.verticalOffset
  const spacerY = prevLine.verticalOffset + prevLine.maxCross;
  const spacerHeight = currLine.verticalOffset - spacerY;

  // For pure column layout => full container width
  // For wrap => use line.maxCross or totalMain as you see fit
  let crossSize: number;
  if (
    lines.length === (containerBBox.getObjects()?.length || 0) &&
    containerBBox.layoutManager?.strategy?.layoutDirection === 'column'
  ) {
    // in a pure single-column layout => full container width
    crossSize = containerBBox.width ?? 300;
  } else {
    // in wrap scenario, if you want to unify width for vertical spacer, you could do:
    // crossSize = Math.max(prevLine.maxCross, currLine.maxCross)
    // or just the container width if you prefer.
    crossSize = containerBBox.width ?? 300;
  }

  // horizontal offset is line.horizontalOffset or just 0 if not used
  // let's assume line.horizontalOffset
  const spacerX = prevLine.horizontalOffset ?? 0;
  const spacerWidth = crossSize;

  return {
    spacerCenter: new fabric.Point(spacerX, spacerY + spacerHeight / 2),
    rectParams: {
      x: spacerX,
      y: spacerY,
      width: spacerWidth,
      height: spacerHeight,
    },
    spacerDirection: 'column',
  };
}

/////////////////////////////
// buildLinesForLayout
// For row/column layout
/////////////////////////////
function buildLinesForLayout(container: AutoLayout): any[] {
  const objects = container.getObjects();
  if (objects.length === 0) return [];

  const dir = container.layoutManager?.strategy?.layoutDirection;

  if (dir === 'row') {
    // single row => everything in one line
    return [
      {
        objects,
        totalMain: computeTotalMainSize(objects, 'row'),
        maxCross:
          computeMaxCrossSize(objects, 'row') || (container.height ?? 300),
        verticalOffset: 0,
        horizontalOffset: 0,
      },
    ];
  } else if (dir === 'column') {
    // each object is its own line => vertical
    let currentTop = 0;
    return objects.map((obj) => {
      const line = {
        objects: [obj],
        totalMain: obj.height ?? 0,
        maxCross: container.width ?? 300,
        verticalOffset: currentTop,
        horizontalOffset: 0,
      };
      currentTop += obj.height ?? 0;
      return line;
    });
  } else {
    // fallback to wrap
    return buildLinesForWrap(container);
  }
}

/////////////////////////////
// buildLinesForWrap
/////////////////////////////
function buildLinesForWrap(container: AutoLayout) {
  const objects = container.getObjects();
  if (objects.length === 0) return [];

  const verticalAlign =
    container.layoutManager?.strategy.alignment?.split('-')[0] ?? 'top';

  const sortedObjects = [...objects].sort(
    (a, b) =>
      getVerticalAnchor(a, verticalAlign) - getVerticalAnchor(b, verticalAlign)
  );

  const lineThreshold = 0; //container.layoutManager?.strategy?.verticalGap ?? 0;

  const lines: {
    objects: fabric.Object[];
    totalMain: number;
    maxCross: number;
    verticalOffset: number;
    horizontalOffset: number;
  }[] = [];

  let currentLine: fabric.Object[] = [];
  let currentLineAnchor = getVerticalAnchor(sortedObjects[0], verticalAlign);

  for (const obj of sortedObjects) {
    const objAnchor = getVerticalAnchor(obj, verticalAlign);
    if (Math.abs(objAnchor - currentLineAnchor) <= lineThreshold) {
      currentLine.push(obj);
    } else {
      // finalize line
      lines.push({
        objects: currentLine,
        totalMain: computeTotalMainSize(currentLine, 'row'),
        maxCross: computeMaxCrossSize(currentLine, 'row'),
        verticalOffset: currentLineAnchor,
        horizontalOffset: 0,
      });
      // start new line
      currentLine = [obj];
      currentLineAnchor = objAnchor;
    }
  }

  // push last line if any
  if (currentLine.length > 0) {
    lines.push({
      objects: currentLine,
      totalMain: computeTotalMainSize(currentLine, 'row'),
      maxCross: computeMaxCrossSize(currentLine, 'row'),
      verticalOffset: currentLineAnchor,
      horizontalOffset: 0,
    });
  }

  const paddingTop = container.layoutManager?.strategy.paddingTop ?? 0;
  const paddingBottom = container.layoutManager?.strategy.paddingBottom ?? 0;
  const verticalGap = container.layoutManager?.strategy.verticalGap ?? 0;

  computeLineVerticalOffsets(
    lines,
    container.height ?? 300,
    paddingTop,
    paddingBottom,
    verticalGap,
    verticalAlign
  );

  return lines;
}

/////////////////////////////
// Helpers
/////////////////////////////
function getVerticalAnchor(
  obj: fabric.Object,
  verticalAlign: 'top' | 'middle' | 'bottom'
) {
  switch (verticalAlign) {
    case 'middle':
      return (obj.top ?? 0) + (obj.height ?? 0) / 2;
    case 'bottom':
      return (obj.top ?? 0) + (obj.height ?? 0);
    case 'top':
    default:
      return obj.top ?? 0;
  }
}

interface Line {
  objects: fabric.Object[];
  maxCross: number; // line’s height in a row-based wrap
  verticalOffset?: number; // computed offset from container’s top
}

/**
 * Assign a verticalOffset to each line in `lines`,
 * so you know where that line sits vertically in the container.
 *
 * @param lines        An array of lines, each with .maxCross
 * @param containerHeight The total container height
 * @param paddingTop   Top padding
 * @param paddingBottom Bottom padding
 * @param verticalGap  The gap (spacing) between lines
 * @param vertAlign    How lines are aligned vertically: 'top'|'center'|'bottom'
 */
function computeLineVerticalOffsets(
  lines: Line[],
  containerHeight: number,
  paddingTop: number,
  paddingBottom: number,
  verticalGap: number,
  vertAlign: 'top' | 'middle' | 'bottom'
) {
  if (lines.length === 0) return;

  // 1) Calculate total lines’ height + gaps
  let totalLinesHeight = 0;
  lines.forEach((line) => {
    totalLinesHeight += line.maxCross; // sum of each line’s height
  });
  // Add verticalGap between lines
  totalLinesHeight += (lines.length - 1) * verticalGap;

  // 2) Figure out how much vertical space is left after padding
  const usableHeight = containerHeight - (paddingTop + paddingBottom);

  // 3) Decide where to place the first line (stackTop)
  let stackTop = 0;
  switch (vertAlign) {
    case 'bottom':
      // anchor bottom line at (containerHeight - paddingBottom)
      // => the top line is higher if leftover space
      stackTop = usableHeight - totalLinesHeight;
      stackTop += paddingTop;
      break;
    case 'middle':
      // center lines in the container
      stackTop = (usableHeight - totalLinesHeight) / 2 + paddingTop;
      break;
    case 'top':
    default:
      stackTop = paddingTop;
      break;
  }

  // 4) Assign each line’s verticalOffset
  let currentY = stackTop - containerHeight / 2;
  lines.forEach((line) => {
    line.verticalOffset = currentY; // store the offset
    currentY += line.maxCross + verticalGap;
  });
}

function computeTotalMainSize(objs: fabric.Object[], dir: string) {
  if (dir === 'row') {
    return objs.reduce((sum, o) => sum + (o.width ?? 0), 0);
  } else if (dir === 'column') {
    return objs.reduce((sum, o) => sum + (o.height ?? 0), 0);
  }
  return 0;
}

function computeMaxCrossSize(objs: fabric.Object[], dir: string) {
  if (dir === 'row') {
    return Math.max(...objs.map((o) => o.height ?? 0), 0);
  } else if (dir === 'column') {
    return Math.max(...objs.map((o) => o.width ?? 0), 0);
  }
  return 0;
}
