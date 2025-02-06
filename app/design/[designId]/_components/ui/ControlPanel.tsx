import React, { useMemo, memo, useRef, useCallback, useState } from 'react';

import { ControlPanelProps } from '../types/type';
//import { bringElement, modifyShape } from '@/lib/shapes';
import * as fabric from 'fabric';

import { addPatch } from '@/store/patch-buffer';
import { useUnit } from 'effector-react';

import { debounce, throttle } from 'lodash';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboard,
  faCopy,
  faEllipsis,
  faRectangleList,
  faSquare,
  faSquareFull,
  faArrowsToCircle,
  faPlus,
  faShare,
  faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import {
  faClone,
  faEye,
  faPenToSquare,
} from '@fortawesome/free-regular-svg-icons';
import Alignment   from '../controlPanel/position/Alignment';
import Position from '../controlPanel/position/Position';
import Transform from '../controlPanel/position/Transform';
import Layout from '../controlPanel/shapelayout/Layout';
import Appearance from '../controlPanel/appearance/Appearance';
import ShapeFill from '../controlPanel/appearance/ShapeFill';
import PageControl from '../controlPanel/page/PageControl';
import ShapeStroke from '../controlPanel/appearance/ShapeStroke';
//import { selectionElements } from '../constants';
import { $selectedObject } from '@/store/canvas-store';

import { $canvasStore } from '@/store/canvas-store';
import Typography from '../controlPanel/typography/Typography';
import { ScrollBar, ScrollArea } from '@/components/ui/scroll-area';
import {
  LAYOUT_TYPE_IMPERATIVE,
} from '@/lib/LayoutManager/LayoutConstant';
import { AutoLayoutStrategy } from '@/lib/LayoutStrategy/AutoLayoutStrategy';
import { autoLayoutControls } from '@/lib/controls/autolayout/autolayoutcontrols';
import AutoLayout from './../controlPanel/shapelayout/Autolayout';

$canvasStore.watch((state) => {
  //console.log('new state : ', state);
});

