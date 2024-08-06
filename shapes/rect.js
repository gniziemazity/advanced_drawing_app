class Rect extends Shape {
   constructor(corner1, options) {
      super(options);
      //take out corner 1 and corner 2 to
      //the drawing tool itself (it will need its own object)
      this.corner1 = corner1;
      this.corner2 = corner1;
   }

   static load(data, stageProperties) {
      const rect = new Rect();
      rect.id = data.id;
      rect.options = JSON.parse(JSON.stringify(data.options));
      rect.center = Vector.load(data.center);
      rect.center.x += stageProperties.left;
      rect.center.y += stageProperties.top;
      rect.size = data.size;
      rect.selected = data.selected;
      return rect;
   }

   serialize() {
      return {
         type: "Rect",
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
      ctx.rect(left, top, width, height);

      if (hitRegion) {
         this.applyHitRegionStyles(ctx);
      } else {
         this.applyStyles(ctx);
         if (this.selected) {
            this.drawGizmo(ctx);
         }
      }
   }

   static addPointerDownListener(e) {
      if(e.button !== 0) return;

      const mousePosition = new Vector(e.offsetX, e.offsetY).subtract(canvasProperties.offset);
      const startPosition = mousePosition
         .scale(1 / viewport.zoom)
         .subtract(viewport.offset);

      currentShape = new Rect(startPosition, getOptions());

      const moveCallback = (e) => {
         secondCornerMoveCallback(e, startPosition, currentShape);
      };
      const upCallback = (e) => {
         secondCornerUpCallback(e, currentShape, moveCallback, upCallback);
      };
      myCanvas.addEventListener("pointermove", moveCallback);
      myCanvas.addEventListener("pointerup", upCallback);
   }
}
