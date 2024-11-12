class LineTool extends PathGeneratedShapeTool {
	constructor() {
		super();
		this._shape = Line;
	}

	getShortcut() {
		return new Shortcut({
			control: false,
			key: "l",
			action: () => CanvasTools.selectTool("Line"),
		});
	}
}
