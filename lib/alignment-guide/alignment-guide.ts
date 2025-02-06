/**
 * Should objects be aligned by a bounding box?
 * [Bug] Scaled objects sometimes can not be aligned by edges
 *
 */

export const initAligningGuidelines = (canvas) => {
    var ctx = canvas.getSelectionContext(),
      aligningLineOffset = 3,
      aligningLineMargin = 3,
      aligningLineWidth = 0.7,
      aligningLineColor = 'rgb(255,0,0)',
      viewportTransform,
      zoom = 1;
  
    function drawVerticalLine(coords) {
      drawLine(
        coords.x + 0.5,
        coords.y1 > coords.y2 ? coords.y2 : coords.y1,
        coords.x + 0.5,
        coords.y2 > coords.y1 ? coords.y2 : coords.y1
      );
    }
  
    function drawHorizontalLine(coords) {
      drawLine(
        coords.x1 > coords.x2 ? coords.x2 : coords.x1,
        coords.y + 0.5,
        coords.x2 > coords.x1 ? coords.x2 : coords.x1,
        coords.y + 0.5
      );
    }
  
    function drawLine(x1, y1, x2, y2) {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.beginPath();
      ctx.moveTo(
        x1 * zoom + viewportTransform[4],
        y1 * zoom + viewportTransform[5]
      );
      ctx.lineTo(
        x2 * zoom + viewportTransform[4],
        y2 * zoom + viewportTransform[5]
      );
      ctx.stroke();
      ctx.restore();
    }
  
    function drawCross(x, y) {
      const size = 2; // Cross size
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1;
      ctx.beginPath();
  
      // Draw cross centered at (x, y)
      ctx.moveTo(
        (x - size) * zoom + viewportTransform[4],
        (y - size) * zoom + viewportTransform[5]
      );
      ctx.lineTo(
        (x + size) * zoom + viewportTransform[4],
        (y + size) * zoom + viewportTransform[5]
      );
      ctx.moveTo(
        (x - size) * zoom + viewportTransform[4],
        (y + size) * zoom + viewportTransform[5]
      );
      ctx.lineTo(
        (x + size) * zoom + viewportTransform[4],
        (y - size) * zoom + viewportTransform[5]
      );
  
      ctx.stroke();
      ctx.restore();
    }
  
    function isInRange(value1, value2) {
      value1 = Math.round(value1);
      value2 = Math.round(value2);
      for (
        var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin;
        i <= len;
        i++
      ) {
        if (i === value2) {
          return true;
        }
      }
      return false;
    }
  
    var verticalLines = [],
      horizontalLines = [],
      intersectionPoints = [];
  
    canvas.on('mouse:down', function () {
      viewportTransform = canvas.viewportTransform;
      // canvas.setViewportTransform(viewportTransform);
      // canvas.requestRenderAll();
      zoom = canvas.getZoom();
    });
  
    canvas.on('object:scaling', function (e) {
      showAlignments(e);
    });
  
    // canvas.on('mouse:move', function (e) {
    //   const target = e.target;
    //   if (!target) return;
    //   showAlignments(e);
    // });
  
    canvas.on('object:moving', function (e) {
      showAlignments(e);
    });
  
    function getObjectsInViewport(canvas) {
      // const viewportTransform = canvas.viewportTransform;
      // const zoom = canvas.getZoom();
  
      // Calculate the viewport boundaries
      const viewportLeft = -viewportTransform[4] / zoom;
      const viewportTop = -viewportTransform[5] / zoom;
      const viewportRight = viewportLeft + canvas.width / zoom;
      const viewportBottom = viewportTop + canvas.height / zoom;
  
      // Filter objects based on their bounding box positions
      const objectsInViewport = canvas.getObjects().filter((obj) => {
        const objBoundingBox = obj;
  
        // Check if object is within viewport boundaries
        return (
          !objBoundingBox.excludeFromAlignment &&
          objBoundingBox.left < viewportRight &&
          objBoundingBox.left + objBoundingBox.width > viewportLeft &&
          objBoundingBox.top < viewportBottom &&
          objBoundingBox.top + objBoundingBox.height > viewportTop
        );
      });
  
      return objectsInViewport;
    }
  
    function showAlignments(e) {
      var activeObject = e.target?.parentFrame ? e.target.parentFrame : e.target,
        //canvasObjects = canvas.getObjects(),
        canvasObjects = getObjectsInViewport(canvas, activeObject),
        activeObjectCenter = activeObject.getCenterPoint(),
        activeObjectLeft = activeObjectCenter.x,
        activeObjectTop = activeObjectCenter.y,
        activeObjectBoundingRect = activeObject.getBoundingRect(),
        activeObjectHeight =
          activeObjectBoundingRect.height / viewportTransform[3],
        activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
        horizontalInTheRange = false,
        verticalInTheRange = false,
        transform = canvas._currentTransform;
  
      if (!transform) return;
  
      // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
      // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move
  
      //intersectionPoints = []; // Reset intersection points on each move
  
      for (var i = canvasObjects.length; i--; ) {
        if (canvasObjects[i] === activeObject) continue;
  
        var objectCenter = canvasObjects[i].getCenterPoint(),
          objectLeft = objectCenter.x,
          objectTop = objectCenter.y,
          objectBoundingRect = canvasObjects[i].getBoundingRect(),
          objectHeight = objectBoundingRect.height / viewportTransform[3],
          objectWidth = objectBoundingRect.width / viewportTransform[0];
  
        // snaps if the right side of the active object touches the left side of the object
        if (
          isInRange(
            activeObjectLeft + activeObjectWidth / 2,
            objectLeft - objectWidth / 2
          )
        ) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft - objectWidth / 2,
            y1:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
            y2:
              activeObjectTop > objectTop
                ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
          });
  
          // Add intersection points: right edge of active object aligns with left edge of target object
  
          intersectionPoints.push(
            {
              x: activeObjectLeft + activeObjectWidth / 2,
              y: activeObjectTop - activeObjectHeight / 2,
            }, // Top corner of active object's right edge
            {
              x: activeObjectLeft + activeObjectWidth / 2,
              y: activeObjectTop + activeObjectHeight / 2,
            }, // Bottom corner of active object's right edge
            {
              x: objectLeft - objectWidth / 2,
              y: objectTop - objectHeight / 2,
            }, // Top corner of target's left edge
            { x: objectLeft - objectWidth / 2, y: objectTop + objectHeight / 2 } // Bottom corner of target's left edge
          );
  
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(
          //     objectLeft - objectWidth / 2 - activeObjectWidth / 2,
          //     activeObjectTop
          //   ),
          //   'center',
          //   'center'
          // );
        }
  
        // snaps if the left side of the active object touches the right side of the object
        if (
          isInRange(
            activeObjectLeft - activeObjectWidth / 2,
            objectLeft + objectWidth / 2
          )
        ) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
            y2:
              activeObjectTop > objectTop
                ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
                : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
          });
          // Add intersection points: left edge of active object aligns with right edge of target object
  
          intersectionPoints.push(
            {
              x: activeObjectLeft - activeObjectWidth / 2,
              y: activeObjectTop - activeObjectHeight / 2,
            }, // Top corner of active object's left edge
            {
              x: activeObjectLeft - activeObjectWidth / 2,
              y: activeObjectTop + activeObjectHeight / 2,
            }, // Bottom corner of active object's left edge
            {
              x: objectLeft + objectWidth / 2,
              y: objectTop - objectHeight / 2,
            }, // Top corner of target's right edge
            { x: objectLeft + objectWidth / 2, y: objectTop + objectHeight / 2 } // Bottom corner of target's right edge
          );
  
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(
          //     objectLeft + objectWidth / 2 + activeObjectWidth / 2,
          //     activeObjectTop
          //   ),
          //   'center',
          //   'center'
          // );
        }
  
        // snaps if the bottom of the object touches the top of the active object
        if (
          isInRange(
            objectTop + objectHeight / 2,
            activeObjectTop - activeObjectHeight / 2
          )
        ) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop + objectHeight / 2,
            x1:
              objectLeft < activeObjectLeft
                ? objectLeft - objectWidth / 2 - aligningLineOffset
                : objectLeft + objectWidth / 2 + aligningLineOffset,
            x2:
              activeObjectLeft > objectLeft
                ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
          });
  
          // Add intersection points: bottom edge of target object aligns with top edge of active object
          intersectionPoints.push(
            {
              x: objectLeft - objectWidth / 2,
              y: objectTop + objectHeight / 2,
            }, // Left corner of target's bottom edge
            {
              x: objectLeft + objectWidth / 2,
              y: objectTop + objectHeight / 2,
            }, // Right corner of target's bottom edge
            {
              x: activeObjectLeft - activeObjectWidth / 2,
              y: activeObjectTop - activeObjectHeight / 2,
            }, // Left corner of active object's top edge
            {
              x: activeObjectLeft + activeObjectWidth / 2,
              y: activeObjectTop - activeObjectHeight / 2,
            } // Right corner of active object's top edge
          );
  
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(
          //     activeObjectLeft,
          //     objectTop + objectHeight / 2 + activeObjectHeight / 2
          //   ),
          //   'center',
          //   'center'
          // );
        }
  
        // snaps if the top of the object touches the bottom of the active object
        if (
          isInRange(
            objectTop - objectHeight / 2,
            activeObjectTop + activeObjectHeight / 2
          )
        ) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight / 2,
            x1:
              objectLeft < activeObjectLeft
                ? objectLeft - objectWidth / 2 - aligningLineOffset
                : objectLeft + objectWidth / 2 + aligningLineOffset,
            x2:
              activeObjectLeft > objectLeft
                ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
                : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
          });
  
          // Add intersection points
  
          intersectionPoints.push(
            {
              x: objectLeft - objectWidth / 2,
              y: objectTop - objectHeight / 2,
            },
            {
              x: objectLeft + objectWidth / 2,
              y: objectTop - objectHeight / 2,
            },
            {
              x: activeObjectLeft - activeObjectWidth / 2,
              y: activeObjectTop + activeObjectHeight / 2,
            },
            {
              x: activeObjectLeft + activeObjectWidth / 2,
              y: activeObjectTop + activeObjectHeight / 2,
            }
          );
  
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(
          //     activeObjectLeft,
          //     objectTop - objectHeight / 2 - activeObjectHeight / 2
          //   ),
          //   'center',
          //   'center'
          // );
        }
  
        // Snap by the vertical center line alignment (center-to-center)
        if (isInRange(objectLeft, activeObjectLeft)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft,
            y1: activeObjectTop, // Start from the center of the active object
            y2:
              objectTop < activeObjectTop
                ? objectTop - objectHeight / 2 - aligningLineOffset
                : objectTop + objectHeight / 2 + aligningLineOffset,
          });
          if (verticalInTheRange)
            // Add intersection points with active object center as the main point
            intersectionPoints.push(
              { x: activeObjectLeft, y: activeObjectTop }, // Active object's center
              { x: objectLeft, y: objectTop - objectHeight / 2 },
              { x: objectLeft, y: objectTop + objectHeight / 2 }
            );
  
          // Snap the active object center to align with target object's center
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(objectLeft, activeObjectTop),
          //   'center',
          //   'center'
          // );
        }
  
        // Snap active object center to top edge of the target object
        if (isInRange(activeObjectTop, objectTop - objectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight / 2, // Align to the top edge of the target
            x1: Math.min(activeObjectLeft, objectLeft - objectWidth / 2),
            x2: Math.max(activeObjectLeft, objectLeft + objectWidth / 2),
          });
  
          // Add intersection points at the active object's center and target's top edge corners
          intersectionPoints.push(
            { x: activeObjectLeft, y: activeObjectTop }, // Center of active object
            { x: objectLeft - objectWidth / 2, y: objectTop - objectHeight / 2 }, // Left corner of target's top edge
            { x: objectLeft + objectWidth / 2, y: objectTop - objectHeight / 2 } // Right corner of target's top edge
          );
  
          // Position the active object so its center aligns with the top edge of the target
          // activeObject.setPositionByOrigin(
          //   new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2),
          //   'center',
          //   'center'
          // );
        }

         // Snap active object center to bottom edge of the target object
      if (isInRange(activeObjectTop, objectTop + objectHeight / 2)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1: Math.min(activeObjectLeft, objectLeft - objectWidth / 2),
          x2: Math.max(activeObjectLeft, objectLeft + objectWidth / 2),
        });

        // Add intersection points: active object's center, target's bottom corners, and target's center
        intersectionPoints.push(
          { x: activeObjectLeft, y: activeObjectTop }, // Center of active object
          { x: objectLeft - objectWidth / 2, y: objectTop + objectHeight / 2 }, // Left corner of target's bottom edge
          { x: objectLeft + objectWidth / 2, y: objectTop + objectHeight / 2 } // Right corner of target's bottom edge
        );

        // Position the active object so its center aligns with the top edge of the target
        // activeObject.setPositionByOrigin(
        //   new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2),
        //   'center',
        //   'center'
        // );
      }

      // Snap active object center to left edge of the target object
      if (isInRange(activeObjectLeft, objectLeft - objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1: Math.min(activeObjectTop, objectTop - objectHeight / 2),
          y2: Math.max(activeObjectTop, objectTop + objectHeight / 2),
        });

        // Add intersection points: center of active object, and target's left edge corners
        intersectionPoints.push(
          { x: activeObjectLeft, y: activeObjectTop }, // Center of active object
          { x: objectLeft - objectWidth / 2, y: objectTop - objectHeight / 2 }, // Top corner of target's left edge
          { x: objectLeft - objectWidth / 2, y: objectTop + objectHeight / 2 } // Bottom corner of target's left edge
        );

        // Position the active object so its center aligns with the top edge of the target
        // activeObject.setPositionByOrigin(
        //   new fabric.Point(objectLeft - objectWidth / 2, activeObjectTop),
        //   'center',
        //   'center'
        // );
      }

      // Snap active object center to right edge of the target object
      if (isInRange(activeObjectLeft, objectLeft + objectWidth / 2)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1: Math.min(activeObjectTop, objectTop - objectHeight / 2),
          y2: Math.max(activeObjectTop, objectTop + objectHeight / 2),
        });

        // Add intersection points: center of active object, and target's right edge corners
        intersectionPoints.push(
          { x: activeObjectLeft, y: activeObjectTop }, // Center of active object
          { x: objectLeft + objectWidth / 2, y: objectTop - objectHeight / 2 }, // Top corner of target's right edge
          { x: objectLeft + objectWidth / 2, y: objectTop + objectHeight / 2 } // Bottom corner of target's right edge
        );

        // Position the active object so its center aligns with the top edge of the target
        // activeObject.setPositionByOrigin(
        //   new fabric.Point(objectLeft + objectWidth / 2, activeObjectTop),
        //   'center',
        //   'center'
        // );
      }

      // 1. Snap active object's bottom edge to target object's center
      if (isInRange(activeObjectTop + activeObjectHeight / 2, objectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1: Math.min(
            activeObjectLeft - activeObjectWidth / 2,
            objectLeft - objectWidth / 2
          ),
          x2: Math.max(
            activeObjectLeft + activeObjectWidth / 2,
            objectLeft + objectWidth / 2
          ),
        });

        // Add intersection points: bottom edge of active object aligns with center of target object

        intersectionPoints.push(
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          }, // Left corner of active object's bottom edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          }, // Right corner of active object's bottom edge
          { x: objectLeft - objectWidth / 2, y: objectTop }, // Left side of target object's center
          { x: objectLeft + objectWidth / 2, y: objectTop } // Right side of target object's center
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     activeObjectLeft,
        //     objectTop - activeObjectHeight / 2
        //   ),
        //   'center',
        //   'center'
        // );
      }

      // 2. Snap active object's top edge to target object's center
      if (isInRange(activeObjectTop - activeObjectHeight / 2, objectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1: Math.min(
            activeObjectLeft - activeObjectWidth / 2,
            objectLeft - objectWidth / 2
          ),
          x2: Math.max(
            activeObjectLeft + activeObjectWidth / 2,
            objectLeft + objectWidth / 2
          ),
        });

        // Add intersection points: top edge of active object aligns with center of target object

        intersectionPoints.push(
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Left corner of active object's top edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Right corner of active object's top edge
          { x: objectLeft - objectWidth / 2, y: objectTop }, // Left side of target object's center
          { x: objectLeft + objectWidth / 2, y: objectTop } // Right side of target object's center
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     activeObjectLeft,
        //     objectTop + activeObjectHeight / 2
        //   ),
        //   'center',
        //   'center'
        // );
      }

      // 3. Snap active object's right edge to target object's center
      if (isInRange(activeObjectLeft + activeObjectWidth / 2, objectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft,
          y1: Math.min(
            activeObjectTop - activeObjectHeight / 2,
            objectTop - objectHeight / 2
          ),
          y2: Math.max(
            activeObjectTop + activeObjectHeight / 2,
            objectTop + objectHeight / 2
          ),
        });

        // Add intersection points: right edge of active object aligns with center of target object
        intersectionPoints.push(
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Top corner of active object's right edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          }, // Bottom corner of active object's right edge
          { x: objectLeft, y: objectTop - objectHeight / 2 }, // Top of target object's center
          { x: objectLeft, y: objectTop + objectHeight / 2 } // Bottom of target object's center
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(objectLeft - activeObjectWidth / 2, activeObjectTop),
        //   'center',
        //   'center'
        // );
      }

      // 4. Snap active object's left edge to target object's center
      if (isInRange(activeObjectLeft - activeObjectWidth / 2, objectLeft)) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft,
          y1: Math.min(
            activeObjectTop - activeObjectHeight / 2,
            objectTop - objectHeight / 2
          ),
          y2: Math.max(
            activeObjectTop + activeObjectHeight / 2,
            objectTop + objectHeight / 2
          ),
        });

        // Add intersection points: left edge of active object aligns with center of target object

        intersectionPoints.push(
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Top corner of active object's left edge
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          }, // Bottom corner of active object's left edge
          { x: objectLeft, y: objectTop - objectHeight / 2 }, // Top of target object's center
          { x: objectLeft, y: objectTop + objectHeight / 2 } // Bottom of target object's center
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(objectLeft + activeObjectWidth / 2, activeObjectTop),
        //   'center',
        //   'center'
        // );
      }

      // snap by the left edge
      if (
        isInRange(
          objectLeft - objectWidth / 2,
          activeObjectLeft - activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft - objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        // Add intersection points: left edge alignment of both objects

        intersectionPoints.push(
          {
            x: objectLeft - objectWidth / 2,
            y: objectTop - objectHeight / 2,
          }, // Top corner of target's left edge
          {
            x: objectLeft - objectWidth / 2,
            y: objectTop + objectHeight / 2,
          }, // Bottom corner of target's left edge
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Top corner of active object's left edge
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          } // Bottom corner of active object's left edge
        );
        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     objectLeft - objectWidth / 2 + activeObjectWidth / 2,
        //     activeObjectTop
        //   ),
        //   'center',
        //   'center'
        // );
      }

      // snap by the right edge
      if (
        isInRange(
          objectLeft + objectWidth / 2,
          activeObjectLeft + activeObjectWidth / 2
        )
      ) {
        verticalInTheRange = true;
        verticalLines.push({
          x: objectLeft + objectWidth / 2,
          y1:
            objectTop < activeObjectTop
              ? objectTop - objectHeight / 2 - aligningLineOffset
              : objectTop + objectHeight / 2 + aligningLineOffset,
          y2:
            activeObjectTop > objectTop
              ? activeObjectTop + activeObjectHeight / 2 + aligningLineOffset
              : activeObjectTop - activeObjectHeight / 2 - aligningLineOffset,
        });
        // Add intersection points: right edge alignment of both objects

        intersectionPoints.push(
          {
            x: objectLeft + objectWidth / 2,
            y: objectTop - objectHeight / 2,
          }, // Top corner of target's right edge
          {
            x: objectLeft + objectWidth / 2,
            y: objectTop + objectHeight / 2,
          }, // Bottom corner of target's right edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Top corner of active object's right edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          } // Bottom corner of active object's right edge
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     objectLeft + objectWidth / 2 - activeObjectWidth / 2,
        //     activeObjectTop
        //   ),
        //   'center',
        //   'center'
        // );
      }

      // snap by the horizontal center line
      if (isInRange(objectTop, activeObjectTop)) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop,
          x1: activeObjectLeft,
          x2:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset, // Extend to the left or right edge of the target object
        });
        // Add intersection points: horizontal center alignment of both objects

        intersectionPoints.push(
          { x: activeObjectLeft, y: activeObjectTop }, // Center of active object
          { x: objectLeft - objectWidth / 2, y: objectTop }, // Left center point of target object
          { x: objectLeft + objectWidth / 2, y: objectTop } // Right center point of target object
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(activeObjectLeft, objectTop),
        //   'center',
        //   'center'
        // );
      }

      // snap by the top edge
      if (
        isInRange(
          objectTop - objectHeight / 2,
          activeObjectTop - activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop - objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        // Add intersection points: top edge alignment of both objects

        intersectionPoints.push(
          {
            x: objectLeft - objectWidth / 2,
            y: objectTop - objectHeight / 2,
          }, // Left corner of target's top edge
          {
            x: objectLeft + objectWidth / 2,
            y: objectTop - objectHeight / 2,
          }, // Right corner of target's top edge
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          }, // Left corner of active object's top edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop - activeObjectHeight / 2,
          } // Right corner of active object's top edge
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     activeObjectLeft,
        //     objectTop - objectHeight / 2 + activeObjectHeight / 2
        //   ),
        //   'center',
        //   'center'
        // );
      }

      // snap by the bottom edge
      if (
        isInRange(
          objectTop + objectHeight / 2,
          activeObjectTop + activeObjectHeight / 2
        )
      ) {
        horizontalInTheRange = true;
        horizontalLines.push({
          y: objectTop + objectHeight / 2,
          x1:
            objectLeft < activeObjectLeft
              ? objectLeft - objectWidth / 2 - aligningLineOffset
              : objectLeft + objectWidth / 2 + aligningLineOffset,
          x2:
            activeObjectLeft > objectLeft
              ? activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset
              : activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset,
        });
        // Add intersection points: bottom edge alignment of both objects

        intersectionPoints.push(
          {
            x: objectLeft - objectWidth / 2,
            y: objectTop + objectHeight / 2,
          }, // Left corner of target's bottom edge
          {
            x: objectLeft + objectWidth / 2,
            y: objectTop + objectHeight / 2,
          }, // Right corner of target's bottom edge
          {
            x: activeObjectLeft - activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          }, // Left corner of active object's bottom edge
          {
            x: activeObjectLeft + activeObjectWidth / 2,
            y: activeObjectTop + activeObjectHeight / 2,
          } // Right corner of active object's bottom edge
        );

        // activeObject.setPositionByOrigin(
        //   new fabric.Point(
        //     activeObjectLeft,
        //     objectTop + objectHeight / 2 - activeObjectHeight / 2
        //   ),
        //   'center',
        //   'center'
        // );
      }
    }

    // if (!horizontalInTheRange && !verticalInTheRange) {
    //   intersectionPoints.length = 0; // Reset points if no alignment is found
    // }

    if (!horizontalInTheRange) {
      horizontalLines.length = 0;
    }

    if (!verticalInTheRange) {
      verticalLines.length = 0;
    }
  }

  canvas.on('before:render', function () {
    if (canvas.contextTop) {
      canvas.clearContext(canvas.contextTop);
    }
  });

  canvas.on('after:render', function () {
    for (var i = verticalLines.length; i--; ) {
      drawVerticalLine(verticalLines[i]);
    }
    for (var i = horizontalLines.length; i--; ) {
      drawHorizontalLine(horizontalLines[i]);
    }

    // Draw rectangles at each intersection point
    for (var i = intersectionPoints.length; i--; ) {
      drawCross(intersectionPoints[i].x, intersectionPoints[i].y);
    }

    verticalLines.length = horizontalLines.length = 0;
    intersectionPoints.length = 0;
  });

  canvas.on('mouse:up', function () {
    verticalLines.length = horizontalLines.length = 0;
    intersectionPoints.length = 0;

    canvas.renderAll();
  });
};