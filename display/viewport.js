class Viewport extends EventTarget {
	constructor(canvasHolderDiv, stageProperties, showHitRegions) {
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
		canvasHolderDiv.appendChild(this.stageLayer.canvas);

		this.mainLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.NORMAL
		);
		canvasHolderDiv.appendChild(this.mainLayer.canvas);

		this.overlayLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.OVERLAY
		);
		canvasHolderDiv.appendChild(this.overlayLayer.canvas);

		this.hitTestLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.HIT_TEST
		);
		canvasHolderDiv.appendChild(this.hitTestLayer.canvas);

		this.showHitRegions = showHitRegions;
		if (!showHitRegions) {
			this.hitTestLayer.canvas.style.display = "none";
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

	getStageCanvas() {
		return this.stageLayer.canvas;
	}

	getSelectedShapes() {
		return this.shapes.filter((s) => s.selected);
	}

	scale(vector) {
		return vector.scale(1 / this.zoom);
	}

	getAdjustedPosition(vector) {
		return vector
			.subtract(this.zeroCenterOffset)
			.scale(1 / this.zoom)
			.subtract(this.offset);
	}

	drawShapes(shapes = this.shapes) {
		this.stageLayer.drawShapes([]);
		this.mainLayer.drawShapes(shapes);
		this.overlayLayer.drawGizmos(this.gizmos, true);

		this.hitTestLayer.drawShapes(shapes);
		this.hitTestLayer.drawGizmos(this.gizmos);
	}

	#handleShapeChanges({ detail }) {
		this.drawShapes();
		if (detail.save) {
			HistoryTools.record(this.shapes);
		}
	}

	#addEventListeners() {
		this.getStageCanvas().addEventListener("wheel", (e) => {
			e.preventDefault();
			const dir = -Math.sign(e.deltaY);
			this.zoom += dir * this.zoomStep;
			this.zoom = Math.max(this.zoomStep, this.zoom);
			viewport.drawShapes();
		});

		this.getStageCanvas().addEventListener("pointerdown", (e) => {
			if (e.button === 1) {
				let dragStart = new Vector(e.offsetX, e.offsetY);
				const moveCallback = (e) => {
					const dragEnd = new Vector(e.offsetX, e.offsetY);
					const diff = Vector.subtract(dragEnd, dragStart);
					const scaledDiff = diff.scale(1 / this.zoom);
					this.offset = Vector.add(this.offset, scaledDiff);
					dragStart = dragEnd;
					viewport.drawShapes();
				};
				const upCallback = (e) => {
					this.getStageCanvas().removeEventListener(
						"pointermove",
						moveCallback
					);
					this.getStageCanvas().removeEventListener(
						"pointerup",
						upCallback
					);
				};
				this.getStageCanvas().addEventListener("pointermove", moveCallback);
				this.getStageCanvas().addEventListener("pointerup", upCallback);
			}
		});

		this.addEventListener(
			"positionChanged",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"sizeChanged",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"rotationChanged",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"optionsChanged",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"shapesAdded",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"shapesRemoved",
			this.#handleShapeChanges.bind(this)
		);
		this.addEventListener(
			"textChanged",
			this.#handleShapeChanges.bind(this)
		);

		this.addEventListener("shapeSelected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleShapeChanges(event);
		});
		this.addEventListener("shapeUnselected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleShapeChanges(event);
		});
		this.addEventListener("gizmoChanged", () => this.drawShapes());
	}
}
