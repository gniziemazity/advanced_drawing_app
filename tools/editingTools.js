class EditingTools {
	static selectAll() {
		viewport.shapes.forEach((s) => s.select());
	}

	static copy() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length > 0) {
			const data = selectedShapes.map((s) => s.serialize(STAGE_PROPERTIES));
			clipboard = JSON.stringify(data);
		}
	}

	static paste() {
		if (clipboard) {
			viewport.shapes.forEach((s) => s.unselect());
			const newShapes = ShapeFactory.loadShapes(
				JSON.parse(clipboard),
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

   // move to viewport functionality
   // or layer..
	static delete() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length > 0) {
			let index = viewport.shapes.findIndex((s) => s.selected);
			while (index != -1) {
				viewport.shapes.splice(index, 1);
				index = viewport.shapes.findIndex((s) => s.selected);
			}
			for (let i = viewport.gizmos.length - 1; i >= 0; i--) {
				if (selectedShapes.includes(viewport.gizmos[i].shape)) {
					viewport.gizmos.splice(i, 1);
				}
			}
			viewport.dispatchEvent(
				new CustomEvent("shapesRemoved", { detail: {shapes:selectedShapes, save:true} })
			);
		}
		PropertiesPanel.reset();
	}
}
