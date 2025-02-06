import * as fabric from 'fabric';

class Star extends fabric.Polygon {
  static type: string = 'star';
  declare objectId: string;

  constructor(options) {
    const {
      spikes = 5, // Number of spikes
      outerRadius = 50, // Outer radius of the star
      innerRadius = 25, // Inner radius of the star
      rx = 0, // Rounded corner x-radius
      ry = 0, // Rounded corner y-radius
      centerX = 0, // X-coordinate of the center
      centerY = 0, // Y-coordinate of the center
      ...restOptions
    } = options;

    // Generate points for the star
    const points = Star.generatePoints(
      spikes,
      outerRadius,
      innerRadius,
      centerX,
      centerY
    );

    // Call the parent fabric.Polygon constructor
    super(points, restOptions);

    // Store additional properties
    this.spikes = spikes;
    this.outerRadius = outerRadius;
    this.innerRadius = innerRadius;
    this.rx = rx; // Rounded corner x-radius
    this.ry = ry; // Rounded corner y-radius
    this.centerX = centerX;
    this.centerY = centerY;
  }

  // Static method to generate points for a star
  static generatePoints(spikes, outerRadius, innerRadius, centerX, centerY) {
    const points = [];
    const angleStep = Math.PI / spikes; // Half-angle between points

    for (let i = 0; i < 2 * spikes; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius; // Alternate between outer and inner radii
      const angle = i * angleStep - Math.PI / 2; // Start at the top (-90 degrees)
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      });
    }

    return points;
  }

  // Override the render method to include rounded vertices for all points
  _render(ctx) {
    const { points, rx, ry } = this;
    if (!points || points.length < 2) return;

    ctx.beginPath();

    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length]; // Wrap around to the first point
      const prev = points[(i - 1 + points.length) % points.length]; // Previous point

      // Calculate angles for previous and next edges
      const dxPrev = current.x - prev.x;
      const dyPrev = current.y - prev.y;
      const prevAngle = Math.atan2(dyPrev, dxPrev);

      const dxNext = next.x - current.x;
      const dyNext = next.y - current.y;
      const nextAngle = Math.atan2(dyNext, dxNext);

      // Calculate corner radius based on rx and ry
      const cornerRadius = Math.min(
        rx,
        ry,
        Math.hypot(dxPrev, dyPrev) / 2,
        Math.hypot(dxNext, dyNext) / 2
      );

      // Calculate start and end points for the arc
      const startX = current.x - cornerRadius * Math.cos(prevAngle);
      const startY = current.y - cornerRadius * Math.sin(prevAngle);
      const endX = current.x + cornerRadius * Math.cos(nextAngle);
      const endY = current.y + cornerRadius * Math.sin(nextAngle);

      if (i === 0) {
        ctx.moveTo(startX, startY);
      } else {
        ctx.lineTo(startX, startY);
      }

      // Draw the arc
      ctx.arcTo(current.x, current.y, endX, endY, cornerRadius);
    }

    ctx.closePath();

    // Apply stroke and fill styles
    this._renderFill(ctx);
    this._renderStroke(ctx);
  }

  // Override the toObject method to include custom properties
  toObject() {
    return {
      ...super.toObject(),
      spikes: this.spikes,
      outerRadius: this.outerRadius,
      innerRadius: this.innerRadius,
      rx: this.rx,
      ry: this.ry,
      centerX: this.centerX,
      centerY: this.centerY,
    };
  }

  // Static method for JSON deserialization
  static fromObject(object) {
    return new Promise((resolve) => {
      const {
        spikes,
        outerRadius,
        innerRadius,
        rx,
        ry,
        centerX,
        centerY,
        ...rest
      } = object;

      // Recreate the star shape
      const star = new Star({
        spikes,
        outerRadius,
        innerRadius,
        rx,
        ry,
        centerX,
        centerY,
        ...rest,
      });

      resolve(star);
    });
  }
}

// Register the class with Fabric.js
fabric.classRegistry.setClass(Star, 'star');
fabric.classRegistry.setSVGClass(Star, 'star');

export default Star;
