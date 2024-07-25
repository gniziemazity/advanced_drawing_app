class Vector{
   constructor(x, y){
      this.x = x;
      this.y = y;
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
}