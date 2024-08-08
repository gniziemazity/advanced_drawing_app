class ShapeTools {
	static tools = {
		Path: { class: PathTool, shape: Path, showButton: true },
		Rect: { class: RectTool, shape: Rect, showButton: true },
		Oval: { class: OvalTool, shape: Oval, showButton: true },
		Text: { class: TextTool, shape: Text, showButton: true },
		Select: { class: SelectTool, showButton: true },
		MyImage: { class: MyImageTool, shape: MyImage, showButton: false },
	};

	static selectTool(tool) {
		for (const key in ShapeTools.tools) {
			const tool = ShapeTools.tools[key];
			viewport.canvas.removeEventListener(
				"pointerdown",
				tool.class.addPointerDownListener
			);
		}

		shapes.forEach((s) => (s.selected = false));
		viewport.drawShapes(shapes);

		viewport.canvas.addEventListener(
			"pointerdown",
			ShapeTools.tools[tool].class.addPointerDownListener
		);

		const radioBtn = document.getElementById(tool.toLowerCase() + "Radio");
		radioBtn.checked = true;
	}
}
