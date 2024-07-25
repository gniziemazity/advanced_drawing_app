function getSize(points) {
   const minX = Math.min(...points.map((p) => p.x));
   const minY = Math.min(...points.map((p) => p.y));
   const maxX = Math.max(...points.map((p) => p.x));
   const maxY = Math.max(...points.map((p) => p.y));
   return {
      width: maxX - minX,
      height: maxY - minY,
   };
}
