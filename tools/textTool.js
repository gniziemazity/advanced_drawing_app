class TextTool {
	static addPointerDownListener(e) {
		if (e.button !== 0) return;

		const mousePosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		currentShape = new Text(mousePosition, PropertiesPanel.getValues());

		shapes.push(currentShape);
		viewport.drawShapes(shapes);

		HistoryTools.record(shapes);
	}

  static configureEventListeners() {
		myCanvas.addEventListener("pointerdown", this.addPointerDownListener);
	}

	static removeEventListeners() {
		myCanvas.removeEventListener("pointerdown", this.addPointerDownListener);
	}
}
