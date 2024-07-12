class Rect extends Shape {
   constructor(corner1, options) {
      super(options);
      this.corner1 = corner1;
      this.corner2 = corner1;
   }

   setCorner2(corner2) {
      this.corner2 = corner2;
   }

   getPoints() {
      return [this.corner1, this.corner2];
   }
   
   setPoints(points) {
      this.corner1 = points[0];
      this.corner2 = points[1];
   }
   
   draw(ctx,hitRegion=false) {
      const center=this.center?this.center:{x:0,y:0};
      const minX = Math.min(this.corner1.x, this.corner2.x);
      const minY = Math.min(this.corner1.y, this.corner2.y);
      const width = Math.abs(this.corner1.x - this.corner2.x);
      const height = Math.abs(this.corner1.y - this.corner2.y);
      ctx.beginPath();
      ctx.rect(minX + center.x, minY + center.y, width, height);
      
      if(hitRegion){
         this.applyHitRegionStyles(ctx);
      }else{
         this.applyStyles(ctx);
         if (this.selected) {
            this.drawGizmo(ctx);
         }
      }
   }
}
