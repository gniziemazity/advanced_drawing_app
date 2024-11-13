class CanvasTools {
	static tools = [
		{ name: "Path", class: new PathTool(), showButton: true },
		{ name: "Line", class: new LineTool(), showButton: true },
		{ name: "Rect", class: new RectTool(), showButton: true },
		{ name: "Oval", class: new OvalTool(), showButton: true },
		{ name: "Text", class: new TextTool(), showButton: true },
		{ name: "Select", class: new SelectTool(), showButton: true },
		{ name: "Image", class: new MyImageTool(), showButton: false },
	];

	static registerShortcuts() {
		CanvasTools.tools.forEach((tool) => {
			const shortcut = tool.class.getShortcut();
			if (shortcut) {
				shortcutManager.addShortcut(shortcut);
			}
		});
	}

	static selectTool(type) {
		CanvasTools.tools.forEach((tool) => tool.class.removeEventListeners());

		const tool = CanvasTools.tools.find((x) => x.name == type);
		tool.class.configureEventListeners();

		viewport.dispatchEvent(new CustomEvent("toolSelected", { detail: tool }));

		return tool;
	}
}
