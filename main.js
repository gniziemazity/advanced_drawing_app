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

document.addEventListener('DOMContentLoaded', () => {

	const uiManager = new UIManager()
	const tools = new Tools()

	const menu = new Toolbar()
	const undoButton = new Button("<i class='bx bx-undo bx-sm' style='color:#ffffff'></i>")
	undoButton.action = (e) => {
		HistoryTools.undo()
	}

	const redoButton = new Button("<i class='bx bx-redo bx-sm' style='color:#ffffff'></i>")
	redoButton.action = (e) => {
		HistoryTools.redo()
	}

	const saveButton = new Button("<i class='bx bx-save bx-sm' style='color:#ffffff'></i>")
	saveButton.action = (e) => {
		DocumentTools.save()
	}

	const loadButton = new Button("Load")
	loadButton.action = (e) => {
		DocumentTools.load()
	}

	const exportButton = new Button("Export")
	exportButton.action = (e) => {
		DocumentTools.do_export()
	}

	const copyButton = new Button("<i class='bx bxs-copy bx-sm' style='color:#ffffff' ></i>")
	copyButton.action = (e) => {
		EditingTools.duplicate()
	}

	const selectAllButton = new Button("<i class='bx bx-select-multiple bx-sm' style='color:#ffffff' ></i>")
	selectAllButton.action = (e) => {
		EditingTools.selectAll()
	}

	const deleteButton = new Button("<i class='bx bx-trash bx-sm'></i>")
	deleteButton.action = (e) => {
		EditingTools.delete()
	}

	menu.add(undoButton)
	menu.add(redoButton)
	menu.add(saveButton)
	menu.add(loadButton)
	menu.add(exportButton)
	menu.add(copyButton)
	menu.add(selectAllButton)
	menu.add(deleteButton)

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

	uiManager.add(menu)
	uiManager.attachTools(tools)
	uiManager.renderAll()
})
