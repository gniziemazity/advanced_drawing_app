class CornerGeneratedShapeTool extends ShapeTool {
	constructor() {
		super();
	}

	#getCenterAndSize(corner1, corner2) {
		const points = [corner1, corner2];
		const center = Vector.mid(points);
		const size = BoundingBox.fromPoints(points);
		return { center, size };
	}

	moveCallback(event, firstCorner) {
		const mousePosition = viewport.getAdjustedPosition(
			Vector.fromOffsets(event)
		);
		let secondCorner = mousePosition;
		if (event.shiftKey) {
			const deltaX = firstCorner.x - mousePosition.x;
			const deltaY = firstCorner.y - mousePosition.y;
			const minDelta = Math.min(Math.abs(deltaX), Math.abs(deltaY));
			secondCorner = new Vector(
				firstCorner.x - Math.sign(deltaX) * minDelta,
				firstCorner.y - Math.sign(deltaY) * minDelta
			);
		}

		return this.#getCenterAndSize(firstCorner, secondCorner);
	}

	upCallback(shape, moveCallback, upCallback) {
		viewport
			.getStageCanvas()
			.removeEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().removeEventListener("pointerup", upCallback);

		if (shape?.size.width > 0 && shape?.size.height > 0) {
			viewport.addShapes(shape);
		}
	}
}
