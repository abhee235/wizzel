import { Polygon, classRegistry } from 'fabric';
import { v4 as uuidv4 } from 'uuid';

class PolygonShape extends Polygon {
  static type: string = 'polygonshape';
  declare objectId: string;

  constructor(options) {
    // Destructure options to extract numberOfSides and radius
    const {
      numberOfSides = 3,
      radius = 50,
      rx = 0,
      ry = 0,
      ...restOptions
    } = options;

    // Generate points for the polygon
    const points = PolygonShape.generatePoints(
      numberOfSides,
      radius,
      options.mouseX,
      options.mouseY
    );

    // Call the parent fabric.Polygon constructor
    super(points, {
      originX: 'left',
      originY: 'top', // Center the polygon for proper positioning
      ...restOptions,
    });

    // Store additional properties
    this.numberOfSides = numberOfSides;
    this.radius = radius;
    this.rx = rx; // Rounded corner x-radius
    this.ry = ry; // Rounded corner y-radius
    this.objectId = this.objectId || uuidv4();
  }

  static generatePoints(numberOfSides, radius, mouseX, mouseY) {
    const points = [];
    const angleStep = (2 * Math.PI) / numberOfSides; // Angle between vertices

    for (let i = 0; i < numberOfSides; i++) {
      const angle = i * angleStep - Math.PI / 2; // Start from top (90 degrees counter-clockwise)
      points.push({
        x: radius * Math.cos(angle), // Offset by mouseX
        y: radius * Math.sin(angle), // Offset by mouseY
      });
    }

    return points;
  }

  // Custom render function with rounded vertices
  _render(ctx) {
    const { points, rx, ry } = this;
    if (!points || points.length < 2) return;

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length]; // Wrap around to the first point
      const prev = points[(i - 1 + points.length) % points.length]; // Previous point

      const dxPrev = current.x - prev.x;
      const dyPrev = current.y - prev.y;
      const prevAngle = Math.atan2(dyPrev, dxPrev);

      const dxNext = next.x - current.x;
      const dyNext = next.y - current.y;
      const nextAngle = Math.atan2(dyNext, dxNext);

      const r = Math.min(
        rx,
        ry,
        Math.hypot(dxPrev, dyPrev) / 2,
        Math.hypot(dxNext, dyNext) / 2
      );

      const startX = current.x - r * Math.cos(prevAngle);
      const startY = current.y - r * Math.sin(prevAngle);
      const endX = current.x + r * Math.cos(nextAngle);
      const endY = current.y + r * Math.sin(nextAngle);

      if (i === 0) {
        ctx.moveTo(startX, startY);
      } else {
        ctx.lineTo(startX, startY);
      }

      ctx.arcTo(current.x, current.y, endX, endY, r);
    }

    ctx.closePath();

    this._renderPaintInOrder(ctx);
    // this._renderFill(ctx);
    // this._renderStroke(ctx);
  }

  // Override the toObject method to include custom properties
  toObject() {
    return {
      ...super.toObject(),
      numberOfSides: this.numberOfSides,
      radius: this.radius,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      rx: this.rx,
      ry: this.ry,
    };
  }

  static fromObject(object) {
    return new Promise((resolve) => {
      const { numberOfSides, radius, ...rest } = object;

      // Recreate the polygon shape
      const polygon = new PolygonShape({
        numberOfSides,
        radius,
        ...rest,
      });

      resolve(polygon);
    });
  }
}

// Register the class for deserialization
classRegistry.setClass(PolygonShape, 'polygonshape');
classRegistry.setSVGClass(PolygonShape, 'polygonshape');

export default PolygonShape;
