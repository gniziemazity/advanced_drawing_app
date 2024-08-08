class Oval extends Shape {
   constructor(corner1, options) {
      super(options);
      //take out corner 1 and corner 2 to
      //the drawing tool itself (it will need its own object)
      this.corner1 = corner1;
      this.corner2 = corner1;
   }

   load(data, stageProperties) {
      this.id = data.id;
      this.options = JSON.parse(JSON.stringify(data.options));
      this.center = Vector.load(data.center);
      this.center.x += stageProperties.left;
      this.center.y += stageProperties.top;
      this.size = data.size;
      this.selected = data.selected;
   }

   serialize() {
      return {
         type: "Oval",
         id: this.id,
         options: JSON.parse(JSON.stringify(this.options)),
         center: new Vector(
            this.center.x - stageProperties.left,
            this.center.y - stageProperties.top
         ),
         size: this.size,
         selected: this.selected,
      };
   }

   setCorner2(corner2) {
      this.corner2 = corner2;
   }

   getPoints() {
      if (this.size) {
         return [
            new Vector(-this.size.width / 2, -this.size.height / 2),
            new Vector(-this.size.width / 2, this.size.height / 2),
            new Vector(this.size.width / 2, this.size.height / 2),
            new Vector(this.size.width / 2, -this.size.height / 2),
         ];
      } else {
         return [this.corner1, this.corner2];
      }
   }

   setPoints(points) {
      //this.corner1 = points[0];
      //this.corner2 = points[1];
   }

   setWidth(width) {
      this.size.width = width;
   }

   setHeight(height) {
      this.size.height = height;
   }

   draw(ctx, hitRegion = false) {
      const center = this.center ? this.center : { x: 0, y: 0 };
      let left, top, width, height;
      if (this.size) {
         left = center.x - this.size.width / 2;
         top = center.y - this.size.height / 2;
         width = this.size.width;
         height = this.size.height;
      } else {
         const minX = Math.min(this.corner1.x, this.corner2.x);
         const minY = Math.min(this.corner1.y, this.corner2.y);
         width = Math.abs(this.corner1.x - this.corner2.x);
         height = Math.abs(this.corner1.y - this.corner2.y);
         left = minX + center.x;
         top = minY + center.y;
      }
      ctx.beginPath();
      const radius1 = Math.abs(width / 2);
      const radius2 = Math.abs(height / 2);
      ctx.ellipse(
         left + width / 2,
         top + height / 2,
         radius1,
         radius2,
         0,
         0,
         2 * Math.PI
      );

      if (hitRegion) {
         this.applyHitRegionStyles(ctx);
      } else {
         this.applyStyles(ctx);
      }
   }

}
