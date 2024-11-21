class HistoryTools {
	static _stacksByLayer = {};
	static _textEditModeHistory = {}

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

	static _getUndoStackForText(textId) {
		if (HistoryTools._textEditModeHistory[textId]?.undoStack) {
			return HistoryTools._textEditModeHistory[textId].undoStack;
		}
		if (!HistoryTools._textEditModeHistory[textId]) {
			HistoryTools._textEditModeHistory[textId] = {};
		}
		HistoryTools._textEditModeHistory[textId].undoStack = [];
		return HistoryTools._textEditModeHistory[textId].undoStack;
	}

	static _getRedoStackForText(textId) {
		if (HistoryTools._textEditModeHistory[textId]?.redoStack) {
			return HistoryTools._textEditModeHistory[textId].redoStack;
		}
		if (!HistoryTools._textEditModeHistory[textId]) {
			HistoryTools._textEditModeHistory[textId] = {};
		}
		HistoryTools._textEditModeHistory[textId].redoStack = [];
		return HistoryTools._textEditModeHistory[textId].redoStack;
	}

	static recordTextChange() {
		let currentText = Cursor.currentText

		let undoStack = HistoryTools._getUndoStackForText(currentText.id)

		let lastState = undoStack[undoStack.length - 1]
		if (
			lastState &&
			lastState.text === currentText.text
		) {
			return
		}

		currentText.redoStack = []
		undoStack.push(
			{
				text: currentText.text,
				cursorState: {
					currentText: Cursor.currentText,
					currentIndex: Cursor.currentIndex,
					currentLineIndex: Cursor.currentLineIndex,
				}
			}
		)
	}

	static textEditUndo() {
		let undoStack = HistoryTools._getUndoStackForText(Cursor.currentText.id)
		let redoStack = HistoryTools._getRedoStackForText(Cursor.currentText.id)

		if (undoStack?.length > 0) {
			let currentSate = undoStack.pop()
			if (undoStack.length) {
				Cursor.restoreState(undoStack[undoStack.length - 1])
				redoStack.push(currentSate)
			}
			if (undoStack.length === 0) {
				undoStack.push(currentSate)
			}
		}
	}

	static textEditRedo() {
		let undoStack = HistoryTools._getUndoStackForText(Cursor.currentText.id)
		let redoStack = HistoryTools._getRedoStackForText(Cursor.currentText.id)
		if (redoStack?.length > 0) {
			const currentState = redoStack.pop();
			undoStack.push(currentState);
			Cursor.restoreState(currentState)
		}
	}
}
