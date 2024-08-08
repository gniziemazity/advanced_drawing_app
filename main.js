const SHOW_HIT_REGIONS = false;

const RECTANGULAR_SELECTION_MODE = "intersection"; // "intersection" or "containment"
if (!SHOW_HIT_REGIONS) {
	hitTestCanvas.style.display = "none";
}

const stageProperties = {
	width: 600,
	height: 480,
};

const canvasProperties = {
	width: SHOW_HIT_REGIONS ? window.innerWidth / 2 : window.innerWidth,
	height: window.innerHeight,
	center: Vector.zero(),
};
canvasProperties.offset = new Vector(
	canvasProperties.width / 2,
	canvasProperties.height / 2
);

(stageProperties.left = canvasProperties.center.x - stageProperties.width / 2),
	(stageProperties.top =
		canvasProperties.center.y - stageProperties.height / 2);

myCanvas.width = canvasProperties.width;
myCanvas.height = canvasProperties.height;
hitTestCanvas.width = canvasProperties.width;
hitTestCanvas.height = canvasProperties.height;

const ctx = myCanvas.getContext("2d");
const hitTestingCtx = hitTestCanvas.getContext("2d", {
	willReadFrequently: true,
});

ctx.translate(canvasProperties.offset.x, canvasProperties.offset.y);
hitTestingCtx.translate(canvasProperties.offset.x, canvasProperties.offset.y);

clearCanvas();
drawStage();

let shapes = [];
let gizmos = [];
let currentShape = null;
let clipboard = null;

myCanvas.addEventListener("pointerdown", PathTool.addPointerDownListener);

document.addEventListener("keydown", (e) => {
	if (e.target instanceof HTMLInputElement) {
		return;
	}

	if (isShortcut(e.ctrlKey, e.key)) {
		executeShortcut(e.ctrlKey, e.key);
		e.preventDefault();
	}
});

const viewport = new Viewport(
	myCanvas,
	hitTestCanvas,
	canvasProperties,
	stageProperties
);

const propertiesPanel = new PropertiesPanel(propertiesHolder);
const toolsPanel = new ToolsPanel(toolsHolder);



function resetColors() {
	fillColor.value = "#ffffff";
	strokeColor.value = "#000000";
	PropertiesPanel.changeFillColor(fillColor.value);
	PropertiesPanel.changeStrokeColor(strokeColor.value);
}

function swapColors() {
	const fillStyle = fillColor.value;
	const strokeStyle = strokeColor.value;

	fillColor.value = strokeStyle;
	strokeColor.value = fillStyle;

	PropertiesPanel.changeFillColor(fillColor.value);
	PropertiesPanel.changeStrokeColor(strokeColor.value);
}

function getOptions() {
	return {
		fillColor: fillColor.value,
		strokeColor: strokeColor.value,
		fill: fill.checked,
		stroke: stroke.checked,
		strokeWidth: Number(strokeWidth.value),
		lineCap: "round",
		lineJoin: "round",
	};
}

function clearCanvas() {
	ctx.fillStyle = "gray";
	ctx.fillRect(
		-myCanvas.width / 2,
		-myCanvas.height / 2,
		myCanvas.width,
		myCanvas.height
	);

	ctx.fillStyle = "white";

	ctx.textAlign = "right";
	ctx.fillText(
		"Contributors: " + contributors.join(", "),
		myCanvas.width / 2 - 10,
		-myCanvas.height / 2 + 10
	);
}

function drawStage() {
	ctx.save();

	ctx.fillStyle = "white";
	ctx.fillRect(
		stageProperties.left,
		stageProperties.top,
		stageProperties.width,
		stageProperties.height
	);

	ctx.restore();
}

function copy() {
	const selectedShapes = shapes.filter((s) => s.selected);
	if (selectedShapes.length > 0) {
		const data = selectedShapes.map((s) => s.serialize(stageProperties));
		clipboard = JSON.stringify(data);
	}
}

function paste() {
	if (clipboard) {
		shapes.forEach((s) => (s.selected = false));
		const newShapes = loadShapes(JSON.parse(clipboard));
		newShapes.forEach((s) => (s.id = Shape.generateId()));
		shapes.push(...newShapes);

		drawShapes(shapes);
		HistoryTools.record(shapes);
	}
}

function duplicate() {
	copy();
	paste();
}
