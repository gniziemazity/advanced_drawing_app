const SHOW_HIT_REGIONS = false
const RECTANGULAR_SELECTION_MODE = "intersection" // "intersection" or "containment"

const STAGE_PROPERTIES = {
	width: 600,
	height: 480,
}

const viewport = new Viewport(
	canvasHolder,
	STAGE_PROPERTIES,
	SHOW_HIT_REGIONS
)

let shapes = []
let gizmos = []
let currentShape = null
let clipboard = null

const propertiesPanel = new PropertiesPanel()
const toolsPanel = new ToolsPanel(toolsHolder)

document.addEventListener('DOMContentLoaded', () => {

	const uiManager = new UIManager()
	const tools = new Tools()

	for (let key in ShapeTools.tools) {

		if (!ShapeTools.tools[key].showButton) continue
		const selected = ShapeTools.tools[key].selected || false
		const icon = ShapeTools.tools[key].icon
		const shapeTool = new Tool(icon, { selected: selected })
		shapeTool.action = (e) => {
			ShapeTools.selectTool(key)
		}

		tools.add(shapeTool)
	}

	uiManager.attachTools(tools)
	uiManager.renderAll()
})
