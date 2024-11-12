class PathTool extends PathGeneratedShapeTool {
	constructor() {
		super();
		this._shape = Path;
	}

	getShortcut() {
		return new Shortcut({
			control: false,
			key: "p",
			action: () => CanvasTools.selectTool("Path"),
		});
	}
}
