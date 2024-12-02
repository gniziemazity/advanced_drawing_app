class SelectTool extends GenericTool {
	constructor() {
		super();
	}

	getShortcut() {
		return new Shortcut({
			control: false,
			key: "v",
			action: () => CanvasTools.selectTool("Select"),
		});
	}

	addPointerDownListener(e) {
		if (e.button !== 0) return;

		const startPosition = new Vector(e.offsetX, e.offsetY);
		const startPositionCtxScale = startPosition.scale(
			window.devicePixelRatio
		);

		const [r, g, b, a] = viewport.hitTestLayer.ctx.getImageData(
			startPositionCtxScale.x,
			startPositionCtxScale.y,
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
				shape.click();
				if (shape.isText()) {
					shape.attemptToEnterEditMode(startPosition);
				}
			}
			const selectedShapes = viewport.getSelectedShapes();
			const oldCenters = selectedShapes.map((s) => s.center);
			let mouseDelta = null;
			let isDragging = false;

			const moveCallback = function (e) {
				const mousePosition = new Vector(e.offsetX, e.offsetY);
				const diff = Vector.subtract(mousePosition, startPosition);
				if (e.shiftKey) {
					if (Math.abs(diff.x) >= Math.abs(diff.y)) {
						diff.y = 0;
					} else {
						diff.x = 0;
					}
				}
				mouseDelta = viewport.getAdjustedScale(diff);
				isDragging = true;
				if ((Cursor.isEditing || Cursor.inPreEditMode) && shape.isText()) {
					TextHighlight.registerHighlight(
						shape.editor,
						viewport.getAdjustedPosition(startPosition),
						viewport.getAdjustedPosition(startPosition.add(mouseDelta)),
						Cursor.canvas
					)
				} else {
					selectedShapes.forEach((s, i) => {
						s.setCenter(Vector.add(oldCenters[i], mouseDelta), false);
					});
				}
			};

			const upCallback = function (e) {
				viewport
					.getStageCanvas()
					.removeEventListener("pointermove", moveCallback);
				viewport
					.getStageCanvas()
					.removeEventListener("pointerup", upCallback);

				if (isDragging && mouseDelta.magnitude() > 0) {
					if ((Cursor.isEditing || Cursor.inPreEditMode) && shape.isText()) {

					} else {
						selectedShapes.forEach((s, i) => {
							s.setCenter(Vector.add(oldCenters[i], mouseDelta));
						});
					}
				}

				if (isClickingSelectedShape && !isDragging) {
					shape.click();
					if (shape.isText()) {
						shape.attemptToEnterEditMode(startPosition);
					}
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
		const startPosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));

		let selectionRectangle = null;

		const moveCallback = function (e) {
			const mousePosition = viewport.getAdjustedPosition(
				Vector.fromOffsets(e)
			);

			const points = [startPosition, mousePosition];
			const center = Vector.mid(points);
			const size = BoundingBox.fromPoints(points);

			let rectProperTies = {
				fillColor: "black",
				strokeColor: "black",
				stroke: true,
				strokeWidth: 1,
				lineCap: "round",
			};

			selectionRectangle = new Rect(center, size, rectProperTies);

			viewport.overlayLayer.drawItems([selectionRectangle], true);
		};

		const upCallback = function (e) {
			viewport
				.getStageCanvas()
				.removeEventListener("pointermove", moveCallback);
			viewport.getStageCanvas().removeEventListener("pointerup", upCallback);

			viewport.overlayLayer.drawItems([], true);

			if (selectionRectangle) {
				const rectBox = BoundingBox.fromPoints(
					selectionRectangle
						.getPoints()
						.map((p) => p.add(selectionRectangle.center))
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

	keyCallback(e) {
		if (Cursor.isEditing || Cursor.inPreEditMode) {
			return;
		}

		let diff = Vector.zero();
		switch (e.key) {
			case "ArrowUp":
				diff = new Vector(0, -1);
				break;
			case "ArrowDown":
				diff = new Vector(0, 1);
				break;
			case "ArrowLeft":
				diff = new Vector(-1, 0);
				break;
			case "ArrowRight":
				diff = new Vector(1, 0);
				break;
			default:
				return;
		}
		if (e.shiftKey) {
			diff = diff.scale(10);
		}
		viewport.getSelectedShapes().forEach((s, i) => {
			s.setCenter(Vector.add(s.center, diff), true);
		});
	}

	configureEventListeners() {
		viewport
			.getStageCanvas()
			.addEventListener("pointerdown", this.addPointerDownListener);
		document.addEventListener("keydown", this.keyCallback);
	}

	removeEventListeners() {
		viewport
			.getStageCanvas()
			.removeEventListener("pointerdown", this.addPointerDownListener);
		document.removeEventListener("keydown", this.keyCallback);
	}
}
