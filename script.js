const SHOW_HIT_REGIONS = false;

const RECTANGULAR_SELECTION_MODE = "intersection"; // "intersection" or "containment"
if (!SHOW_HIT_REGIONS) {
   hitTestCanvas.style.display = "none";
}

const stageProperties = {
   width: 600,
   height: 480,
};

const canvasProperties = {
   width: SHOW_HIT_REGIONS ? window.innerWidth / 2 : window.innerWidth,
   height: window.innerHeight,
   center: {
      x: SHOW_HIT_REGIONS ? window.innerWidth / 4 : window.innerWidth / 2,
      y: window.innerHeight / 2,
   },
};

(stageProperties.left = canvasProperties.center.x - stageProperties.width / 2),
   (stageProperties.top =
      canvasProperties.center.y - stageProperties.height / 2);

myCanvas.width = canvasProperties.width;
myCanvas.height = canvasProperties.height;
hitTestCanvas.width = canvasProperties.width;
hitTestCanvas.height = canvasProperties.height;

const ctx = myCanvas.getContext("2d");
const hitTestingCtx = hitTestCanvas.getContext("2d");

clearCanvas();

const redoStack = [];
const history = [];
let shapes = [];
let currentShape = null;
let clipboard = null;

myCanvas.addEventListener("pointerdown", Path.addPointerDownListener);

document.addEventListener("keydown", (e) => {
   if (e.target instanceof HTMLInputElement) {
      return;
   }

   if (isShortcut(e.ctrlKey, e.key)) {
      executeShortcut(e.ctrlKey, e.key);
      e.preventDefault();
   }
});

const propertiesPanel = new PropertiesPanel(propertiesHolder);

function changeTool(tool) {
   myCanvas.removeEventListener("pointerdown", Rect.addPointerDownListener);
   myCanvas.removeEventListener("pointerdown", Path.addPointerDownListener);
   myCanvas.removeEventListener("pointerdown", downCallbackForSelect);

   shapes.forEach((s) => (s.selected = false));
   drawShapes(shapes);

   switch (tool) {
      case "rect":
         myCanvas.addEventListener("pointerdown", Rect.addPointerDownListener);
         break;
      case "path":
         myCanvas.addEventListener("pointerdown", Path.addPointerDownListener);
         break;
      case "select":
         myCanvas.addEventListener("pointerdown", downCallbackForSelect);
         break;
   }
}

function selectTool(tool) {
   changeTool(tool);
   const toolSelector = document.getElementById("toolSelector");
   if (toolSelector) {
      toolSelector.value = tool;
   }
}

function selectRectTool() {
   selectTool("rect");
}

function selectPathTool() {
   selectTool("path");
}

function selectSelectTool() {
   selectTool("select");
}

function getOptions() {
   return {
      fillColor: fillColor.value,
      strokeColor: strokeColor.value,
      fill: fill.checked,
      stroke: stroke.checked,
      strokeWidth: Number(strokeWidth.value),
      lineCap: "round",
      lineJoin: "round",
   };
}

function clearCanvas() {
   ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
   ctx.fillStyle = "gray";
   ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

   ctx.fillStyle = "white";
   ctx.fillRect(
      stageProperties.left,
      stageProperties.top,
      stageProperties.width,
      stageProperties.height
   );

   ctx.textAlign = "right";
   ctx.fillText(
      "Contributors: " + contributors.join(", "),
      myCanvas.width - 10,
      10
   );

   // For Debugging
   hitTestingCtx.fillStyle = "red";
   hitTestingCtx.fillRect(
      0,
      0,
      canvasProperties.width,
      canvasProperties.height
   );
}

function updateHistory(shapes) {
   history.push(shapes.map((s) => s.serialize(stageProperties)));
   redoStack.length = 0;
}

function copy() {
   const selectedShapes = shapes.filter((s) => s.selected);
   if (selectedShapes.length > 0) {
      const data = selectedShapes.map((s) => s.serialize(stageProperties));
      clipboard = JSON.stringify(data);
   }
}

function paste() {
   if (clipboard) {
      shapes.forEach((s) => (s.selected = false));
      const newShapes = loadShapes(JSON.parse(clipboard));
      newShapes.forEach((s) => s.generateId());
      shapes.push(...newShapes);

      drawShapes(shapes);
      updateHistory(shapes);
   }
}

function redo() {
   if (redoStack.length > 0) {
      const data = redoStack.pop();
      shapes = loadShapes(data);
      drawShapes(shapes);
      history.push(data);
      PropertiesPanel.updateDisplay(shapes.filter((s) => s.selected));
   }
}

function undo() {
   redoStack.push(history.pop());
   if (history.length > 0) {
      shapes = loadShapes(history[history.length - 1]);
   } else {
      shapes.length = 0;
   }
   drawShapes(shapes);
   PropertiesPanel.updateDisplay(shapes.filter((s) => s.selected));
}

function save() {
   const data = JSON.stringify(shapes.map((s) => s.serialize(stageProperties)));

   const a = document.createElement("a");
   const file = new Blob([data], { type: "application/json" });
   a.href = URL.createObjectURL(file);
   a.download = "drawing.json";
   a.click();
}

function load() {
   const input = document.createElement("input");
   input.type = "file";
   input.accept = ".json";
   input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
         const data = JSON.parse(e.target.result);
         shapes = loadShapes(data);
         drawShapes(shapes);
         updateHistory(shapes);
      };
      reader.readAsText(file);
   };
   input.click();
}

function do_import() {
   const input = document.createElement("input");
   input.type = "file";
   input.accept = ".png";
   input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
            const myImage = new MyImage(img, getOptions());
            myImage.setCenter(
               new Vector(
                  stageProperties.left + stageProperties.width / 2,
                  stageProperties.top + stageProperties.height / 2
               )
            );
            shapes.push(myImage);
            drawShapes(shapes);
            updateHistory(shapes);
         };
         img.src = e.target.result;
      };
      reader.readAsDataURL(file);
   };
   input.click();
}

function do_export() {
   const tmpCanvas = document.createElement("canvas");
   tmpCanvas.width = stageProperties.width;
   tmpCanvas.height = stageProperties.height;
   const tmpCtx = tmpCanvas.getContext("2d");
   tmpCtx.translate(-stageProperties.left, -stageProperties.top);
   for (const shape of shapes) {
      const isSelected = shape.selected;
      shape.selected = false;
      shape.draw(tmpCtx);
      shape.selected = isSelected;
   }
   tmpCanvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "screenshot.png";
      a.click();
   });
}
