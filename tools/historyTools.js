class HistoryTools {
	static redoStack = [];
	static undoStack = [];

	static redo() {
		if (HistoryTools.redoStack.length > 0) {
			const data = HistoryTools.redoStack.pop();
			const newShapes = ShapeFactory.loadShapes(
				data,
				viewport.stageProperties
			);
			viewport.setShapes(newShapes, false);
			HistoryTools.undoStack.push(data);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { shapes: viewport.shapes } })
		);
	}

	static undo() {
		if (!HistoryTools.undoStack.length) return; // prevent pushing undefined into redoStack
		HistoryTools.redoStack.push(HistoryTools.undoStack.pop());
		if (HistoryTools.undoStack.length > 0) {
			const newShapes = ShapeFactory.loadShapes(
				HistoryTools.undoStack[HistoryTools.undoStack.length - 1],
				viewport.stageProperties
			);
			viewport.setShapes(newShapes, false);
		} else {
			viewport.setShapes([], false);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { shapes: viewport.shapes } })
		);
	}

	static record(shapes) {
		const newState = shapes.map((s) => s.serialize());
		if (HistoryTools.undoStack.length > 0) {
			const lastItem =
				HistoryTools.undoStack[HistoryTools.undoStack.length - 1];
			if (JSON.stringify(lastItem) === JSON.stringify(newState)) return;
		}
		HistoryTools.undoStack.push(newState);
		HistoryTools.redoStack.length = 0;
	}
}
