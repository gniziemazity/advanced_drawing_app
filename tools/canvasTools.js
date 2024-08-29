class CanvasTools {
	static tools = [
		{ name: "Path", class: new PathTool(), showButton: true },
		{ name: "Rect", class: new RectTool(), showButton: true },
		{ name: "Oval", class: new OvalTool(), showButton: true },
		{ name: "Text", class: new TextTool(), showButton: true },
		{ name: "Select", class: SelectTool, showButton: true },
		{ name: "Image", class: new MyImageTool(), showButton: false },
	];

	static selectTool(type) {
		CanvasTools.tools.forEach((tool) => tool.class.removeEventListeners());

		const tool = CanvasTools.tools.find((x) => x.name == type);
		tool.class.configureEventListeners();

		viewport.dispatchEvent(new CustomEvent("toolSelected", { detail: tool }));

		return tool;
	}
}