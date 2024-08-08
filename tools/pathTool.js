class PathTool {
	static addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		currentShape = new Path(startPosition, getOptions());

		const moveCallback = function (e) {
			const mousePosition = viewport.getAdjustedPosition(
				Vector.fromOffsets(e)
			);
			currentShape.addPoint(mousePosition);

			drawShapes([...shapes, currentShape]);
		};

		const upCallback = function (e) {
			myCanvas.removeEventListener("pointermove", moveCallback);
			myCanvas.removeEventListener("pointerup", upCallback);

			currentShape.recenter();
			shapes.push(currentShape);

			HistoryTools.record(shapes);
		};
		myCanvas.addEventListener("pointermove", moveCallback);
		myCanvas.addEventListener("pointerup", upCallback);
	}
}
