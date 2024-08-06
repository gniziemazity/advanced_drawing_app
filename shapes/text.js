class Text extends Shape {
   constructor(center, options) {
      super(options);
      this.center = center;

      //unify later with other shapes
      this.properties = {
         fontSize: 60,
         font: "60px Arial",
         textAlign: "center",
         textBaseline: "middle",
         dilation: 10, //for hit test
      };

      this.setText("Enter Text Here");
   }

   static load(data, stageProperties) {
      const text = new Text();
      text.id = data.id;
      text.options = JSON.parse(JSON.stringify(data.options));
      text.center = Vector.load(data.center);
      text.center.x += stageProperties.left;
      text.center.y += stageProperties.top;
      text.size = data.size;
      text.selected = data.selected;
      text.text = data.text;
      return text;
   }

   serialize() {
      return {
         type: "Text",
         id: this.id,
         options: JSON.parse(JSON.stringify(this.options)),
         center: new Vector(
            this.center.x - stageProperties.left,
            this.center.y - stageProperties.top
         ),
         size: this.size,
         text: this.text,
         selected: this.selected,
      };
   }

   setCorner2(corner2) {
      this.corner2 = corner2;
   }

   getPoints() {
      return [
         new Vector(-this.size.width / 2, -this.size.height / 2),
         new Vector(-this.size.width / 2, this.size.height / 2),
         new Vector(this.size.width / 2, this.size.height / 2),
         new Vector(this.size.width / 2, -this.size.height / 2),
      ];
   }

   setPoints(points) {
      //this.corner1 = points[0];
      //this.corner2 = points[1];
   }

   setWidth(width) {
      //do nothing
   }

   setHeight(height) {
      //do nothing
   }

   setProperties(ctx) {
      for (const key in this.properties) {
         ctx[key] = this.properties[key];
      }
   }

   // WARNING, ctx is global
   setText(value) {
      this.text = value;
      ctx.save();
      this.setProperties(ctx);
      const metrics = ctx.measureText(this.text);
      this.size = {};
      this.size.width = metrics.width;
      this.size.height = this.properties.fontSize;
      ctx.restore();
   }

   draw(ctx, hitRegion = false) {
      const center = this.center ? this.center : { x: 0, y: 0 };
      let left, top, width, height;

      left = center.x - this.size.width / 2;
      top = center.y - this.size.height / 2;
      width = this.size.width;
      height = this.size.height;

      ctx.save();
      this.setProperties(ctx);

      if (hitRegion) {
         ctx.beginPath();
         const rgb = this.getHitRGB();
         ctx.fillStyle = rgb;
         ctx.strokeStyle = rgb;
         ctx.lineWidth = this.options.strokeWidth + this.properties.dilation;
         ctx.fillText(this.text, left + width / 2, top + height / 2);
         ctx.strokeText(this.text, left + width / 2, top + height / 2);

         ctx.restore();
      } else {
         ctx.beginPath();
         if (this.options.fill) {
            ctx.fillStyle = this.options.fillColor;
            ctx.fillText(this.text, left + width / 2, top + height / 2);
         }
         if (this.options.stroke) {
            ctx.strokeStyle = this.options.strokeColor;
            ctx.lineWidth = this.options.strokeWidth;
            ctx.strokeText(this.text, left + width / 2, top + height / 2);
         }
         ctx.restore();
         if (this.selected) {
            this.drawGizmo(ctx);
         }
      }
   }

   static addPointerDownListener(e) {
      if(e.button !== 0) return;

      const mousePosition = new Vector(e.offsetX, e.offsetY).subtract(canvasProperties.offset);
      const scaledPosition = mousePosition
         .scale(1 / viewport.zoom)
         .subtract(viewport.offset);
      currentShape = new Text(scaledPosition, getOptions());

      shapes.push(currentShape);
      drawShapes(shapes);

      updateHistory(shapes);
   }
}
