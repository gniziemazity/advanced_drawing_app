class RectTool extends CornerGeneratedShapeTool {
	constructor() {
		super();
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		let rect = null;

		const moveCallback = (e) => {
			const { center, size } = this.moveCallback(e, startPosition);

			const prevId = rect ? rect.id : null;
			rect = new Rect(center, size, PropertiesPanel.getValues());
			if (prevId) {
				rect.id = prevId;
			}

			viewport.drawShapes([rect]);
		};
		const upCallback = () => {
			this.upCallback(rect, moveCallback, upCallback);
		};
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
	}
}