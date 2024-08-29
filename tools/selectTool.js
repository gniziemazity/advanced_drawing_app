class SelectTool {
	static addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = new Vector(e.offsetX, e.offsetY);

		const [r, g, b, a] = viewport.hitTestLayer.ctx.getImageData(
			startPosition.x,
			startPosition.y,
			1,
			1
		).data;

		const id = (r << 16) | (g << 8) | b;
		const gizmo = viewport.gizmos.find((g) => g.hasHandle(id));
		if (gizmo) {
			const handle = gizmo.hasHandle(id);
			const selectedShapes = viewport.getSelectedShapes();
			gizmo.addEventListeners(startPosition, handle, selectedShapes);
			return;
		}

		const shape = viewport.getShapes().find((s) => s.id == id);

		const isClickingSelectedShape = shape && shape.selected;

		if (!isClickingSelectedShape) {
			if (e.ctrlKey === false && e.shiftKey === false) {
				viewport.getShapes().forEach((s) => s.unselect(false));
			}
		}

		if (shape) {
			if (!isClickingSelectedShape) {
				shape.select();
			}
			const selectedShapes = viewport.getSelectedShapes();
			const oldCenters = selectedShapes.map((s) => s.center);
			let mouseDelta = null;
			let isDragging = false;

			const moveCallback = function (e) {
				const mousePosition = new Vector(e.offsetX, e.offsetY);
				const diff = Vector.subtract(mousePosition, startPosition);
				mouseDelta = viewport.getAdjustedScale(diff);
				isDragging = true;
				selectedShapes.forEach((s, i) => {
					s.setCenter(Vector.add(oldCenters[i], mouseDelta), false);
				});
			};

			const upCallback = function (e) {
				viewport
					.getStageCanvas()
					.removeEventListener("pointermove", moveCallback);
				viewport
					.getStageCanvas()
					.removeEventListener("pointerup", upCallback);

				if (isClickingSelectedShape && !isDragging) {
					shape.unselect();
				}
				if (isDragging && mouseDelta.magnitude() > 0) {
					selectedShapes.forEach((s, i) => {
						s.setCenter(Vector.add(oldCenters[i], mouseDelta));
					});
				}
			};
			viewport
				.getStageCanvas()
				.addEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().addEventListener("pointerup", upCallback);
		} else {
			SelectTool.selectShapesUnderRectangle(e);
		}
	}

	static selectShapesUnderRectangle(e) {
		const startPosition = new Vector(e.clientX, e.clientY);

		let rect = document.createElement("div");
		rect.style.position = "fixed";
		rect.style.backgroundColor = "transparent";
		rect.style.border = "2px dotted black";
		rect.style.pointerEvents = "none";
		const htmlBody = document.querySelector("body");
		htmlBody.appendChild(rect);

		let topLeft = Vector.zero();
		let bottomRight = Vector.zero();

		const moveCallback = function (e) {
			const mousePosition = new Vector(e.clientX, e.clientY);
			topLeft = Vector.min(startPosition, mousePosition);
			bottomRight = Vector.max(startPosition, mousePosition);
			const offset = bottomRight.subtract(topLeft);

			rect.style.left = `${topLeft.x}px`;
			rect.style.top = `${topLeft.y}px`;
			rect.style.width = `${offset.x}px`;
			rect.style.height = `${offset.y}px`;
		};

		const upCallback = function (e) {
			viewport
				.getStageCanvas()
				.removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);
			rect.removeEventListener("pointerup", upCallback);
			rect.removeEventListener("pointermove", moveCallback);

			// HORRIBLE FIX! But this component will be reimplemented later
			topLeft.y -= 32;
			bottomRight.y -= 32;
			const rectBox = new BoundingBox(
				viewport.getAdjustedPosition(topLeft),
				viewport.getAdjustedPosition(bottomRight)
			);

			viewport.getShapes().forEach((shape) => {
				const shapeBox = BoundingBox.fromPoints(
					shape.getPoints().map((p) => p.add(shape.center))
				);

				switch (RECTANGULAR_SELECTION_MODE) {
					case "containment":
						if (rectBox.contains(shapeBox)) {
							shape.select(false);
						}
						break;
					case "intersection":
						if (rectBox.intersects(shapeBox)) {
							shape.select(false);
						}
						break;
				}
			});
			// for better history management, select the last shape again, saving the state
			const selectedShapes = viewport.getSelectedShapes();
			if (selectedShapes.length > 0) {
				selectedShapes[0].select();
			}

			rect.remove();
		};

		// adding eventlisteners to rect to allow rect redraw when
		// pointer moves into it
		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
		rect.addEventListener("pointerup", upCallback);
		rect.addEventListener("pointermove", moveCallback);
	}

	static configureEventListeners() {
		viewport
			.getStageCanvas()
			.addEventListener("pointerdown", this.addPointerDownListener);
	}

	static removeEventListeners() {
		viewport
			.getStageCanvas()
			.removeEventListener("pointerdown", this.addPointerDownListener);
	}
}
