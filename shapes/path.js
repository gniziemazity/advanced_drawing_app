class Path extends Shape {
   constructor(startPoint, options) {
      super(options);
      this.points = [startPoint];
   }

   static load(data, stageProperties) {
      const path = new Path();
      path.id = data.id;
      path.options = JSON.parse(JSON.stringify(data.options));
      path.center = new Vector(
         data.center.x + stageProperties.left,
         data.center.y + stageProperties.top
      );
      path.size = data.size;
      path.points = data.points.map((p) => Vector.load(p));
      return path;
   }

   serialize(stageProperties) {
      return {
         type: "Path",
         id: this.id,
         options: JSON.parse(JSON.stringify(this.options)),
         center: new Vector(
            this.center.x - stageProperties.left,
            this.center.y - stageProperties.top
         ),
         size: this.size,
         selected: this.selected,
         points: this.points,
      };
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

   setWidth(width) {
      const size = getSize(this.points);
      const ratio = width / size.width;
      for (const point of this.points) {
         point.x *= ratio;
      }
      this.size.width = width;
   }

   setHeight(height) {
      const size = getSize(this.points);
      const ratio = height / size.height;
      for (const point of this.points) {
         point.y *= ratio;
      }
      this.size.height = height;
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

   static addPointerDownListener(e) {
      if (e.button !== 0) return;

      const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
      currentShape = new Path(startPosition, getOptions());

      const moveCallback = function (e) {
         const mousePosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
         currentShape.addPoint(mousePosition);

         drawShapes([...shapes, currentShape]);
      };

      const upCallback = function (e) {
         myCanvas.removeEventListener("pointermove", moveCallback);
         myCanvas.removeEventListener("pointerup", upCallback);

         currentShape.recenter();
         shapes.push(currentShape);

         updateHistory(shapes);
      };
      myCanvas.addEventListener("pointermove", moveCallback);
      myCanvas.addEventListener("pointerup", upCallback);
   }
}
