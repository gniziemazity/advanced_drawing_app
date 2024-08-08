class RectTool {
	static addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		currentShape = new Rect(startPosition, getOptions());

		const moveCallback = (e) => {
			secondCornerMoveCallback(e, startPosition, currentShape);
		};
		const upCallback = (e) => {
			secondCornerUpCallback(e, currentShape, moveCallback, upCallback);
		};
		myCanvas.addEventListener("pointermove", moveCallback);
		myCanvas.addEventListener("pointerup", upCallback);
	}

	static configureEventListeners() {
		myCanvas.addEventListener("pointerdown", this.addPointerDownListener);
	}

	static removeEventListeners() {
		myCanvas.removeEventListener("pointerdown", this.addPointerDownListener);
	}
}
