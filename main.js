const SHOW_HIT_REGIONS = true;
const RECTANGULAR_SELECTION_MODE = "intersection"; // "intersection" or "containment"

const STAGE_PROPERTIES = {
	width: 600,
	height: 480,
};

const viewport = new Viewport(
	myCanvas,
	hitTestCanvas,
	STAGE_PROPERTIES,
	SHOW_HIT_REGIONS
);

let shapes = [];
let gizmos = [];
let currentShape = null;
let clipboard = null;

const propertiesPanel = new PropertiesPanel(propertiesHolder);
const toolsPanel = new ToolsPanel(toolsHolder);