class HistoryTools {
	static _stacksByLayer = {};

	static tools = [
		{
			name: "Undo",
			func: HistoryTools.undo,
			showButton: true,
			icon: "undo",
			shortcut: new Shortcut({
				control: true,
				key: "z",
				action: HistoryTools.undo,
			}),
		},
		{
			name: "Redo",
			func: HistoryTools.redo,
			showButton: true,
			icon: "redo",
			shortcut: new Shortcut({
				control: true,
				key: "y",
				action: HistoryTools.redo,
			}),
		},
	];

	static registerShortcuts() {
		HistoryTools.tools.forEach((tool) => {
			const shortcut = tool.shortcut;
			if (shortcut) {
				shortcutManager.addShortcut(shortcut);
			}
		});
	}

	static redo() {
		let selectedLayerId = viewport.selectedLayer.id;
		let redoStack = HistoryTools._getRedoStackByLayerId(selectedLayerId);
		let undoStack = HistoryTools._getUndoStackByLayerId(selectedLayerId);
		if (redoStack.length > 0) {
			const data = redoStack.pop();
			viewport.selectedLayer = Layer.load(
				data,
				viewport.canvasWidth,
				viewport.canvasHeight
			);
			viewport.swapLayerById(selectedLayerId, viewport.selectedLayer);
			undoStack.push(data);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { layers: viewport.layers } })
		);
	}

	static undo() {
		let selectedLayerId = viewport.selectedLayer.id;
		let redoStack = HistoryTools._getRedoStackByLayerId(selectedLayerId);
		let undoStack = HistoryTools._getUndoStackByLayerId(selectedLayerId);
		if (!undoStack.length) return; // prevent pushing undefined into redoStack
		redoStack.push(undoStack.pop());
		if (undoStack.length > 0) {
			const activeLayer = undoStack[undoStack.length - 1];
			viewport.selectedLayer = Layer.load(
				activeLayer,
				viewport.canvasWidth,
				viewport.canvasHeight
			);
			viewport.swapLayerById(selectedLayerId, viewport.selectedLayer);
		} else {
			viewport.selectedLayer = new Layer(
				viewport.canvasWidth,
				viewport.canvasHeight,
				viewport.stageProperties,
				Layer.TYPES.NORMAL
			);
			viewport.swapLayerById(selectedLayerId, viewport.selectedLayer);
		}
		viewport.dispatchEvent(
			new CustomEvent("history", { detail: { layers: viewport.layers } })
		);
	}

	static record() {
		let selectedLayerId = viewport.selectedLayer.id;
		let redoStack = HistoryTools._getRedoStackByLayerId(selectedLayerId);
		let undoStack = HistoryTools._getUndoStackByLayerId(selectedLayerId);
		const currentState = viewport.selectedLayer.serialize();
		if (undoStack.length > 0) {
			const lastItem = undoStack[undoStack.length - 1];
			if (JSON.stringify(lastItem) === JSON.stringify(currentState)) return;
		}
		undoStack.push(currentState);
		redoStack.length = 0;
	}

	static _getUndoStackByLayerId(layerId) {
		if (HistoryTools._stacksByLayer[layerId]?.undoStack) {
			return HistoryTools._stacksByLayer[layerId].undoStack;
		}
		if (!HistoryTools._stacksByLayer[layerId]) {
			HistoryTools._stacksByLayer[layerId] = {};
		}
		HistoryTools._stacksByLayer[layerId].undoStack = [];
		return HistoryTools._stacksByLayer[layerId].undoStack;
	}

	static _getRedoStackByLayerId(layerId) {
		if (HistoryTools._stacksByLayer[layerId]?.redoStack) {
			return HistoryTools._stacksByLayer[layerId].redoStack;
		}
		if (!HistoryTools._stacksByLayer[layerId]) {
			HistoryTools._stacksByLayer[layerId] = {};
		}
		HistoryTools._stacksByLayer[layerId].redoStack = [];
		return HistoryTools._stacksByLayer[layerId].redoStack;
	}
}
