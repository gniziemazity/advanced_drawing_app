function downCallbackForSelect(e) {
   const startPosition = new Vector(e.offsetX, e.offsetY);

   const [r, g, b, a] = hitTestingCtx.getImageData(
      startPosition.x,
      startPosition.y,
      1,
      1
   ).data;

   const id = (r << 16) | (g << 8) | b;
   const shape = shapes.find((s) => s.id == id);

   shapes.forEach((s) => (s.selected = false));
   drawShapes(shapes);

   if (shape) {
      shape.selected = true;
      const oldCenter = shape.center;
      drawShapes(shapes);

      const moveCallback = function (e) {
         const mousePosition = new Vector(e.offsetX, e.offsetY);
         const newPoint = Vector.subtract(mousePosition, startPosition);
         shape.setCenter(Vector.add(oldCenter, newPoint));
         drawShapes(shapes);
      };

      const upCallback = function (e) {
         myCanvas.removeEventListener("pointermove", moveCallback);
         myCanvas.removeEventListener("pointerup", upCallback);
      };
      myCanvas.addEventListener("pointermove", moveCallback);
      myCanvas.addEventListener("pointerup", upCallback);
   }
}