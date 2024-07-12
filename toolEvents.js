function downCallbackForRect(e) {
   const mousePosition = {
      x: e.offsetX,
      y: e.offsetY,
   };
   currentShape = new Rect(mousePosition, getOptions());

   const moveCallback = function (e) {
      const mousePosition = {
         x: e.offsetX,
         y: e.offsetY,
      };
      currentShape.setCorner2(mousePosition);

      drawShapes([...shapes, currentShape]);
   };

   const upCallback = function (e) {
      myCanvas.removeEventListener("pointermove", moveCallback);
      myCanvas.removeEventListener("pointerup", upCallback);

      currentShape.recenter();
      shapes.push(currentShape);
   };
   myCanvas.addEventListener("pointermove", moveCallback);
   myCanvas.addEventListener("pointerup", upCallback);
}

function downCallbackForPath(e) {
   const mousePosition = {
      x: e.offsetX,
      y: e.offsetY,
   };
   currentShape = new Path(mousePosition, getOptions());

   const moveCallback = function (e) {
      const mousePosition = {
         x: e.offsetX,
         y: e.offsetY,
      };
      currentShape.addPoint(mousePosition);

      drawShapes([...shapes, currentShape]);
   };

   const upCallback = function (e) {
      myCanvas.removeEventListener("pointermove", moveCallback);
      myCanvas.removeEventListener("pointerup", upCallback);

      currentShape.recenter();
      shapes.push(currentShape);
   };
   myCanvas.addEventListener("pointermove", moveCallback);
   myCanvas.addEventListener("pointerup", upCallback);
}

function downCallbackForSelect(e) {
   const startPosition = {
      x: e.offsetX,
      y: e.offsetY,
   };

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
         const mousePosition = {
            x: e.offsetX,
            y: e.offsetY,
         };
         const newPoint = subtractPoints(mousePosition, startPosition);
         shape.setCenter(addPoints(oldCenter, newPoint));
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