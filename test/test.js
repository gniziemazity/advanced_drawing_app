const notDrawable = ["Image", "Select", "Text"];

function beforeEach() {
	viewport.selectedLayer.shapes = [];
	viewport.gizmos = [];
	EditingTools.clipboard = null;
	clearViewPort(viewport);
	clearHitTestCanvas(viewport);
}

function clearViewPort(viewport) {
	viewport.selectedLayer.clearCanvas();
}

function clearHitTestCanvas(viewport) {
	viewport.hitTestLayer.clearCanvas();
}

// this class exists to generate valid x and y coordinates
// to draw shapes.
// it prevents two points from having same x or y values
// since such points will prevent shapes to be drawn due to
// zero width or zero height
class RandomCoordinatesGenerator {
	static previousX = 0;
	static previousY = 0;

	static getRandomXcanvasPoint() {
		let newX = Math.round(
			(Math.random() * viewport.getStageCanvas().width) /
			window.devicePixelRatio
		);
		if (newX === RandomCoordinatesGenerator.previousX) {
			return RandomCoordinatesGenerator.getRandomXcanvasPoint();
		}
		RandomCoordinatesGenerator.previousX = newX;
		return newX;
	}

	static getRandomYcanvasPoint() {
		let newY = Math.round(
			(Math.random() * viewport.getStageCanvas().height) /
			window.devicePixelRatio
		);
		if (newY === RandomCoordinatesGenerator.previousY) {
			return RandomCoordinatesGenerator.getRandomYcanvasPoint();
		}
		RandomCoordinatesGenerator.previousY = newY;
		return newY;
	}
}

function getShapeAtPoint(x, y) {
	setCurrentTool("Select");
	let e = dispatchMouseEventOnCanvas("pointerdown", x, y);

	// deselect already selected shape based on original selectTool.pointerdown event
	// and redraw
	viewport.getShapes().forEach((s) => s.unselect());
	viewport.gizmos = [];
	viewport.drawShapes();

	const startPosition = new Vector(e.offsetX, e.offsetY).scale(
		window.devicePixelRatio
	);

	const [r, g, b, a] = viewport.hitTestLayer.ctx.getImageData(
		startPosition.x,
		startPosition.y,
		2,
		2,
		{ colorSpace: "srgb" }
	).data;

	const id = (r << 16) | (g << 8) | b;
	const shape =
		viewport.getShapes().find((s) => s.id == id) ||
		viewport.getShapes().find((s) => rgbIsDiffLessThanThreshHold(s.id, id));
	dispatchMouseEventOnCanvas("pointerup", x, y);
	if (!shape) {
		console.log(id, viewport.getShapes());
		// debugger
		// noticed sometimes ctx.getImageData returns slightly different
		// rgb values different from shape.id by 1 e.g [30, 248, 7] and [29, 248, 6]
		// so i wrote the rgbDiffLessThanThreshHold function.
		// is there a chance this function could solve the occassional anti-aliased
		// hit region click bug? where it does not pick the shape under click?
	}
	return shape;
}

// maybe this function could solve the occassional anti-aliased
// hit region click bug? where it does not pick the shape under click?
function rgbIsDiffLessThanThreshHold(id1, id2, treshHold = 10) {
	return Math.abs(getHitRGBSum(id1) - getHitRGBSum(id2)) < treshHold;
}

function getHitRGBSum(id) {
	const red = (id & 0xff0000) >> 16;
	const green = (id & 0x00ff00) >> 8;
	const blue = id & 0x0000ff;
	return red + green + blue;
}

function setCurrentTool(tool) {
	CanvasTools.selectTool(tool);
}

function dispatchMouseEventOnCanvas(type, clientX, clientY) {
	let event = new MouseEvent(type, {
		clientX,
		clientY,
		bubbles: true,
		cancelable: true,
	});

	viewport.getStageCanvas().dispatchEvent(event);
	return event;
}

