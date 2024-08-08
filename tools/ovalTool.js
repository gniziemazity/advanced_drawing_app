class OvalTool {
	static addPointerDownListener(e) {
		if (e.button !== 0) return;
		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		currentShape = new Oval(startPosition, PropertiesPanel.getValues());

		const moveCallback = (e) => {
			secondCornerMoveCallback(e, startPosition, currentShape);
		};
		const upCallback = (e) => {
			secondCornerUpCallback(e, currentShape, moveCallback, upCallback);
		};
		viewport.canvas.addEventListener("pointermove", moveCallback);
		viewport.canvas.addEventListener("pointerup", upCallback);
	}
}
