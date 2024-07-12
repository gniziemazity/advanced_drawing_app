class Path extends Shape {
   constructor(startPoint, options) {
      super(options);
      this.points = [startPoint];
   }

   addPoint(point) {
      this.points.push(point);
   }

   getPoints() {
      return this.points;
   }
   
   setPoints(points) {
      this.points = points;
   }

   draw(ctx, hitRegion = false) {
      const center = this.center ? this.center : { x: 0, y: 0 };
      ctx.beginPath();
      ctx.moveTo(this.points[0].x + center.x, this.points[0].y + center.y);
      for (let i = 1; i < this.points.length; i++) {
         ctx.lineTo(this.points[i].x + center.x, this.points[i].y + center.y);
      }
      if (hitRegion) {
         this.applyHitRegionStyles(ctx);
      } else {
         this.applyStyles(ctx);
         if (this.selected) {
            this.drawGizmo(ctx);
         }
      }
   }
}
