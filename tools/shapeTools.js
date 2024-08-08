class ShapeTools {
	static tools = {
		Path: { class: PathTool, shape: Path, showButton: true, icon: "<i class='bx bxs-pen bx-sm' style='color:#ffffff'></i>", selected: true },
		Rect: { class: RectTool, shape: Rect, showButton: true, icon: "<i class='bx bx-rectangle bx-sm' style='color:#ffffff'></i>" },
		Oval: { class: OvalTool, shape: Oval, showButton: true, icon: "<i class='bx bx-circle bx-sm' style='color:#ffffff'></i>" },
		Text: { class: TextTool, shape: Text, showButton: true, icon: "<i class='bx bx-text bx-sm' style='color:#ffffff'></i>" },
		Select: { class: SelectTool, showButton: true, icon: "<i class='bx bx-selection bx-sm' style='color:#ffffff'></i>" },
		MyImage: { class: MyImageTool, shape: MyImage, showButton: false },
	};

	static selectTool(tool) {
		for (const key in ShapeTools.tools) {
			const tool = ShapeTools.tools[key]
			viewport.canvas.removeEventListener(
				"pointerdown",
				tool.class.addPointerDownListener
			)
		}

		shapes.forEach((s) => (s.selected = false))
		viewport.drawShapes(shapes)

		viewport.canvas.addEventListener(
			"pointerdown",
			ShapeTools.tools[tool].class.addPointerDownListener
		)
	}
}
