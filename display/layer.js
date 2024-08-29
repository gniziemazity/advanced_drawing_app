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

			case Layer.TYPES.STAGE:
				this.canvas.style.backgroundColor = "var(--bg-canvas)";
				break;
		}

		// adjustment to get (0,0) in the center screen
		this.zeroCenterOffset = new Vector(canvasWidth / 2, canvasHeight / 2);
		this.ctx.translate(this.zeroCenterOffset.x, this.zeroCenterOffset.y);

		this.offset = Vector.zero();
		this.center = Vector.zero();
		this.zoom = 1;
		this.zoomStep = 0.05;

		this.clearCanvas();
		this.type == Layer.TYPES.STAGE && this.#drawStage();
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

	#rotateCanvas(center, rotation) {
		if (rotation == 0) return;
		this.ctx.translate(center.x, center.y);
		this.ctx.rotate(rotation);
		this.ctx.translate(-center.x, -center.y);
	}

	drawItems(items, doClearCanvas = true) {
		this.ctx.save();

		doClearCanvas && this.clearCanvas();
		this.ctx.scale(viewport.zoom, viewport.zoom);
		this.ctx.translate(viewport.offset.x, viewport.offset.y);
		this.type == Layer.TYPES.STAGE && this.#drawStage();

		for (const item of items) {
			this.#rotateCanvas(item.center, item.rotation);
			item.draw(this.ctx, this.type == Layer.TYPES.HIT_TEST);
			this.#rotateCanvas(item.center, -item.rotation);
		}

		this.ctx.restore();
	}
}
