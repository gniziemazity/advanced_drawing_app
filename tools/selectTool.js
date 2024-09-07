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
				if (shape.text !== undefined) {
					viewport.dispatchEvent(
						new CustomEvent("TextSelected", {
							detail: { shape, clickedPoint: startPosition },
						})
					)
				}
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
		const startPosition = viewport.getAdjustedPosition(
			Vector.fromOffsets(e)
		)

		let selecetionRectangle = null

		const moveCallback = function (e) {
			const mousePosition = viewport.getAdjustedPosition(
				Vector.fromOffsets(e)
			)

			const points = [startPosition, mousePosition];
			const center = Vector.mid(points);
			const size = BoundingBox.fromPoints(points)

			let rectProperTies = {
				fillColor: "black",
				strokeColor: "black",
				stroke: true,
				strokeWidth: 1,
				lineCap: "round",
			}

			selecetionRectangle = new Rect(center, size, rectProperTies)

			viewport.overlayLayer.drawItems([selecetionRectangle], true) 
		};

		const upCallback = function (e) {
			viewport
				.getStageCanvas()
				.removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);

			viewport.overlayLayer.drawItems([], true)

			if (selecetionRectangle) {
				const rectBox = BoundingBox.fromPoints(selecetionRectangle.getPoints().map((p) => p.add(selecetionRectangle.center)))

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
			}
			// for better history management, select the last shape again, saving the state
			const selectedShapes = viewport.getSelectedShapes();
			if (selectedShapes.length > 0) {
				selectedShapes[0].select();
			}
		};

		viewport.getStageCanvas().addEventListener("pointermove", moveCallback);
		viewport.getStageCanvas().addEventListener("pointerup", upCallback);
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
