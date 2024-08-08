class ShapeTools {
	static tools = {
		Rect: { class: RectTool, radioId: "rectRadio" },
		Path: { class: PathTool, radioId: "pathRadio" },
		Oval: { class: OvalTool, radioId: "ovalRadio" },
		Text: { class: TextTool, radioId: "textRadio" },
		Select: { class: SelectTool, radioId: "selectRadio" },
	};

	static selectTool(tool) {
		for (const key in ShapeTools.tools) {
         const tool = ShapeTools.tools[key];
         myCanvas.removeEventListener(
            "pointerdown",
            tool.class.addPointerDownListener
         );
      }
   
      shapes.forEach((s) => (s.selected = false));
      drawShapes(shapes);
   
      myCanvas.addEventListener(
         "pointerdown",
         ShapeTools.tools[tool].class.addPointerDownListener
      );
      
		const radioBtn = document.getElementById(ShapeTools.tools[tool].radioId);
		radioBtn.checked = true;
	}
}