function simulateShapeDraw(shapeName, startX, startY, endX, endY) {
	setCurrentTool(shapeName);
	simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY);
}

function simulateShapeDelete(startX, startY, endX, endY) {
	setCurrentTool("Select");
	simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY);
	EditingTools.delete();
}

function simulateShapeCopyAndPaste(startX, startY, endX, endY) {
	setCurrentTool("Select");
	simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY);
	EditingTools.duplicate();
}

function simulateRectangleSelect(startX, startY, endX, endY) {
	setCurrentTool("Select");
	simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY);
}

function simulateShapeMove(startX, startY, endX, endY) {
	setCurrentTool("Select");
	simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY);
}

function simulatePointerDownPointerMovePointerUp(startX, startY, endX, endY) {
	dispatchMouseEventOnCanvas("pointerdown", startX, startY);
	dispatchMouseEventOnCanvas("pointermove", endX, endY);
	dispatchMouseEventOnCanvas("pointerup", endX, endY);
}

function TestAllShapesCanBeDrawn() {
	try {
		for (const shapeTool of CanvasTools.tools) {
			beforeEach();
			if (!notDrawable.includes(shapeTool.name)) {
				let startPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				let endPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				simulateShapeDraw(
					shapeTool.name,
					startPoint.x,
					startPoint.y,
					endPoint.x,
					endPoint.y
				);
				let mid = Vector.mid([startPoint, endPoint]);
				let shape = getShapeAtPoint(mid.x, mid.y);
				if (shape?.constructor.name !== shapeTool.name) {
					failed(
						TestAllShapesCanBeDrawn,
						"failed to draw " + shapeTool.name
					);
				} else {
					success(
						TestAllShapesCanBeDrawn,
						`drew ${shapeTool.name} successfully`
					);
				}
			}
		}
	} catch (err) {
		failed(TestAllShapesCanBeDrawn, err.message);
	}
}

function TestAllShapesCanBeDeleted() {
	try {
		for (const shapeTool of CanvasTools.tools) {
			beforeEach();
			if (!notDrawable.includes(shapeTool.name)) {
				let startPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				let endPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				simulateShapeDraw(
					shapeTool.name,
					startPoint.x,
					startPoint.y,
					endPoint.x,
					endPoint.y
				);
				assert(
					viewport.getShapes().length === 1,
					`failed to draw ${shapeTool.name}: shapes length should be 1 after draw`
				);
				let mid = Vector.mid([startPoint, endPoint]);
				simulateShapeDelete(mid.x, mid.y, mid.x, mid.y);
				assert(
					viewport.getShapes().length === 0,
					`failed to delete ${shapeTool.name
					}: shapes length should be 0 after delete, shape.length is: ${viewport.getShapes().length
					}`
				);
				success(
					TestAllShapesCanBeDeleted,
					`deleted ${shapeTool.name} successfully`
				);
			}
		}
	} catch (err) {
		failed(TestAllShapesCanBeDeleted, err.message);
	}
}

function TestAllShapesCanBeCopyAndPasted() {
	try {
		for (const shapeTool of CanvasTools.tools) {
			beforeEach();
			if (!notDrawable.includes(shapeTool.name)) {
				let startPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				let endPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				simulateShapeDraw(
					shapeTool.name,
					startPoint.x,
					startPoint.y,
					endPoint.x,
					endPoint.y
				);
				assert(
					viewport.getShapes().length === 1,
					`failed to draw ${shapeTool.name}: shapes length should be 1 after draw`
				);
				let mid = Vector.mid([startPoint, endPoint]);
				simulateShapeCopyAndPaste(mid.x, mid.y, mid.x, mid.y);
				assert(
					viewport.getShapes().length === 2,
					`copy-pasting ${shapeTool.name
					}: shapes length should be x2 after copy and paste, shape.length is: ${viewport.getShapes().length
					}`
				);
				success(
					TestAllShapesCanBeCopyAndPasted,
					`copy pasted ${shapeTool.name} successfully`
				);
			}
		}
	} catch (err) {
		failed(TestAllShapesCanBeCopyAndPasted, err.message);
	}
}

