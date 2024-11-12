class TextTool extends ShapeTool {
	constructor() {
		super();
	}

	getShortcut() {
		return new Shortcut({
			control: false,
			key: "t",
			action: () => CanvasTools.selectTool("Text"),
		});
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const mousePosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		const text = new Text(mousePosition, propertiesPanel.getValues());
		viewport.addShapes(text);
	}
}
