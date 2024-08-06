class Vector{
   constructor(x, y){
      this.x = x;
      this.y = y;
   }

   static zero(){
      return new Vector(0, 0);
   }

   static load(data){
      return new Vector(data.x, data.y);
   }

   add(v){
      return new Vector(this.x + v.x, this.y + v.y);
   }

   subtract(v){
      return new Vector(this.x - v.x, this.y - v.y);
   }

   magnitude(){
      return Math.sqrt(this.x * this.x + this.y * this.y);
   }

   scale(scalar){
      return new Vector(this.x * scalar, this.y * scalar);
   }

   static midVector(vectors){
      const minX = Math.min(...vectors.map((p) => p.x));
      const minY = Math.min(...vectors.map((p) => p.y));
      const maxX = Math.max(...vectors.map((p) => p.x));
      const maxY = Math.max(...vectors.map((p) => p.y));
      return new Vector(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2);
   }

   static add(v1, v2){
      return v1.add(v2);
   }

   static subtract(v1, v2){
      return v1.subtract(v2);
   }

   static magnitude(v){
      return v.magnitude();
   }

   static scale(v, scalar){
      return v.scale(scalar);
   }
}