const ControlPanel = ({
  //elementAttributes,
  //setElementAttributes,
  fabricRef,
  activeObjectRef,
  //selectedObject,
  isEditingRef,
  syncShapeInStorage,
}: ControlPanelProps) => {
  const colorInputRef = useRef(null);
  const strokeInputRef = useRef(null);
  const [handleAddToPatchBuffer] = useUnit([addPatch]);
  const selectedObject = useUnit($selectedObject);

  //console.log('active object selection : ', selectedObject);

  const handleInputChange = useCallback(
    debounce((property: string, value: string) => {
      if (!isEditingRef.current) isEditingRef.current = true;

      let shapeData = { ...selectedObject?.properties.shapeData };

      if (property === 'width' && shapeData.type !== 'i-text') {
        shapeData = {
          ...shapeData,
          ['scaleX']: parseInt(value) / shapeData.width,
        };
        //setElementAttributes((prev) => ({ ...prev, scaleX: shapeData.scaleX }));
      } else if (property === 'height' && shapeData.type !== 'i-text') {
        shapeData = {
          ...shapeData,
          ['scaleY']: parseInt(value) / shapeData.height,
        };
      } else if (property === 'radius' && shapeData.type !== 'i-text') {
        shapeData = {
          ...shapeData,
          ['rx']: parseInt(value),
          ['ry']: parseInt(value),
        };
      } else if (property === 'angle') {
        shapeData = {
          ...shapeData,
          ['angle']: parseInt(value),
          ['centeredRotation']: true,
        };
      } else if (property === 'alignment') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            alignment: value,
          }),
        };
      } else if (property === 'spacingType') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            spacingType: value,
          }),
        };
      } else if (property === 'horizontalGap') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            horizontalGap: value,
            ...(shapeData.layoutStrategy.layoutDirection === 'row' && {
              verticalGap: value,
            }),
          }),
        };
      } else if (property === 'verticalGap') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            verticalGap: value,
            ...(shapeData.layoutStrategy.layoutDirection === 'column' && {
              horizontalGap: value,
            }),
          }),
        };
      } else if (property === 'paddingHorizontal') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            paddingLeft: value,
            paddingRight: value,
            paddingHorizontal: value,
          }),
        };
      } else if (property === 'paddingVertical') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            paddingTop: value,
            paddingBottom: value,
            paddingVertical: value,
          }),
        };
      } else if (property === 'direction') {
        shapeData = {
          ...shapeData,
          layoutStrategy: new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
            layoutDirection: value,
          }),
        };
      }
      //else if (selectedObject?.properties.shapeData.type === 'textInput') {
      else if (property === 'fontSize') {
        shapeData = {
          ...shapeData,
          ['fontSize']: parseInt(value),
        };
      } else if (property === 'fontWeight') {
        shapeData = {
          ...shapeData,
          ['fontWeight']: value,
        };
      } else if (property === 'fontFamily') {
        shapeData = {
          ...shapeData,
          ['fontFamily']: value,
        };
      } else if (property === 'lineHeight') {
        shapeData = {
          ...shapeData,
          ['lineHeight']: parseFloat(value),
        };
      } else if (property === 'charSpacing') {
        shapeData = {
          ...shapeData,
          ['charSpacing']: parseFloat(value),
        };
      } else if (property === 'textAlignment') {
        shapeData = {
          ...shapeData,
          ['textAlign']: value,
        };
      }
      //}
      //setElementAttributes((prev) => ({ ...prev, scaleX: shapeData.scaleX }));
      else if (shapeData[property as keyof object] === value) return;
      else shapeData[property as keyof object] = value;

      //activeObjectRef.current = shapeData;
      // handleAddToPatchBuffer({
      //   objectId: selectedObject.id!,
      //   changes: { shapeData },
      // });

      const existingObject = fabricRef.current
        .getObjects()
        .find((obj: any) => obj.objectId === selectedObject.id);

      if (existingObject) {
        if (existingObject.type === 'autolayout') {
          existingObject.layoutManager.strategy = new AutoLayoutStrategy({
            ...shapeData.layoutStrategy,
          });

          existingObject.layoutManager.performLayout({
            type: LAYOUT_TYPE_IMPERATIVE,
            target: existingObject,
            targets: [...existingObject.getObjects()],
          });
          existingObject.set({
            ...existingObject,
            layoutStrategy: shapeData.layoutStrategy,
          });
          if (property === 'direction')
            existingObject.controls = {
              ...autoLayoutControls(existingObject),
            };
          existingObject.setCoords();
          syncShapeInStorage(existingObject);
        } else {
          delete shapeData.type;
          existingObject.set({ ...shapeData });
          existingObject.setCoords();
          fabricRef.current?.requestRenderAll();
          syncShapeInStorage(existingObject);
        }

        // activeObjectRef.current.set({ ...shapeData });
        // activeObjectRef.current.setCoords();
      }

      fabricRef.current?.requestRenderAll();
    }, 100),
    [
      selectedObject,
      handleAddToPatchBuffer,
      selectedObject?.properties.shapeData,
    ]
  );


  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  // const memoizedContent = useMemo(
  //   () =>
  return (
    <div className="flex flex-col h-full w-[250px] min-w-[250px] overflow-auto pr-2 border-t bg-white border-primary-grey-200 bg-primary-black text-primary-grey-300  sticky right-0 max-sm:hidden select-none">
      <div className="flex justify-between items-center mt-1 py-2 px-3">
        <div className="rounded-full w-8 h-8 bg-blue-700 text-white font-2xl text-center content-center">
          AS
        </div>
        <div>
          <Button
            variant="secondary"
            className="h-8 text-primary-grey-300 px-3"
          >
            <FontAwesomeIcon icon={faShare} size="xs" />
            <span className="ml-1 text-xs">Share</span>
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center border-b py-2 px-3">
        <div className=" flex flex-start items-center gap-4">
          <div className=" text-xs font-semibold py-1 px-2 bg-gray-200 rounded">
            Design
          </div>
          <div className=" text-xs">Prototype</div>
        </div>
        <div className=" text-xs font-semibold">
          {Math.round(fabricRef.current?.getZoom() * 100)} %
        </div>
      </div>
      {!selectedObject ? (
        <PageControl />
      ) : (
        <ScrollArea className="flex-1 w-full h-[600px] whitespace-nowrap rounded-md border">
          <div className="flex justify-between items-center border-b py-3 px-3">
            <div className="text-[13px]">Rectagle</div>
            <div className="flex flex-end items-center gap-1">
              <Button
                variant="secondary"
                className="w-8 h-8 text-primary-grey-300 px-2"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button
                variant="secondary"
                className="w-8 h-8 text-primary-grey-300 px-2"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faArrowRotateRight} />
              </Button>
              <Button
                variant="secondary"
                className="w-8 h-8 text-primary-grey-300 px-2"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faClone} />
              </Button>
              <Button
                variant="secondary"
                className="w-8 h-8 text-primary-grey-300 px-2"
                onClick={() => {}}
              >
                <FontAwesomeIcon icon={faEllipsis} />
              </Button>
            </div>
          </div>
          <div className=" border-b py-2 px-3">
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold py-1">Position</h3>
              <div className="">
                <Alignment />
                <Position
                  left={selectedObject?.properties.shapeData?.left}
                  top={selectedObject?.properties.shapeData?.top}
                  handleInputChange={handleInputChange}
                />
                <Transform
                  angle={selectedObject?.properties.shapeData?.angle}
                  handleInputChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          {selectedObject?.properties.shapeData?.type !== 'autolayout' ? (
            <Layout
              type={selectedObject?.properties.shapeData?.type}
              scaleX={selectedObject?.properties.shapeData?.scaleX}
              scaleY={selectedObject?.properties.shapeData?.scaleY}
              isEditingRef={isEditingRef}
              width={selectedObject.properties.shapeData.width}
              height={selectedObject.properties.shapeData.height}
              handleInputChange={handleInputChange}
            />
          ) : (
            <AutoLayout
              type={selectedObject?.properties.shapeData?.type}
              scaleX={selectedObject?.properties.shapeData?.scaleX}
              scaleY={selectedObject?.properties.shapeData?.scaleY}
              isEditingRef={isEditingRef}
              width={selectedObject.properties.shapeData.width}
              height={selectedObject.properties.shapeData.height}
              handleInputChange={handleInputChange}
              strategy={selectedObject.properties.shapeData.layoutStrategy}
            />
          )}

          <Appearance
            type={selectedObject?.properties.shapeData?.type}
            opacity={selectedObject?.properties.shapeData?.opacity}
            radius={selectedObject?.properties.shapeData?.rx}
            isEditingRef={isEditingRef}
            handleInputChange={handleInputChange}
          />

          {selectedObject?.properties.shapeData?.type === 'IText' ||
            (selectedObject.properties.shapeData.type === 'textInput' && (
              <Typography
                type={selectedObject?.properties.shapeData?.type}
                inputRef={colorInputRef}
                handleInputChange={handleInputChange}
                fontSize={selectedObject?.properties.shapeData.fontSize}
                fontWeight={selectedObject?.properties.shapeData.fontWeight}
                fontFamily={selectedObject?.properties.shapeData.fontFamily}
                lineHeight={selectedObject?.properties.shapeData.lineHeight}
                letterSpacing={selectedObject?.properties.shapeData.charSpacing}
                textAlignment={selectedObject?.properties.shapeData.textAlign}
              />
              // ) : (
              //   <>Hello</>
            ))}
          <div className=" border-b py-3 px-3">
            <div className="flex flex-col">
              <div className="flex justify-between align-middle py-1">
                <h3 className="text-xs font-semibold">Fill</h3>
                <FontAwesomeIcon
                  size="xs"
                  icon={faPlus}
                  className="text-primary-grey-300"
                />
              </div>
              <ShapeFill
                inputRef={colorInputRef}
                attribute={selectedObject?.properties.shapeData?.fill}
                placeholder="color"
                attributeType="fill"
                handleInputChange={handleInputChange}
              />
            </div>
          </div>

          <ShapeStroke
            inputRef={colorInputRef}
            strokeColor={selectedObject?.properties.shapeData?.stroke}
            strokeWidth={selectedObject?.properties.shapeData?.strokeWidth}
            StrokePosition={selectedObject?.properties.shapeData?.stroke}
            placeholder="color"
            attributeType="fill"
            isEditingRef={isEditingRef}
            handleInputChange={handleInputChange}
          />

          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </div>
  );
  //[
  // selectedObject,
  // selectedObject?.id,
  // selectedObject?.properties,
  // selectedObject?.properties.shapeData,
  // selectedObject?.properties.shapeData.type,
  // ]
  //);
  //return memoizedContent;+
};

export default memo(ControlPanel);