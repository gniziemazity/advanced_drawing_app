class OvalTool extends CornerGeneratedShapeTool {
	constructor() {
		super();
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
		let oval = null;

		const moveCallback = (e) => {
			const { center, size } = this.moveCallback(e, startPosition);

			const prevId = oval ? oval.id : null;
			oval = new Oval(center, size, PropertiesPanel.getValues());
			if (prevId) {
				oval.id = prevId;
			}

			viewport.drawShapes([oval]);
		};
		const upCallback = () => {
			this.upCallback(oval, moveCallback, upCallback);
		};
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
	}
}