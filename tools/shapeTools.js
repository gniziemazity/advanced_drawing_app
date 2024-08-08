class ShapeTools {
	static tools = [
		{ name: "Path", class: PathTool, showButton: true },
		{ name: "Rect", class: RectTool, showButton: true },
		{ name: "Oval", class: OvalTool, showButton: true },
		{ name: "Text", class: TextTool, showButton: true },
		{ name: "Select", class: SelectTool, showButton: true },
		{ name: "Image", class: MyImageTool, showButton: false },
	];

	static selectTool(type) {
		// Remove all event listeners
		ShapeTools.tools.forEach((tool) => tool.class.removeEventListeners());

		const tool = ShapeTools.tools.find((x) => x.name === type);

		// Add event listeners for the selected tool
		tool.class.configureEventListeners();

		return tool;
	}
}
