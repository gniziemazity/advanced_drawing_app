class PropertiesPanel {
   constructor(holderDiv) {
      this.holderDiv = holderDiv;
      this.holderDiv.innerHTML = `
         Properties
         <br/>
         <label for="x">X:</label>
         <input
            type="number"
            id="x"
            title="X"
            onchange="PropertiesPanel.changeX(this.value)"
         />
         <br />
         <label for="y">Y:</label>
         <input
            type="number"
            id="y"
            title="Y"
            onchange="PropertiesPanel.changeY(this.value)"
         />
         <br />
         <label for="width">Width:</label>
         <input
            type="number"
            id="width"
            title="Width"
            onchange="PropertiesPanel.changeWidth(this.value)"
         />
         <br />
         <label for="height">Height:</label>
         <input
            type="number"
            id="height"
            title="Height"
            onchange="PropertiesPanel.changeHeight(this.value)"
         />
         <br />
         <input
            type="color"
            id="fillColor"
            value="#ff0000"
            title="Fill Color"
            oninput="PropertiesPanel.changeFillColor(this.value)"
         />
         <input
            type="checkbox"
            id="fill"
            checked
            title="Fill"
            onchange="PropertiesPanel.changeFill(this.checked)"
         />
         <br />
         <input
            type="color"
            id="strokeColor"
            value="#0000ff"
            title="Stroke Color"
            oninput="PropertiesPanel.changeStrokeColor(this.value)"
         />
         <input
            type="checkbox"
            id="stroke"
            checked
            title="Stroke"
            onchange="PropertiesPanel.changeStroke(this.checked)"
         />
         <br />
         <input
            type="range"
            id="strokeWidth"
            value="5"
            min="1"
            max="100"
            title="Stroke Width"
            oninput="PropertiesPanel.changeStrokeWidth(this.value)"
         />
         <br />`;
   }

   static changeX(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.center.x = Number(value) + stageProperties.left));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeY(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.center.y = Number(value) + stageProperties.top));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeWidth(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => s.setWidth(Number(value)));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeHeight(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => s.setHeight(Number(value)));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeFillColor(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.options.fillColor = value));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeFill(value) {
      shapes.filter((s) => s.selected).forEach((s) => (s.options.fill = value));
     
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeStrokeColor(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.options.strokeColor = value));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeStroke(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.options.stroke = value));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static changeStrokeWidth(value) {
      shapes
         .filter((s) => s.selected)
         .forEach((s) => (s.options.strokeWidth = Number(value)));
      
      updateHistory(shapes);
      drawShapes(shapes);
   }

   static reset() {
      x.value = "";
      y.value = "";
      width.value = "";
      height.value = "";
   }

   static updateDisplay(selectedShapes) {
      if (selectedShapes.length === 0) {
         return;
      }

      const shape = selectedShapes[0];
      x.value = Math.round(shape.center.x - stageProperties.left);
      y.value = Math.round(shape.center.y - stageProperties.top);
      width.value = Math.round(shape.size.width);
      height.value = Math.round(shape.size.height);
      fillColor.value = shape.options.fillColor;
      fill.checked = shape.options.fill;
      strokeColor.value = shape.options.strokeColor;
      stroke.checked = shape.options.stroke;
      strokeWidth.value = shape.options.strokeWidth;
   }
}
