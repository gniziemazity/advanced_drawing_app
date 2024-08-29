class EditingTools {
	static clipboard = null;

	static selectAll() {
		viewport.selectShapes(viewport.selectedLayer.shapes)
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
		PropertiesPanel.reset();
	}
}
