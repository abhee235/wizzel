import * as fabric from 'fabric';
import { Canvas } from 'fabric';
import { v4 as uuid4 } from 'uuid';
import { Frame } from '@/lib/shapes/Frame';
import { AutoLayoutStrategy } from '@/lib/LayoutStrategy/AutoLayoutStrategy';
import { AutoLayout } from '@/lib/shapes/AutoLayout';
import { autoLayoutControls } from '@/lib/controls/autolayout/autolayoutcontrols';
import { defaultControls } from '@/lib/controls/defaultControls';

let _clipboard: fabric.Object | null = null;

export const dispatchAction = ({
  canvas,
  action,
}: {
  canvas: Canvas;
  action: string;
}) => {
  console.log('dispatchAction', canvas, action);
  switch (action) {
    case 'copy':
      canvas
        .getActiveObject()
        .clone()
        .then((cloned) => {
          _clipboard = cloned;
        });
      break;

    case 'paste':
      if (_clipboard) {
        _clipboard.clone().then((clonedObj) => {
          canvas.discardActiveObject();
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
            objectId: uuid4(),
            isDeleted: false,
            parentId: clonedObj.parentId || null,
            shapeName: clonedObj.shapeName,
            isLocked: clonedObj.isLocked,
          });
          clonedObj.controls = {
            ...clonedObj.controls,
            ...(clonedObj.type === 'autolayout'
              ? autoLayoutControls(clonedObj)
              : defaultControls(clonedObj)),
          };
          if (clonedObj instanceof fabric.ActiveSelection) {
            // active selection needs a reference to the canvas.
            clonedObj.canvas = canvas;
            clonedObj.forEachObject((obj) => {
              canvas.add(obj);
            });

            clonedObj.setCoords();
          } else {
            canvas.add(clonedObj);
          }
          _clipboard.top += 10;
          _clipboard.left += 10;
          canvas.setActiveObject(clonedObj);
          canvas.requestRenderAll();
        });
      }
      break;

    case 'cut':
      canvas
        .getActiveObject()
        .clone()
        .then((cloned) => {
          _clipboard = cloned;
          canvas.remove(canvas.getActiveObject());
        });
      break;

    case 'delete':
      canvas.remove(canvas.getActiveObject());
      break;

    case 'frameSelection':
      const activeObject = canvas.getActiveObject();
      //   console.log(
      //     'activeObject',
      //     activeObject?.getObjects(),
      //     activeObject?.type
      //   );
      if (activeObject && activeObject.type === 'activeselection') {
        const frame = new Frame(
          [...activeObject._objects],
          {
            left: activeObject.left,
            top: activeObject.top,
            width: activeObject.width,
            height: activeObject.height,
            fill: 'white',
            objectId: uuid4(),
            isDeleted: false,
            parentId: null,
            shapeName: 'frame',
            isLocked: 'false',
          },
          false
        );
        frame.controls = {
          ...fabric.Rect.createControls().controls,
          ...defaultControls(frame),
        };
        canvas.add(frame);
        //canvas.bringToFront(rect);
        canvas.requestRenderAll();
      }
      break;
    case 'groupSelection':
      const groupObject = canvas.getActiveObjects();
      if (groupObject && groupObject.type === 'activeselection') {
        const group = new fabric.Group(groupObject._objects, {
          objectId: uuid4(),
          left: groupObject.left,
          top: groupObject.top,
          width: groupObject.width,
          height: groupObject.height,
        });
        canvas.add(group);
        canvas.requestRenderAll();
      }
      break;
    case 'unframe':
      const frameObject = canvas.getActiveObject();
      if (frameObject && frameObject.type === 'frame') {
        const objects = frameObject.getObjects();
        canvas.remove(frameObject);
        objects.forEach((obj) => {
          canvas.add(obj);
        });
        canvas.requestRenderAll();
      }
      break;
    case 'autoLayout':
      const object = canvas.getActiveObject();
      if (object && object.type === 'activeselection') {
        const layoutStrategy = new AutoLayoutStrategy({
          layoutDirection: object.width >= object.height ? 'row' : 'column',
          alignment: 'middle-center',
          spacingType: 'auto',
          heightType: 'hug',
        });

        console.log('layoutStrategy init', object);
        const autoLayout = new AutoLayout(
          object.getObjects(),
          {
            left: object.left,
            top: object.top,
            width: object.width,
            height: object.height,
            objectId: uuid4(),
            isDeleted: false,
            parentId: null,
            shapeName: 'frame',
            isLocked: false,
          },
          false,
          layoutStrategy
        );

        autoLayout.controls = {
          ...fabric.Rect.createControls().controls,
          ...autoLayoutControls(autoLayout),
        };
        autoLayout.setCoords();
        canvas.discardActiveObject();
        canvas.remove(object);
        canvas.add(autoLayout.layoutLabel);
        canvas.add(autoLayout);
        canvas.setActiveObject(autoLayout);
        canvas.fire('object:added', { target: autoLayout });

        canvas.requestRenderAll();
      }
      break;
  }
};
