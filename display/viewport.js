class Viewport {
	constructor(canvas, hitTestCanvas, stageProperties, showHitRegions) {
		this.canvas = canvas;
		this.hitTestCanvas = hitTestCanvas;
		this.stageProperties = stageProperties;
		this.showHitRegions = showHitRegions;
		this.zoom = 1;
		this.offset = Vector.zero();
		this.zoomStep = 0.05;

		if (!showHitRegions) {
			hitTestCanvas.style.display = "none";
		}

		this.canvasProperties = {
			width: showHitRegions ? window.innerWidth / 2 : window.innerWidth,
			height: window.innerHeight,
			center: Vector.zero(),
		};
		this.canvasProperties.offset = new Vector(
			this.canvasProperties.width / 2,
			this.canvasProperties.height / 2
		);

		this.stageProperties.left = -this.stageProperties.width / 2;
		this.stageProperties.top = -this.stageProperties.height / 2;

		canvas.width = this.canvasProperties.width;
		canvas.height = this.canvasProperties.height;
		hitTestCanvas.width = this.canvasProperties.width;
		hitTestCanvas.height = this.canvasProperties.height;

		this.ctx = canvas.getContext("2d");
		this.hitTestingCtx = hitTestCanvas.getContext("2d", {
			willReadFrequently: true,
		});

		this.ctx.translate(
			this.canvasProperties.offset.x,
			this.canvasProperties.offset.y
		);
		this.hitTestingCtx.translate(
			this.canvasProperties.offset.x,
			this.canvasProperties.offset.y
		);

		this.#clearCanvas();
		this.#drawStage();

		this.#addEventListeners();
	}

	scale(vector) {
		return vector.scale(1 / this.zoom);
	}

	getAdjustedPosition(vector) {
		return vector
			.subtract(this.canvasProperties.offset)
			.scale(1 / this.zoom)
			.subtract(this.offset);
	}

	drawShapes(shapes) {
		gizmos = shapes.filter((s) => s.selected).map((s) => new Gizmo(s));

		this.ctx.save();
		this.hitTestingCtx.save();

		this.#clearCanvas();
		this.hitTestingCtx.clearRect(
			-this.canvasProperties.width / 2,
			-this.canvasProperties.height / 2,
			this.canvasProperties.width,
			this.canvasProperties.height
		);

		this.ctx.scale(viewport.zoom, viewport.zoom);
		this.hitTestingCtx.scale(viewport.zoom, viewport.zoom);

		this.ctx.translate(viewport.offset.x, viewport.offset.y);
		this.hitTestingCtx.translate(viewport.offset.x, viewport.offset.y);

		this.#drawStage();
		for (const shape of shapes) {
			shape.draw(this.ctx);
		}

		for (const gizmo of gizmos) {
			gizmo.draw(this.ctx);
		}

		for (const shape of shapes) {
			shape.draw(this.hitTestingCtx, true);
		}

		for (const gizmo of gizmos) {
			gizmo.draw(this.hitTestingCtx, true);
		}
		this.ctx.restore();
		this.hitTestingCtx.restore();
	}

	#clearCanvas() {
		this.ctx.fillStyle = "gray";
		this.ctx.fillRect(
			-myCanvas.width / 2,
			-myCanvas.height / 2,
			myCanvas.width,
			myCanvas.height
		);

		this.ctx.fillStyle = "white";

		this.ctx.textAlign = "right";
		this.ctx.fillText(
			"Contributors: " + contributors.join(", "),
			myCanvas.width / 2 - 10,
			-myCanvas.height / 2 + 10
		);
	}

	#drawStage() {
		this.ctx.save();

		this.ctx.fillStyle = "white";
		this.ctx.fillRect(
			STAGE_PROPERTIES.left,
			STAGE_PROPERTIES.top,
			STAGE_PROPERTIES.width,
			STAGE_PROPERTIES.height
		);

		this.ctx.restore();
	}

	#addEventListeners() {
		this.canvas.addEventListener("wheel", (e) => {
			e.preventDefault();
			const dir = -Math.sign(e.deltaY);
			this.zoom += dir * this.zoomStep;
			this.zoom = Math.max(this.zoomStep, this.zoom);
			viewport.drawShapes(shapes);
		});

		this.canvas.addEventListener("pointerdown", (e) => {
			if (e.button === 1) {
				let dragStart = new Vector(e.offsetX, e.offsetY);
				const moveCallback = (e) => {
					const dragEnd = new Vector(e.offsetX, e.offsetY);
					const diff = Vector.subtract(dragEnd, dragStart);
					const scaledDiff = diff.scale(1 / this.zoom);
					this.offset = Vector.add(this.offset, scaledDiff);
					dragStart = dragEnd;
					viewport.drawShapes(shapes);
				};
				const upCallback = (e) => {
					this.canvas.removeEventListener("pointermove", moveCallback);
					this.canvas.removeEventListener("pointerup", upCallback);
				};
				this.canvas.addEventListener("pointermove", moveCallback);
				this.canvas.addEventListener("pointerup", upCallback);
			}
		});
	}
}
