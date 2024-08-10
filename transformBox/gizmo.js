class Gizmo {
	constructor(shape) {
		this.shape = shape;

		this.center = this.shape.center;
		this.box = BoundingBox.fromPoints(
			this.shape.getPoints().map((p) => p.add(this.center))
		);
		this.rotation = shape.rotation;

		// generate handle points after rotation at center of shape
		const topLeft = this.box.topLeft.rotateByCenterPoint(
			this.center,
			this.rotation
		);
		const topRight = this.box.topRight.rotateByCenterPoint(
			this.center,
			this.rotation
		);
		const bottomLeft = this.box.bottomLeft.rotateByCenterPoint(
			this.center,
			this.rotation
		);
		const bottomRight = this.box.bottomRight.rotateByCenterPoint(
			this.center,
			this.rotation
		);
		const rotationPoint = Vector.midVector([
			this.box.topLeft,
			this.box.topRight,
		])
			.subtract(new Vector(0, 2 * Handle.size))
			.rotateByCenterPoint(this.center, this.rotation);

		this.handles = [
			new Handle(topLeft, Handle.TOP_LEFT, this.rotation),
			new Handle(topRight, Handle.TOP_RIGHT, this.rotation),
			new Handle(bottomLeft, Handle.BOTTOM_LEFT, this.rotation),
			new Handle(bottomRight, Handle.BOTTOM_RIGHT, this.rotation),
			new Handle(
				Vector.midVector([topLeft, topRight]),
				Handle.TOP,
				this.rotation
			),
			new Handle(
				Vector.midVector([bottomLeft, bottomRight]),
				Handle.BOTTOM,
				this.rotation
			),
			new Handle(
				Vector.midVector([topLeft, bottomLeft]),
				Handle.LEFT,
				this.rotation
			),
			new Handle(
				Vector.midVector([topRight, bottomRight]),
				Handle.RIGHT,
				this.rotation
			),
			// Add handle to create rotate functionality on all shapes
			...(featureFlags.ROTATE_HANDLE
				? [new Handle(rotationPoint, Handle.ROTATE, this.rotation)]
				: []),
		];
	}

	hasHandle(id) {
		return this.handles.find((handle) => handle.id == id);
	}

	addEventListeners(startPosition, handle, selectedShapes) {
		const oldBoxes = selectedShapes.map((s) =>
			BoundingBox.fromPoints(s.getPoints().map((p) => p.add(this.center)))
		);
		const oldRotations = selectedShapes.map(
			(s) => (s.rotation.angle * Math.PI) / 180
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
				const oldRotation = oldRotations[i];
				if (handle.type === Handle.ROTATE) {
					const fixedStart = viewport.getAdjustedPosition(startPosition);
					const fixedMouse = viewport.getAdjustedPosition(mousePosition);

					// vectors centered at the bounding box center
					const v1 = Vector.subtract(fixedStart, oldBox.center);
					const v2 = Vector.subtract(fixedMouse, oldBox.center);
					const angle = getSignedAngleBetweenVectors(v1, v2);
					const combinedAngle = oldRotation + angle;
					shape.setRotation((combinedAngle * 180) / Math.PI);
				} else {
					shape.changeSize(oldBox.width, oldBox.height, ratio.x, ratio.y);
				}
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

		if (this.rotation?.angle && this.center) {
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate(-(this.rotation.angle * Math.PI) / 180);
			ctx.translate(-this.center.x, -this.center.y);
		}
		ctx.rect(
			this.box.topLeft.x,
			this.box.topLeft.y,
			this.box.width,
			this.box.height
		);
		if (this.rotation?.angle && this.center) {
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate((this.rotation.angle * Math.PI) / 180);
			ctx.translate(-this.center.x, -this.center.y);
		}
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
