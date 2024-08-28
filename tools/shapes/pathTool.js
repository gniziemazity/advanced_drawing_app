class PathTool extends ShapeTool {
	constructor() {
		super();
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;
		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		currentShape = new Path(startPosition, PropertiesPanel.getValues());

		const moveCallback = function (e) {
			const mousePosition = viewport.getAdjustedPosition(
				Vector.fromOffsets(e)
			);
			currentShape.addPoint(mousePosition);

			viewport.drawShapes([...viewport.shapes, currentShape]);
		};

		const upCallback = function (e) {
			viewport.getStageCanvas().removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);

			currentShape.recenter();
			if (currentShape.size.width > 0 && currentShape.size.height > 0) {
				viewport.addShapes(currentShape);
			}
		};
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
	}
}
