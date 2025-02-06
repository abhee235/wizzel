import * as fabric from 'fabric';
import { v4 as uuid4 } from 'uuid';

class Arrow extends fabric.Polyline {
  static type: string = 'arrow';
  declare objectId: string;

  constructor(options) {
    const x1 = 0,
      y1 = 0,
      x2 = 100,
      y2 = 100;

    const {
      headSize = 10,
      objectId = options.objectId || uuid4(),

      ...restOptions
    } = options || {};

    super(
      [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
      {
        ...restOptions,
      }
    );

    this.x1 = x1; // Start point
    this.y1 = y1; // Start point
    this.x2 = x2; // End point
    this.y2 = y2; // End point
    this.headSize = headSize; // Size of the arrowhead

    // this.hasBorders = false; // Disable borders
    // this.hasControls = false; // Disable default controls
  }

  // Custom rendering logic
  _render(ctx) {
    // Call the parent rendering logic
    super._render(ctx);

    // Add arrowhead at the last point
    const points = this.points;
    if (points.length < 2) return; // Ensure there are at least two points

    const { x: x2, y: y2 } = points[points.length - 1]; // End point
    const { x: x1, y: y1 } = points[points.length - 2]; // Second to last point

    // Calculate the angle of the arrow
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // Draw the arrowhead
    ctx.save();
    ctx.fillStyle = this.stroke || 'black'; // Use stroke color for arrowhead
    ctx.beginPath();
    ctx.moveTo(x2 / 2, y2 / 2); // Arrow tip
    ctx.lineTo(
      x2 / 2 - this.headSize * Math.cos(angle - Math.PI / 6),
      y2 / 2 - this.headSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 / 2 - this.headSize * Math.cos(angle + Math.PI / 6),
      y2 / 2 - this.headSize * Math.sin(angle + Math.PI / 6)
    );
    console.log('Arrowhead tip:', { x: x2, y: y2 });
    console.log('Arrowhead left:', {
      x: x2 - this.headSize * Math.cos(angle - Math.PI / 6),
      y: y2 - this.headSize * Math.sin(angle - Math.PI / 6),
    });
    console.log('Arrowhead right:', {
      x: x2 - this.headSize * Math.cos(angle + Math.PI / 6),
      y: y2 - this.headSize * Math.sin(angle + Math.PI / 6),
    });
    ctx.closePath();
    ctx.fill(); // Fill the arrowhead
    ctx.restore();
  }

  // Include custom properties in the serialization
  toObject() {
    return {
      ...super.toObject(),
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      objectId: this.objectId,
      headSize: this.headSize,
    };
  }

  // Define deserialization logic
  static fromObject(object) {
    return new Promise((resolve) => {
      const arrow = new Arrow(object);
      resolve(arrow);
    });
  }
}

// Register the class with Fabric.js
fabric.classRegistry.setClass(Arrow, 'arrow');
fabric.classRegistry.setSVGClass(Arrow, 'arrow');

export default Arrow;