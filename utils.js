function averagePoints(points) {
   const sum = points.reduce((acc, p) => addPoints(acc, p), { x: 0, y: 0 });
   return { x: sum.x / points.length, y: sum.y / points.length };
}

function getMidPoint(points) {
   const minX = Math.min(...points.map((p) => p.x));
   const minY = Math.min(...points.map((p) => p.y));
   const maxX = Math.max(...points.map((p) => p.x));
   const maxY = Math.max(...points.map((p) => p.y));
   return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
}

function addPoints(p1, p2) {
   return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function subtractPoints(p1, p2) {
   return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function equalPoints(p1, p2) {
   return p1.x === p2.x && p1.y === p2.y;
}