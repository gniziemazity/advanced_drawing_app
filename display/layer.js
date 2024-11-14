class Layer {
	static nextId = 0;

	static TYPES = {
		STAGE: "stage",
		NORMAL: "normal",
		OVERLAY: "overlay",
		HIT_TEST: "hit-test",
	};

	constructor(canvasWidth, canvasHeight, stageProperties, type) {
		this.id = Layer.nextId++;

		this.canvas = document.createElement("canvas");
		const pixelRatio = window.devicePixelRatio;
		this.canvas.style.width = canvasWidth + "px";
		this.canvas.style.height = canvasHeight + "px";
		this.canvas.width = Math.floor(canvasWidth * pixelRatio);
		this.canvas.height = Math.floor(canvasHeight * pixelRatio);
		this.canvas.unscaledWidth = canvasWidth;
		this.canvas.unscaledHeight = canvasHeight;
		this.ctx = this.canvas.getContext("2d", {
			willReadFrequently: true,
		});
		this.ctx.scale(pixelRatio, pixelRatio);

		this.stageProperties = stageProperties;

		this.type = type;

		if (type != Layer.TYPES.STAGE) {
			this.canvas.style.position = "absolute";
			this.canvas.style.top = "0";
			this.canvas.style.pointerEvents = "none";
		}

		switch (type) {
			case Layer.TYPES.HIT_TEST:
				this.canvas.style.right = "0";
				break;

			case Layer.TYPES.NORMAL:
			case Layer.TYPES.OVERLAY:
				this.canvas.style.left = "0";
				break;

			//TO-DO: Fix the layout somehow
			case Layer.TYPES.STAGE:
				this.canvas.style.position = "relative";
				this.canvas.style.marginTop = "-20px";
				break;
		}

		// adjustment to get (0,0) in the center screen
		this.zeroCenterOffset = new Vector(canvasWidth / 2, canvasHeight / 2);
		this.ctx.translate(this.zeroCenterOffset.x, this.zeroCenterOffset.y);

		this.offset = Vector.zero();
		this.center = Vector.zero();
		this.zoom = 1;
		this.zoomStep = 0.05;

		this.shapes = [];

		this.clearCanvas();
		this.type == Layer.TYPES.STAGE && this.#drawStage();
	}

	static load(data, canvasWidth, canvasHeight) {
		// TO-DO: Fix stageProperties (should be in viewport)
		const layer = new Layer(
			canvasWidth,
			canvasHeight,
			data.stageProperties,
			data.type
		);
		layer.shapes = ShapeFactory.loadShapes(
			data.shapes,
			viewport.stageProperties
		);
		return layer;
	}

	serialize() {
		return {
			id: this.id,
			type: this.type,
			stageProperties: this.stageProperties,
			shapes: this.shapes.map((s) => s.serialize()),
		};
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
			let index = this.shapes.findIndex((s) => s.selected);
			while (index != -1) {
				this.shapes.splice(index, 1);
				index = this.shapes.findIndex((s) => s.selected);
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
		const indices = this.#getSelectedShapeIndices().reverse();

		for (const index of indices) {
			const newIndex = index + 1;
			if (newIndex < this.shapes.length && !this.shapes[newIndex].selected) {
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

	clearCanvas() {
		this.ctx.clearRect(
			-this.canvas.unscaledWidth / 2,
			-this.canvas.unscaledHeight / 2,
			this.canvas.unscaledWidth,
			this.canvas.unscaledHeight
		);
	}

	#drawStage() {
		this.ctx.save();

		this.ctx.fillStyle = "white";
		const { left, top, width, height } = this.stageProperties;
		this.ctx.fillRect(left, top, width, height);

		this.ctx.restore();
	}

	drawItems(items, doClearCanvas = true) {
		this.ctx.save();

		doClearCanvas && this.clearCanvas();
		this.ctx.scale(viewport.zoom, viewport.zoom);
		this.ctx.translate(viewport.offset.x, viewport.offset.y);
		this.type == Layer.TYPES.STAGE && this.#drawStage();

		for (const item of items) {
			rotateCanvas(this.ctx, item.center, item.rotation);
			item.draw(this.ctx, this.type == Layer.TYPES.HIT_TEST);
			rotateCanvas(this.ctx, item.center, -item.rotation);
		}

		this.ctx.restore();
	}
}
