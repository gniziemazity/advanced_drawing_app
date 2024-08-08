const shortcuts = [
	{ control: false, key: "r", action: () => ShapeTools.selectTool("Rect") },
	{ control: false, key: "p", action: () => ShapeTools.selectTool("Path") },
	{ control: false, key: "v", action: () => ShapeTools.selectTool("Select") },
	{ control: false, key: "o", action: () => ShapeTools.selectTool("Oval") },
	{ control: false, key: "t", action: () => ShapeTools.selectTool("Text") },
	{ control: false, key: "d", action: resetColors },
	{ control: false, key: "x", action: swapColors },
	{ control: true, key: "z", action: HistoryTools.undo },
	{ control: true, key: "y", action: HistoryTools.redo },
	{ control: true, key: "s", action: DocumentTools.save },
	{ control: true, key: "l", action: DocumentTools.load },
	{ control: true, key: "x", action: DocumentTools.do_export },
	{ control: true, key: "a", action: selectAll },
	{ control: true, key: "c", action: copy },
	{ control: true, key: "v", action: paste },
	{ control: true, key: "d", action: duplicate },
	{ control: false, key: "Delete", action: deleteSelectedShapes },
];

function isShortcut(control, key) {
	return shortcuts.find((s) => s.key === key && s.control === control);
}

function executeShortcut(control, key) {
	const shortcut = isShortcut(control, key);
	if (shortcut) {
		shortcut.action();
	}
}
