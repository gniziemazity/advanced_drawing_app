class PathTool extends ShapeTool {
	constructor() {
		super();
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		const path = new Path(startPosition, PropertiesPanel.getValues());

		const moveCallback = function (e) {
			const mousePosition = viewport.getAdjustedPosition(
				Vector.fromOffsets(e)
			);
			path.addPoint(mousePosition);

			viewport.drawShapes([path]);
		};

		const upCallback = function (e) {
			viewport.getStageCanvas().removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);

			path.recenter();
			if (path.size.width > 0 && path.size.height > 0) {
				viewport.addShapes(path);
			}
		};
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
	}
}