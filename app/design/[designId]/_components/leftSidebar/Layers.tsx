import React from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import * as fabric from 'fabric';

import { getShapeInfo } from '@/lib/utils';
import  InlineEditableLabel from '@/components/ui/inline-editable-label';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons';

const Layers = ({
  shape,
  highlightedShape,
  handleSelectionFromLayer,
  handleSaveShapeName,
  handleShapeLock,
  handleShapePresence,
  handleShapeHighlight,
  isChildren = false,
}: {
  shape: any; // or the more specific type
  highlightedShape: fabric.Object | null;
  handleSelectionFromLayer: (objectId: string) => void;
  handleSaveShapeName: (id: string, name: string) => void;
  handleShapeLock: (id: string) => void;
  handleShapePresence: (id: string) => void;
  handleShapeHighlight: (id: string, isHighlight: boolean) => void;
  isChildren?: boolean;
}) => {
  // "children" might be shape.children or shape._objects or whatever structure you have
  // Decide if this shape is a parent container (e.g. group, frame, layout)

  const isGroupLike =
    shape.type === 'group' ||
    shape.type === 'frame' ||
    shape.type === 'autolayout';

  // if (!isChildren)
  //   isChildren =
  //     shape.properties?.shapeData?.type === 'group' ||
  //     shape.properties?.shapeData?.type === 'frame' ||
  //     shape.properties?.shapeData?.type === 'autolayout';

  // For your icon or display info
  const info = getShapeInfo(shape.type);

  const children = isGroupLike ? shape.objects || [] : [];
  //console.log('Shape ---layer : ', shape, isGroupLike, children);
  return (
    <div>
      {/* The "Layer Row" for this single shape */}
      <div className="w-full"></div>
      <div
        className={`
          flex justify-between items-center gap-2 py-1 relative 
          ${highlightedShape?.id === shape.objectId ? 'bg-muted' : ''} 
          ${!shape.visible ? 'bg-neutral-100' : ''}

          group hover:cursor-pointer hover:bg-muted hover:text-primary-black
        `}
        onClick={() => handleSelectionFromLayer(shape.objectId)}
        onMouseEnter={() => handleShapeHighlight(shape.objectId, true)}
        onMouseLeave={() => handleShapeHighlight(shape.objectId, false)}
      >
        {/* LEFT SIDE: icon + editable label */}
        <div className="flex px-4">
          {/* Possibly some “collapse” arrow if you want toggling children */}
          {isGroupLike && <div className="absolute left-0">▾</div>}

          {/* Show shape icon */}
          <Image src={info?.icon} alt="Layer" width={16} height={16} />

          {/* Inline editable label */}
          <InlineEditableLabel
            initialValue={shape.shapeName}
            onSave={(newValue) => handleSaveShapeName(shape.objectId, newValue)}
            className="ml-2 w-24"
            inputClassName="text-xs"
          />
        </div>

        {/* RIGHT SIDE: lock/unlock, hide/show */}
        <div className="hidden group-hover:flex">
          <Button
            variant="ghost"
            className="h-6 w-5 px-0"
            size="icon"
            onClick={(e) => {
              e.stopPropagation(); // prevent onClick from toggling selection
              handleShapeLock(shape.objectId);
            }}
          >
            <FontAwesomeIcon
              icon={shape.isLocked ? faLock : faUnlock}
              className="h-3 w-3 text-gray-500"
            />
          </Button>
          <Button
            variant="ghost"
            className="h-6 w-6"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleShapePresence(shape.objectId);
            }}
          >
            <FontAwesomeIcon
              icon={shape.visible ? faEyeSlash : faEye}
              className="h-3 w-3 text-gray-500"
            />
          </Button>
        </div>
      </div>

      {/* If group, recursively render children */}
      {children.length > 0 && (
        <div className=" pl-5 border-l border-gray-200">
          {children.map((child: any) => (
            <Layers
              key={child.objectId}
              shape={child}
              highlightedShape={highlightedShape}
              handleSelectionFromLayer={handleSelectionFromLayer}
              handleSaveShapeName={handleSaveShapeName}
              handleShapeLock={handleShapeLock}
              handleShapePresence={handleShapePresence}
              handleShapeHighlight={handleShapeHighlight}
              isChildren={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Layers;
