class ShapeTool extends GenericTool {
	constructor() {
		super();
		this.boundEventListener = null;
	}

	addPointerDownListener(e) {
		throw new Error("addPointerDownListener method must be implemented");
	}

	configureEventListeners() {
		this.boundEventListener = this.addPointerDownListener.bind(this);
		viewport
			.getStageCanvas()
			.addEventListener("pointerdown", this.boundEventListener);
	}

	removeEventListeners() {
		viewport
			.getStageCanvas()
			.removeEventListener("pointerdown", this.boundEventListener);
	}
}
