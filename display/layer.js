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
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
		this.ctx = this.canvas.getContext("2d", {
			willReadFrequently: true,
		});

		this.stageProperties = stageProperties;

		this.type = type;

		if (type != Layer.TYPES.STAGE) {
			this.canvas.style.position = "absolute";
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

			case Layer.TYPES.STAGE:
				this.canvas.style.backgroundColor = "var(--bg-canvas)";
				break;
		}

		this.zeroCenterOffset = new Vector(canvasWidth / 2, canvasHeight / 2);
		this.offset = Vector.zero();
		this.center = Vector.zero();
		this.zoom = 1;
		this.zoomStep = 0.05;

		this.ctx.translate(this.zeroCenterOffset.x, this.zeroCenterOffset.y);

		this.clearCanvas();
		type == Layer.TYPES.STAGE && this.#drawStage();
	}

	clearCanvas() {
		this.ctx.clearRect(
			-this.canvas.width / 2,
			-this.canvas.height / 2,
			this.canvas.width,
			this.canvas.height
		);
	}

	#drawStage() {
		this.ctx.save();

		this.ctx.fillStyle = "white";
		const { left, top, width, height } = this.stageProperties;
		this.ctx.fillRect(left, top, width, height);

		this.ctx.restore();
	}

	drawGizmos(gizmos, clearCanvas = false) {
		this.ctx.save();

		clearCanvas && this.clearCanvas();
		this.ctx.scale(viewport.zoom, viewport.zoom);
		this.ctx.translate(viewport.offset.x, viewport.offset.y);

		for (const gizmo of gizmos) {
			this.rotateCanvas(gizmo.center, gizmo.rotation);
			gizmo.draw(this.ctx, this.type == Layer.TYPES.HIT_TEST);
			this.rotateCanvas(gizmo.center, -gizmo.rotation);
		}

		this.ctx.restore();
	}

	rotateCanvas(center, rotation) {
		this.ctx.translate(center.x, center.y);
		this.ctx.rotate(rotation);
		this.ctx.translate(-center.x, -center.y);
	}

	resetCanvasRotation(center, rotation) {
		this.ctx.translate(center.x, center.y);
		this.ctx.rotate(-rotation);
		this.ctx.translate(-center.x, -center.y);
	}

	drawShapes(shapes) {
		this.ctx.save();

		this.clearCanvas();
		this.ctx.scale(viewport.zoom, viewport.zoom);
		this.ctx.translate(viewport.offset.x, viewport.offset.y);

		this.type == Layer.TYPES.STAGE && this.#drawStage();

		for (const shape of shapes) {
			shape.center && this.rotateCanvas(shape.center, shape.rotation);
			shape.draw(this.ctx, this.type == Layer.TYPES.HIT_TEST);
			shape.center && this.rotateCanvas(shape.center, -shape.rotation);
		}

		this.ctx.restore();
	}
}
