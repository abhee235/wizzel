import * as fabric from 'fabric';
import { resolveOrigin } from './resolveOrigin';
import { Transform, TransformActionHandler } from 'fabric';
import { wrapWithFixedAnchor } from './wrapWithFixedAnchor';

/**
 * Action handler to change object's height
 * Needs to be wrapped with wrapWithFixedAnchor to be effective
 * @param {Event} eventData javascript event that is doing the transform
 * @param {Object} transform javascript object containing a series of information around the current transform
 * @param {number} x current mouse x position, canvas normalized
 * @param {number} y current mouse y position, canvas normalized
 * @return {Boolean} true if some change happened
 */

export function isTransformCentered(transform: Transform) {
  return (
    resolveOrigin(transform.originX) === resolveOrigin('center') &&
    resolveOrigin(transform.originY) === resolveOrigin('center')
  );
}

export const changeObjectLength: TransformActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const localPoint = fabric.controlsUtils.getLocalPoint(
    transform,
    transform.originX,
    transform.originY,
    x,
    y
  );
  // Ensure that height changes only from the correct vertical side of the target
  if (
    resolveOrigin(transform.originY) === resolveOrigin('center') ||
    (resolveOrigin(transform.originY) === resolveOrigin('bottom') &&
      localPoint.y < 0) ||
    (resolveOrigin(transform.originY) === resolveOrigin('top') &&
      localPoint.y > 0)
  ) {
    const { target } = transform,
      strokePadding =
        target.strokeWidth / (target.strokeUniform ? target.scaleY : 1),
      multiplier = isTransformCentered(transform) ? 2 : 1,
      oldHeight = target.height,
      newHeight =
        Math.abs((localPoint.y * multiplier) / target.scaleY) - strokePadding;
    target.set('height', Math.max(newHeight, 1));
    return oldHeight !== target.height;
  }
  return false;
};

export const changeLength = fabric.controlsUtils.wrapWithFireEvent(
  'resizing',
  wrapWithFixedAnchor(changeObjectLength)
);
