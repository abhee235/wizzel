import * as fabric from 'fabric';
import { Transform, TransformActionHandler } from 'fabric';
import { changeObjectLength } from '@/lib/controls/utils/changeObjectLength';
import { wrapWithFixedAnchor } from '@/lib/controls/utils/wrapWithFixedAnchor';

const changeDimensions: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  let changed = false;
  // Try changing width
  if (fabric.controlsUtils.changeWidth(eventData, transform, x, y)) {
    changed = true;
  }
  // Try changing height
  if (changeObjectLength(eventData, transform, x, y)) {
    changed = true;
  }
  return changed;
};

export const changeLayoutDimensions = fabric.controlsUtils.wrapWithFireEvent(
  'resizing',
  wrapWithFixedAnchor(changeDimensions)
);