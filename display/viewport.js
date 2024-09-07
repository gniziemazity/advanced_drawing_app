class Viewport extends EventTarget {
	constructor(container, stageProperties, showHitRegions) {
		super();

		this.container = container;

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

		this.layerContainer = document.createElement("div");
		container.appendChild(this.layerContainer);
		this.selectedLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			stageProperties,
			Layer.TYPES.NORMAL
		);
		this.layerContainer.appendChild(this.selectedLayer.canvas);
		this.layers = [this.selectedLayer];

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

		this.gizmos = [];

		this.#addEventListeners();
	}

	addShapes(shapes, save = true) {
		this.selectedLayer.addShapes(shapes, save);
	}

	setShapes(newShapes, save = true) {
		this.selectedLayer.setShapes(newShapes, save);
	}

	deleteShapes(shapes) {
		this.selectedLayer.deleteShapes(shapes);
	}

	getShapes() {
		return this.selectedLayer.shapes;
	}

	getSelectedShapes() {
		return this.selectedLayer.getSelectedShapes();
	}

	getUnselectedShapes() {
		return this.selectedLayer.getUnselectedShapes();
	}

	selectShapes(shapes) {
		this.selectedLayer.selectShapes(shapes);
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

	drawShapes(shapes = []) {
		this.stageLayer.drawItems([]);
		this.layers.forEach((l) => l.drawItems(l.shapes.concat(shapes)));
		this.overlayLayer.drawItems(this.gizmos);

		this.hitTestLayer.drawItems(this.selectedLayer.shapes.concat(shapes));
		this.hitTestLayer.drawItems(this.gizmos, false);
	}

	addLayer(type = Layer.TYPES.NORMAL) {
		const newLayer = new Layer(
			this.canvasWidth,
			this.canvasHeight,
			this.stageProperties,
			type
		);
		this.layers.push(newLayer);
		this.layerContainer.appendChild(newLayer.canvas);
		this.dispatchEvent(
			new CustomEvent("layersChanged", {
				detail: { layer: newLayer, count: this.layers.length },
			})
		);
	}

	setLayers(layers, save = true) {
		this.layers = layers.map((l) =>
			Layer.load(l, this.canvasWidth, this.canvasHeight)
		);
		this.layerContainer.innerHTML = "";
		this.layers.forEach((l) => {
			this.layerContainer.appendChild(l.canvas);
			viewport.selectedLayer = l;
			viewport.drawShapes();
		});

		this.dispatchEvent(
			new CustomEvent("layersChanged", {
				detail: { layers: layers, count: this.layers.length, save },
			})
		);
	}

	selectLayerByIndex(index) {
		this.selectedLayer = this.layers[index];
		this.dispatchEvent(
			new CustomEvent("layersChanged", {
				detail: { layer: this.selectedLayer, count: this.layers.length },
			})
		);
	}

	removeLayerByIndex(index) {
		let changeSelectedLayer = false;
		if (this.layers[index] == this.selectedLayer) {
			changeSelectedLayer = true;
		}
		const removedLayer = this.layers[index];
		this.layerContainer.removeChild(removedLayer.canvas);
		this.layers.splice(index, 1);
		if (changeSelectedLayer) {
			this.selectedLayer = this.layers[0];
		}
		this.dispatchEvent(
			new CustomEvent("layersChanged", {
				detail: { layer: removedLayer, count: this.layers.length },
			})
		);
	}

	#handleChanges({ detail }) {
		this.drawShapes();
		if (detail.save) {
			HistoryTools.record(this.layers);
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
		this.addEventListener("shapesReordered", this.#handleChanges.bind(this));
		this.addEventListener("layersChanged", (event) => {
			this.gizmos = [];
         this.layers.forEach((l) => {
            l.shapes.forEach((s) => {
               s.unselect(false);
            });
         });
		 	Cursor.stopEditMode()
			this.#handleChanges(event);
		});

		this.addEventListener("shapeSelected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleChanges(event);
		});

		this.addEventListener("TextSelected", (event) => {
			let selectedShapes = this.getSelectedShapes()

			if (selectedShapes.length > 1) {
				Cursor.stopEditMode()
				return
			}

			const { shape, clickedPoint } = event.detail
			let adjustedPoint = this.getAdjustedPosition(clickedPoint)

			let shapeHeight = shape.size.height
			let top = shape.center.y - (shapeHeight / 2)

			let lines = shape.parseText()
		
			let ratioOnYaxis = Math.abs((adjustedPoint.y - top) / shapeHeight)
			let lineIndex = Math.floor(ratioOnYaxis * lines.length)
		
			let line = lines[lineIndex]

			let index = shape.getIndexOfTextAtPoint(adjustedPoint, line)

			Cursor.enterEditMode(shape, index, lineIndex)

		});

		this.addEventListener("textChanged", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			this.#handleChanges(event);
		});
		this.addEventListener("shapeUnselected", (event) => {
			this.gizmos = this.getSelectedShapes().map((s) => new Gizmo(s));
			Cursor.stopEditMode()
			this.#handleChanges(event);
		});
		this.addEventListener("gizmoChanged", () => this.drawShapes());
	}
}
