const shortcuts = [
	{ control: false, key: "r", action: () => CanvasTools.selectTool("Rect") },
	{ control: false, key: "p", action: () => CanvasTools.selectTool("Path") },
	{ control: false, key: "v", action: () => CanvasTools.selectTool("Select") },
	{ control: false, key: "o", action: () => CanvasTools.selectTool("Oval") },
	{ control: false, key: "t", action: () => CanvasTools.selectTool("Text") },
	{ control: true, key: "u", action: () => window.open(window.location.pathname.replace("index.html", "") + "test.html", "_blank")},
	{ control: false, key: "d", action: PropertiesPanel.resetColors },
	{ control: false, key: "x", action: PropertiesPanel.swapColors },
	{ control: true, key: "z", action: HistoryTools.undo },
	{ control: true, key: "y", action: HistoryTools.redo },
	{ control: true, key: "s", action: DocumentTools.save },
	{ control: true, key: "l", action: DocumentTools.load },
	{ control: true, key: "x", action: DocumentTools.do_export },
	{ control: true, key: "a", action: EditingTools.selectAll },
	{ control: true, key: "c", action: EditingTools.copy },
	{ control: true, key: "v", action: EditingTools.paste },
	{ control: true, key: "d", action: EditingTools.duplicate },
	{ control: false, key: "Delete", action: EditingTools.delete },
];

document.addEventListener("keydown", (e) => {
	if (e.target instanceof HTMLInputElement) {
		return;
	}

	if (isShortcut(e.ctrlKey, e.key)) {
		executeShortcut(e.ctrlKey, e.key);
		e.preventDefault();
	}
});

function isShortcut(control, key) {
	return shortcuts.find((s) => s.key === key && s.control === control);
}

function executeShortcut(control, key) {
	const shortcut = isShortcut(control, key);
	if (shortcut) {
		shortcut.action();
	}
}
