class Gizmo {
	constructor(shape) {
		this.shape = shape;

		this.center = this.shape.center;
		this.box = BoundingBox.fromPoints(
			this.shape.getPoints().map((p) => p.add(this.center))
		);

		this.handles = [
			new Handle(this.box.topLeft, Handle.TOP_LEFT),
			new Handle(this.box.topRight, Handle.TOP_RIGHT),
			new Handle(this.box.bottomLeft, Handle.BOTTOM_LEFT),
			new Handle(this.box.bottomRight, Handle.BOTTOM_RIGHT),
			new Handle(
				Vector.midVector([this.box.topLeft, this.box.topRight]),
				Handle.TOP
			),
			new Handle(
				Vector.midVector([this.box.bottomLeft, this.box.bottomRight]),
				Handle.BOTTOM
			),
			new Handle(
				Vector.midVector([this.box.topLeft, this.box.bottomLeft]),
				Handle.LEFT
			),
			new Handle(
				Vector.midVector([this.box.topRight, this.box.bottomRight]),
				Handle.RIGHT
			),
		];
	}

	hasHandle(id) {
		return this.handles.find((handle) => handle.id == id);
	}

	addEventListeners(startPosition, handle, selectedShapes) {
		const oldBoxes = selectedShapes.map((s) =>
			BoundingBox.fromPoints(s.getPoints().map((p) => p.add(this.center)))
		);
		let mouseDelta = null;
		let isDragging = false;
		const moveCallback = (e) => {
			const mousePosition = new Vector(e.offsetX, e.offsetY);
			const diff = Vector.subtract(mousePosition, startPosition);
			mouseDelta = viewport.scale(diff);
			isDragging = true;

			let ratio = new Vector(
				mouseDelta.x / this.box.width,
				mouseDelta.y / this.box.height
			)
				.scale(2)
				.add(new Vector(1, 1));

			switch (handle.type) {
				case Handle.RIGHT:
					ratio = new Vector(ratio.x, 1);
					break;
				case Handle.LEFT:
					ratio = new Vector(2 - ratio.x, 1);
					break;
				case Handle.TOP:
					ratio = new Vector(1, 2 - ratio.y);
					break;
				case Handle.BOTTOM:
					ratio = new Vector(1, ratio.y);
					break;
				case Handle.TOP_LEFT:
					ratio = new Vector(2 - ratio.x, 2 - ratio.y);
					break;
				case Handle.TOP_RIGHT:
					ratio = new Vector(ratio.x, 2 - ratio.y);
					break;
				case Handle.BOTTOM_LEFT:
					ratio = new Vector(2 - ratio.x, ratio.y);
					break;
				case Handle.BOTTOM_RIGHT:
					ratio = new Vector(ratio.x, ratio.y);
					break;
			}

			// Preserve aspect ratio if shift key is held
			// region shift key preserve ratio
			if (
				e.shiftKey &&
				[
					Handle.TOP_LEFT,
					Handle.TOP_RIGHT,
					Handle.BOTTOM_LEFT,
					Handle.BOTTOM_RIGHT,
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

				shape.changeSize(oldBox.width, oldBox.height, ratio.x, ratio.y);
			}

			viewport.drawShapes(shapes);
			PropertiesPanel.updateDisplay(selectedShapes);
		};

		const upCallback = (e) => {
			viewport.canvas.removeEventListener("pointermove", moveCallback);
			viewport.canvas.removeEventListener("pointerup", upCallback);
		};
		viewport.canvas.addEventListener("pointermove", moveCallback);
		viewport.canvas.addEventListener("pointerup", upCallback);
	}

	draw(ctx, hitRegion = false) {
		ctx.save();
		ctx.beginPath();
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
		ctx.lineWidth = 1 / viewport.zoom;
		ctx.stroke();

		const size = Handle.size / viewport.zoom;

		ctx.beginPath();
		ctx.lineWidth = 2 / viewport.zoom;
		ctx.setLineDash([1, 1]);
		ctx.arc(this.center.x, this.center.y, size / 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.lineWidth = 1 / viewport.zoom;
		ctx.setLineDash([]);

		for (const handle of this.handles) {
			handle.draw(ctx, hitRegion);
		}

		ctx.restore();
	}
}
