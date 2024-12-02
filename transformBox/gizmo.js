class Gizmo {
	static nextId = 0;
	constructor(shape) {
		this.id = Gizmo.nextId++;

		this.shape = shape;
		this.center = this.shape.center;
		this.rotation = shape.rotation;

		this.#generate();
		shape.gizmo = this;
	}

	updatePosition(e) {
		this.center = this.shape.center;
		this.#update();
	}

	updateSize(e) {
		this.#update();
	}

	updateRotation(e) {
		this.rotation = this.shape.rotation;
		this.#update();
	}

	hasHandle(id) {
		return this.handles.find((handle) => handle.id == id);
	}

	#generate() {
		this.box = BoundingBox.fromPoints(
			this.shape.getPoints().map((p) => p.add(this.center))
		);
		const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
		const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
			new Vector(0, 2 * Handle.size)
		);

		this.handles = [
			new Handle(topLeft, Handle.TYPES.TOP_LEFT),
			new Handle(topRight, Handle.TYPES.TOP_RIGHT),
			new Handle(bottomLeft, Handle.TYPES.BOTTOM_LEFT),
			new Handle(bottomRight, Handle.TYPES.BOTTOM_RIGHT),
			new Handle(Vector.mid([topLeft, topRight]), Handle.TYPES.TOP),
			new Handle(Vector.mid([bottomLeft, bottomRight]), Handle.TYPES.BOTTOM),
			new Handle(Vector.mid([topLeft, bottomLeft]), Handle.TYPES.LEFT),
			new Handle(Vector.mid([topRight, bottomRight]), Handle.TYPES.RIGHT),
		];
		this.handles.push(
			new Handle(rotationPoint, Handle.TYPES.ROTATE, this.handles[4])
		);
	}

	#update() {
		this.box = BoundingBox.fromPoints(
			this.shape.getPoints().map((p) => p.add(this.center))
		);
		const { topLeft, topRight, bottomLeft, bottomRight } = this.box;
		this.handles[0].center = topLeft;
		this.handles[1].center = topRight;
		this.handles[2].center = bottomLeft;
		this.handles[3].center = bottomRight;
		this.handles[4].center = Vector.mid([topLeft, topRight]);
		this.handles[5].center = Vector.mid([bottomLeft, bottomRight]);
		this.handles[6].center = Vector.mid([topLeft, bottomLeft]);
		this.handles[7].center = Vector.mid([topRight, bottomRight]);
		const rotationPoint = Vector.mid([topLeft, topRight]).subtract(
			new Vector(0, 2 * Handle.size)
		);
		this.handles[8].center = rotationPoint;
	}

	addEventListeners(startPosition, handle, selectedShapes) {
		const oldBoxes = selectedShapes.map((s) =>
			BoundingBox.fromPoints(s.getPoints().map((p) => p.add(this.center)))
		);

		const startingSigns = selectedShapes.map((s) => ({
			widthSign: Math.sign(s.getWidth()),
			heightSign: Math.sign(s.getHeight()),
		}));

		const oldRotations = selectedShapes.map((s) => s.rotation);
		let mouseDelta = null;
		const prevSize = { width: this.box.width, height: this.box.height };
		const moveCallback = (e) => {
			const mousePosition = new Vector(e.offsetX, e.offsetY);
			const diff = Vector.subtract(mousePosition, startPosition);
			const polar = diff.toPolar();
			polar.dir -= this.rotation;
			diff.toXY(polar);

			mouseDelta = viewport.getAdjustedScale(diff);

			let ratio = new Vector(
				mouseDelta.x / prevSize.width,
				mouseDelta.y / prevSize.height
			)
				.scale(2)
				.add(new Vector(1, 1));

			switch (handle.type) {
				case Handle.TYPES.RIGHT:
					ratio = new Vector(ratio.x, 1);
					break;
				case Handle.TYPES.LEFT:
					ratio = new Vector(2 - ratio.x, 1);
					break;
				case Handle.TYPES.TOP:
					ratio = new Vector(1, 2 - ratio.y);
					break;
				case Handle.TYPES.BOTTOM:
					ratio = new Vector(1, ratio.y);
					break;
				case Handle.TYPES.TOP_LEFT:
					ratio = new Vector(2 - ratio.x, 2 - ratio.y);
					break;
				case Handle.TYPES.TOP_RIGHT:
					ratio = new Vector(ratio.x, 2 - ratio.y);
					break;
				case Handle.TYPES.BOTTOM_LEFT:
					ratio = new Vector(2 - ratio.x, ratio.y);
					break;
				case Handle.TYPES.BOTTOM_RIGHT:
					ratio = new Vector(ratio.x, ratio.y);
					break;
			}

			// Preserve aspect ratio if shift key is held
			// region shift key preserve ratio
			if (
				e.shiftKey &&
				[
					Handle.TYPES.TOP_LEFT,
					Handle.TYPES.TOP_RIGHT,
					Handle.TYPES.BOTTOM_LEFT,
					Handle.TYPES.BOTTOM_RIGHT,
				].includes(handle.type)
			) {
				const scaler = Math.max(Math.abs(ratio.x), Math.abs(ratio.y));
				ratio = new Vector(
					Math.sign(ratio.x) * scaler,
					Math.sign(ratio.y) * scaler
				);
			}

			// endregion
			for (let i = 0; i < selectedShapes.length; i++) {
				const shape = selectedShapes[i];
				const oldBox = oldBoxes[i];
				const oldRotation = oldRotations[i];

				if (handle.type === Handle.TYPES.ROTATE) {
					const fixedStart = viewport.getAdjustedPosition(startPosition);
					const fixedMouse = viewport.getAdjustedPosition(mousePosition);

					// vectors centered at the bounding box center
					const v1 = Vector.subtract(fixedStart, oldBox.center);
					const v2 = Vector.subtract(fixedMouse, oldBox.center);
					const angle = Vector.getSignedAngle(v2, v1);
					const combinedAngle = oldRotation + angle;
					shape.setRotation(combinedAngle, false);
				} else {
					shape.setSize(
						oldBox.width * ratio.x * startingSigns[i].widthSign,
						oldBox.height * ratio.y * startingSigns[i].heightSign,
						false
					);
				}
			}
		};

		const upCallback = (e) => {
			selectedShapes.forEach((s) => s.setSize(s.getWidth(), s.getHeight()))
			viewport
				.getStageCanvas()
				.removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);
		};
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
	}

	draw(ctx, hitRegion = false) {
		ctx.save();
		ctx.beginPath();

		if (!hitRegion) {
			ctx.rect(
				this.box.topLeft.x,
				this.box.topLeft.y,
				this.box.width,
				this.box.height
			);
			ctx.strokeStyle = "white";
			ctx.lineWidth = 2 / viewport.zoom;
			ctx.stroke();
			ctx.strokeStyle = "black";
			ctx.lineWidth /= 2;
			ctx.stroke();

			const centerRadius = (0.5 * Handle.size) / viewport.zoom;
			const centerLength = 2 * Math.PI * centerRadius;
			const dashCount = 3;
			const dashLength = (0.25 * centerLength) / dashCount;
			const spaceLength = (0.75 * centerLength) / dashCount;

			ctx.save();
			ctx.beginPath();
			ctx.lineWidth = 3 / viewport.zoom;
			ctx.setLineDash([dashLength, spaceLength]);
			ctx.arc(this.center.x, this.center.y, centerRadius, 0, 2 * Math.PI);
			ctx.lineCap = "round";
			ctx.strokeStyle = "white";
			ctx.stroke();
			ctx.lineWidth /= 2;
			ctx.strokeStyle = "black";
			ctx.stroke();
			ctx.restore();
		}

		for (const handle of this.handles) {
			handle.draw(ctx, hitRegion);
		}

		ctx.restore();
	}
}
