class TextTool extends ShapeTool {
	constructor() {
		super();
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const mousePosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		const text = new Text(mousePosition, PropertiesPanel.getValues());
		viewport.addShapes(text);
	}
}