function TestRectangleSelect() {
	try {
		for (const shapeTool of CanvasTools.tools) {
			beforeEach();
			if (!notDrawable.includes(shapeTool.name)) {
				let startPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				let endPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				simulateShapeDraw(
					shapeTool.name,
					startPoint.x,
					startPoint.y,
					endPoint.x,
					endPoint.y
				);
				assert(
					viewport.getShapes().length === 1,
					`failed to draw ${shapeTool.name}: shapes length should be 1 after draw`
				);
				simulateRectangleSelect(
					0,
					0,
					viewport.getStageCanvas().width,
					viewport.getStageCanvas().height
				);
				let selectedShapes = viewport.getSelectedShapes();
				assert(
					selectedShapes.length === 1,
					`rectangle selecting ${shapeTool.name}: selectedShapes length should be 1 after drawing rect, selectedShapes.length is: ${selectedShapes.length}`
				);
				success(
					TestRectangleSelect,
					`rectangle selected ${shapeTool.name} successfully`
				);
			}
		}
	} catch (err) {
		failed(TestRectangleSelect, err.message);
	}
}

function TestShapeMove() {
	try {
		for (const shapeTool of CanvasTools.tools) {
			beforeEach();
			if (!notDrawable.includes(shapeTool.name)) {
				let startPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				let endPoint = new Vector(
					RandomCoordinatesGenerator.getRandomXcanvasPoint(),
					RandomCoordinatesGenerator.getRandomYcanvasPoint()
				);
				simulateShapeDraw(
					shapeTool.name,
					startPoint.x,
					startPoint.y,
					endPoint.x,
					endPoint.y
				);
				let mid = Vector.mid([startPoint, endPoint]);
				mid.x = Math.round(mid.x);
				mid.y = Math.round(mid.y);
				let shape = getShapeAtPoint(mid.x, mid.y);
				assert(
					shape !== null,
					`failed to draw ${shapeTool.name}: no shape at midpoint`
				);
				let prevCenter = shape.center;
				simulateShapeMove(mid.x, mid.y, endPoint.x, endPoint.y);
				let diff = Vector.subtract(endPoint, mid);
				let mouseDelta = viewport.getAdjustedScale(diff);
				let newCenter = Vector.add(prevCenter, mouseDelta);
				assert(
					newCenter.x === shape.center.x && newCenter.y === shape.center.y,
					`moving ${shapeTool.name}: failed`
				);
				success(
					TestShapeMove,
					`moved ${shapeTool.name} from ${prevCenter.x},${prevCenter.y} to ${newCenter.x},${newCenter.y} successfully`
				);
			}
		}
	} catch (err) {
		failed(TestShapeMove, err.message);
	}
}

