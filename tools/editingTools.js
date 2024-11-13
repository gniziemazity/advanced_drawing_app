class EditingTools {
	static clipboard = null;
	static tools = [
		{
			name: "Duplicate",
			func: EditingTools.duplicate,
			showButton: true,
			icon: "copy",
			shortcut: new Shortcut({
				control: true,
				key: "d",
				action: EditingTools.duplicate,
			}),
		},
		{
			name: "Select All",
			func: EditingTools.selectAll,
			showButton: true,
			icon: "select_all",
			shortcut: new Shortcut({
				control: true,
				key: "a",
				action: EditingTools.selectAll,
			}),
		},
		{
			name: "Delete",
			func: EditingTools.delete,
			showButton: true,
			icon: "trash",
			shortcut: new Shortcut({
				control: false,
				key: "Delete",
				action: EditingTools.delete,
			}),
		},
		{
			name: "Copy",
			func: EditingTools.copy,
			showButton: false,
			shortcut: new Shortcut({
				control: true,
				key: "c",
				action: EditingTools.copy,
			}),
		},
		{
			name: "Paste",
			func: EditingTools.paste,
			showButton: false,
			shortcut: new Shortcut({
				control: true,
				key: "v",
				action: EditingTools.paste,
			}),
		},
	];

	static registerShortcuts() {
		EditingTools.tools.forEach((tool) => {
			const shortcut = tool.shortcut;
			if (shortcut) {
				shortcutManager.addShortcut(shortcut);
			}
		});
	}

	static selectAll() {
		viewport.selectShapes(viewport.selectedLayer.shapes);
	}

	static copy() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length > 0) {
			const data = selectedShapes.map((s) => s.serialize(STAGE_PROPERTIES));
			EditingTools.clipboard = JSON.stringify(data);
		}
	}

	static paste() {
		if (EditingTools.clipboard) {
			viewport.getShapes().forEach((s) => s.unselect());
			const newShapes = ShapeFactory.loadShapes(
				JSON.parse(EditingTools.clipboard),
				viewport.stageProperties
			);
			newShapes.forEach((s) => (s.id = Shape.generateId()));
			viewport.addShapes(newShapes);
		}
	}

	static duplicate() {
		EditingTools.copy();
		EditingTools.paste();
	}

	static delete() {
		const selectedShapes = viewport.getSelectedShapes();
		viewport.deleteShapes(selectedShapes);
		propertiesPanel.reset();
	}
}
