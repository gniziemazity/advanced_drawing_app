class Viewport extends EventTarget {
	constructor(container, stageProperties, showHitRegions) {
		super();

		this.stageProperties = stageProperties;
		this.stageProperties.left = -this.stageProperties.width / 2;
		this.stageProperties.top = -this.stageProperties.height / 2;

		this.canvasWidth = showHitRegions
			? window.innerWidth / 2
			: window.innerWidth;
		this.canvasHeight = window.innerHeight;

		this.zeroCenterOffset = new Vector(
			this.canvasWidth / 2,
			this.canvasHeight / 2
		);

		this.offset = Vector.zero();
		this.center = Vector.zero();
		this.zoom = 1;
		this.zoomStep = 0.05;

		this.stageLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.STAGE
		);
		container.appendChild(this.stageLayer.canvas);

		this.mainLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.NORMAL
		);
		container.appendChild(this.mainLayer.canvas);

		this.overlayLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.OVERLAY
		);
		container.appendChild(this.overlayLayer.canvas);

		this.hitTestLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.HIT_TEST
		);
		if (showHitRegions) {
			container.appendChild(this.hitTestLayer.canvas);
		}

		this.shapes = [];
		this.gizmos = [];

		this.#addEventListeners();
	}

	addShapes(shapes, save = true) {
		if (!Array.isArray(shapes)) {
			shapes = [shapes];
		}
		this.shapes = this.shapes.concat(shapes);
		viewport.dispatchEvent(
			new CustomEvent("shapesAdded", { detail: { shapes, save } })
		);
	}

	setShapes(newShapes, save = true) {
		viewport.gizmos = newShapes
			.filter((s) => s.selected)
			.map((s) => new Gizmo(s));
		this.shapes = [];
		this.addShapes(newShapes, save);
	}

	deleteShapes(shapes) {
		if (shapes.length > 0) {
			let index = viewport.shapes.findIndex((s) => s.selected);
			while (index != -1) {
				viewport.shapes.splice(index, 1);
				index = viewport.shapes.findIndex((s) => s.selected);
			}
			for (let i = viewport.gizmos.length - 1; i >= 0; i--) {
				if (shapes.includes(viewport.gizmos[i].shape)) {
					viewport.gizmos.splice(i, 1);
				}
			}
			viewport.dispatchEvent(
				new CustomEvent("shapesRemoved", { detail: { shapes, save: true } })
			);
		}
	}

	#swapShapes(index1, index2) {
		const temp = this.shapes[index1];
		this.shapes[index1] = this.shapes[index2];
		this.shapes[index2] = temp;
	}
   
	getSelectedShapes() {
		return this.shapes.filter((s) => s.selected);
	}

	getUnselectedShapes() {
		return this.shapes.filter((s) => !s.selected);
	}

	#getSelectedShapeIndices() {
		const indices = [];
		this.shapes.forEach((s, i) => {
			if (s.selected) {
				indices.push(i);
			}
		});
		return indices;
	}

	sendToBack() {
		const selShapes = this.getSelectedShapes();
		const unSelShapes = this.getUnselectedShapes();
		this.shapes = selShapes.concat(unSelShapes);

		viewport.dispatchEvent(
			new CustomEvent("shapesReordered", { detail: { save: true } })
		);
	}

	sendBackward() {
		const indices = this.#getSelectedShapeIndices();

		for (const index of indices) {
			const newIndex = index - 1;
			if (newIndex >= 0 && !this.shapes[newIndex].selected) {
				this.#swapShapes(index, newIndex);
			}
		}

		viewport.dispatchEvent(
			new CustomEvent("shapesReordered", { detail: { save: true } })
		);
	}

	bringToFront() {
		const selShapes = this.getSelectedShapes();
		const unSelShapes = this.getUnselectedShapes();
		this.shapes = unSelShapes.concat(selShapes);

		viewport.dispatchEvent(
			new CustomEvent("shapesReordered", { detail: { save: true } })
		);
	}

	bringForward() {
		const indices = this.#getSelectedShapeIndices();

		for (const index of indices) {
			const newIndex = index + 1;
			if (newIndex <this.shapes.length && !this.shapes[newIndex].selected) {
				this.#swapShapes(index, newIndex);
			}
		}

		viewport.dispatchEvent(
			new CustomEvent("shapesReordered", { detail: { save: true } })
		);
	}

	selectShapes(shapes) {
		this.shapes.forEach((s) => s.unselect(false));
		shapes.forEach((s) => s.select(false));
	}

	getStageCanvas() {
		return this.stageLayer.canvas;
	}

	getAdjustedScale(vector) {
		return vector.scale(1 / this.zoom);
	}

	getAdjustedPosition(vector) {
		return vector
			.subtract(this.zeroCenterOffset)
			.scale(1 / this.zoom)
			.subtract(this.offset);
	}

	drawShapes(shapes = this.shapes) {
		this.stageLayer.drawItems([]);
		this.mainLayer.drawItems(shapes);
		this.overlayLayer.drawItems(this.gizmos);

		this.hitTestLayer.drawItems(shapes);
		this.hitTestLayer.drawItems(this.gizmos, false);
	}

	#handleChanges({ detail }) {
		this.drawShapes();
		if (detail.save) {
			HistoryTools.record(this.shapes);
		}
	}

	#handleZoom(event) {
		event.preventDefault();
		const dir = -Math.sign(event.deltaY);
		this.zoom += dir * this.zoomStep;
		this.zoom = Math.max(this.zoomStep, this.zoom);
		viewport.drawShapes();
	}

	#handleDrag({ offsetX, offsetY }) {
		let dragStart = new Vector(offsetX, offsetY);
		const moveCallback = (e) => {
			const dragEnd = new Vector(e.offsetX, e.offsetY);
			const diff = Vector.subtract(dragEnd, dragStart);
			const scaledDiff = diff.scale(1 / this.zoom);
			this.offset = Vector.add(this.offset, scaledDiff);
			dragStart = dragEnd;
			viewport.drawShapes();
		};
		const stage = this.getStageCanvas();
		const upCallback = (e) => {
			stage.removeEventListener("pointermove", moveCallback);
			stage.removeEventListener("pointerup", upCallback);
		};
		stage.addEventListener("pointermove", moveCallback);
		stage.addEventListener("pointerup", upCallback);
	}

	#addEventListeners() {
		const stage = this.getStageCanvas();
		stage.addEventListener("wheel", this.#handleZoom.bind(this));

		stage.addEventListener("pointerdown", (e) => {
			e.button == 1 && this.#handleDrag(e);
		});

		this.addEventListener("positionChanged", this.#handleChanges.bind(this));
		this.addEventListener("sizeChanged", this.#handleChanges.bind(this));
		this.addEventListener("rotationChanged", this.#handleChanges.bind(this));
		this.addEventListener("optionsChanged", this.#handleChanges.bind(this));
		this.addEventListener("shapesAdded", this.#handleChanges.bind(this));
		this.addEventListener("shapesRemoved", this.#handleChanges.bind(this));
		this.addEventListener("textChanged", this.#handleChanges.bind(this));
		this.addEventListener("shapesReordered", this.#handleChanges.bind(this));

		this.addEventListener("shapeSelected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleChanges(event);
		});
		this.addEventListener("shapeUnselected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleChanges(event);
		});
		this.addEventListener("gizmoChanged", () => this.drawShapes());
	}
}
