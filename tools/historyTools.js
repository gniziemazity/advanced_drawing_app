class HistoryTools {
	static redoStack = [];
	static undoStack = [];

	static redo() {
		if (HistoryTools.redoStack.length > 0) {
			const data = HistoryTools.redoStack.pop();
         viewport.setLayers(data, false);
			HistoryTools.undoStack.push(data);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { layers: viewport.layers } })
		);
	}

	static undo() {
		if (!HistoryTools.undoStack.length) return; // prevent pushing undefined into redoStack
		HistoryTools.redoStack.push(HistoryTools.undoStack.pop());
		if (HistoryTools.undoStack.length > 0) {
         const newLayers = HistoryTools.undoStack[HistoryTools.undoStack.length - 1];
			viewport.setLayers(newLayers, false);
		} else {
			viewport.setLayers([new Layer(
            viewport.canvasWidth,
            viewport.canvasHeight,
            viewport.stageProperties,
            Layer.TYPES.NORMAL
         )], false);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { layers: viewport.layers } })
		);
	}

	static record(layers) {
		const newState = layers.map((l) => l.serialize());
		if (HistoryTools.undoStack.length > 0) {
			const lastItem =
				HistoryTools.undoStack[HistoryTools.undoStack.length - 1];
			if (JSON.stringify(lastItem) === JSON.stringify(newState)) return;
		}
		HistoryTools.undoStack.push(newState);
		HistoryTools.redoStack.length = 0;
	}
}