function TestSave() {
	beforeEach();
	try {
		assert(viewport.getShapes().length === 0, "shapes should be empty");
		drawAllShapes();
		assert(
			viewport.getShapes().length > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let savedFile = mimicDocumentToolsDotSave();
		if (!savedFile) {
			failed(TestSave, "failed to save");
		} else {
			success(TestSave, "saved All shapes successfully");
		}
	} catch (err) {
		failed(TestSave, err.message);
	}
}

async function TestExport() {
	beforeEach();
	try {
		assert(viewport.getShapes().length === 0, "shapes should be empty");
		drawAllShapes();
		assert(
			viewport.getShapes().length > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let blob = await mimicDocumentToolsDotExport();
		if (!blob) {
			failed(TestExport, "failed to export canvas to blob");
		} else {
			success(TestExport, "exported canvas to blob successfuly");
		}
	} catch (err) {
		failed(TestExport, err.message);
	}
}

async function TestLoadSavedJSON() {
	beforeEach();
	try {
		assert(viewport.getShapes().length === 0, "shapes should be empty");
		drawAllShapes();
		assert(
			viewport.getShapes().length > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let blob = mimicDocumentToolsDotSave();
		let shapesLengthBeforeLoad = viewport.getShapes().length;
		assert(
			shapesLengthBeforeLoad > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let loadedShapes = await mimicDocumentToolsDotLoad(blob, "json");
		if (shapesLengthBeforeLoad !== loadedShapes.length) {
			failed(
				TestLoadSavedJSON,
				"failed: reloaded shapes should have the same length as during export"
			);
		} else {
			success(
				TestLoadSavedJSON,
				"saved canvas to JSON and reloaded successfuly"
			);
		}
	} catch (err) {
		failed(TestLoadSavedJSON, err.message);
	}
}

async function TestLoadExportedPNG() {
	beforeEach();
	try {
		assert(viewport.getShapes().length === 0, "shapes should be empty");
		drawAllShapes();
		assert(
			viewport.getShapes().length > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let blob = await mimicDocumentToolsDotExport();
		let shapesLengthBeforeLoad = viewport.getShapes().length;
		assert(
			shapesLengthBeforeLoad > 0,
			"shapes should not be empty after drawAllShapes"
		);
		let loadedShapes = await mimicDocumentToolsDotLoad(blob, "png");
		// loaded png is added to already existing shapes
		if (shapesLengthBeforeLoad + 1 !== loadedShapes.length) {
			failed(
				TestLoadExportedPNG,
				"failed: reloaded shapes should have the same length + 1 as during export"
			);
		} else {
			success(
				TestLoadExportedPNG,
				"exported canvas and reloaded as png successfuly"
			);
		}
	} catch (err) {
		failed(TestLoadExportedPNG, err.message);
	}
}

async function TestLoadingPreviousDrawings() {
	try {
		for (let drawing of previosDrawings) {
			beforeEach();
			assert(viewport.getShapes().length === 0, "shapes should be empty");
			let blob =
				drawing.type === "json"
					? jsonToBlob(drawing.content)
					: dataURLToBlob(drawing.content);
			let loadedShapes = await mimicDocumentToolsDotLoad(blob, drawing.type);
			if (loadedShapes.length === 0) {
				failed(
					TestLoadingPreviousDrawings,
					"failed: reload drawing: " + drawing.name
				);
			} else {
				success(
					TestLoadingPreviousDrawings,
					"successfully reloaded " + drawing.name
				);
			}
		}
	} catch (err) {
		failed(TestLoadingPreviousDrawings, err.message);
	}
}

function assert(shouldBeTrue, msg) {
	if (!shouldBeTrue) {
		throw new Error("assert: " + msg);
	}
}

function appendElementToBody(element) {
	document.querySelector("body").appendChild(element);
}

function success(func, msg) {
	let detail = `${func.name}:  ${msg}`;
	let element = createDOMElement("div", null, detail);
	element.appendChild(createDOMElement("hr"));
	element.style.color = "green";
	element.style.width = "fit-content";
	appendElementToBody(element);
}

function failed(func, msg) {
	let detail = `${func.name}:  ${msg}`;
	let element = createDOMElement("div", null, detail);
	element.appendChild(createDOMElement("hr"));
	element.style.color = "red";
	element.style.width = "fit-content";
	appendElementToBody(element);
}

function displayNotTested() {
	let notTested = [
		"PropertiesPanel functions",
		"Gizmo handles and its effects",
	];
	notTested.forEach((detail) => {
		let tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		let element = document.createElement("div");
		element.innerHTML = `${tab}not tested: ${detail}`;
		element.style.color = "blue";
		element.style.width = "fit-content";
		element.appendChild(createDOMElement("hr"));
		appendElementToBody(element);
	});
}

function drawAllShapes() {
	for (const shapeTool of CanvasTools.tools) {
		if (!notDrawable.includes(shapeTool.name)) {
			let startPoint = new Vector(
				RandomCoordinatesGenerator.getRandomXcanvasPoint(),
				RandomCoordinatesGenerator.getRandomYcanvasPoint()
			);
			let endPoint = new Vector(
				RandomCoordinatesGenerator.getRandomXcanvasPoint(),
				RandomCoordinatesGenerator.getRandomYcanvasPoint()
			);
			simulateShapeDraw(
				shapeTool.name,
				startPoint.x,
				startPoint.y,
				endPoint.x,
				endPoint.y
			);
		}
	}
}

function mimicDocumentToolsDotSave() {
	const data = JSON.stringify(viewport.layers.map((l) => l.serialize()));

	const file = new Blob([data], { type: "application/json" });

	return file;
}

function mimicDocumentToolsDotExport() {
	const tmpCanvas = document.createElement("canvas");
	tmpCanvas.width = viewport.canvasWidth;
	tmpCanvas.height = viewport.canvasHeight;
	const tmpCtx = tmpCanvas.getContext("2d");
	for (const layer of viewport.layers) {
		tmpCtx.drawImage(layer.canvas, 0, 0);
	}

	return new Promise((resolve) => {
		tmpCanvas.toBlob((blob) => {
			resolve(blob);
		});
	});
}

function mimicDocumentToolsDotLoad(blob, type) {
	return loadBlob(blob, type);
}

async function loadBlob(blob, type) {
	const reader = new FileReader();

	if (type === "json") {
		reader.readAsText(blob);
	} else if (type === "png") {
		reader.readAsDataURL(blob);
	}

	return new Promise((resolve) => {
		reader.onload = (e) => {
			if (type === "json") {
				const data = JSON.parse(e.target.result);
				viewport.setLayers(data);
				resolve(viewport.getShapes());
			} else if (type === "png") {
				// DocumentTools.loadImage duplicate
				const img = new Image();
				img.onload = () => {
					const myImage = new MyImage(img, propertiesPanel.getValues());
					myImage.setCenter(
						new Vector(
							STAGE_PROPERTIES.left + STAGE_PROPERTIES.width / 2,
							STAGE_PROPERTIES.top + STAGE_PROPERTIES.height / 2
						)
					);
					viewport.addShapes(myImage);
					resolve(viewport.getShapes());
				};
				img.src = e.target.result;
			}
		};
	});
}

function dataURLToBlob(dataURL) {
	const [header, base64Data] = dataURL.split(",");
	const mimeString = header.match(/:(.*?);/)[1];
	const byteString = atob(base64Data);
	const byteArray = new Uint8Array(byteString.length);

	for (let i = 0; i < byteString.length; i++) {
		byteArray[i] = byteString.charCodeAt(i);
	}

	return new Blob([byteArray], { type: mimeString });
}

function jsonToBlob(jsonString) {
	return new Blob([jsonString], { type: "application/json" });
}

function logFileContent() {
	let attributes = {
		type: "file",
	};
	let element = createInputWithLabel("file", attributes);
	element.onchange = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		const extension = file.name.split(".").pop();

		reader.onload = (e) => {
			if (extension === "json") {
				console.log(e.target.result);
			} else if (extension === "png") {
				console.log(e.target.result);
			}
		};

		if (extension === "json") {
			reader.readAsText(file);
		} else if (extension === "png") {
			reader.readAsDataURL(file);
		}
	};
	element.style.color = "green";
	appendElementToBody(element);
}

TestAllShapesCanBeDrawn();
TestAllShapesCanBeDeleted();
TestAllShapesCanBeCopyAndPasted();
TestRectangleSelect();
TestShapeMove();
TestSave();
async function runasyncTestsSynchroniously() {
	await TestExport();
	await TestLoadSavedJSON();
	await TestLoadExportedPNG();
	await TestLoadingPreviousDrawings();
	displayNotTested();
}
runasyncTestsSynchroniously();
