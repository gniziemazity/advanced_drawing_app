class Cursor {
	static canvas = null;
	static ctx = null
	static currentEditor = null;
	static currentIndex = 0;
	static currentLineIndex = 0;
	static currentIntervalId = null;
	static isEditing = false;
	static inPreEditMode = false;
	static showCursor = false
	static onStopEdit = null

	static enterEditMode(canvas, editor, index, lineIndex) {
		Cursor.canvas = canvas
		Cursor.ctx = Cursor.canvas.getContext("2d", {
			willReadFrequently: true,
		});
		Cursor.stopEditMode();
		TextHighlight.reset()
		Cursor.currentEditor = editor;
		Cursor.currentIndex = index;
		Cursor.currentLineIndex = lineIndex;

		Cursor.removeEventListeners()
		Cursor.addEventListeners();
		Cursor.isEditing = true;
		Cursor.showCursor = true

		Cursor.startCursorBlink();
	}

	static stopEditMode() {
		if (!Cursor.currentIntervalId) {
			return;
		}
		clearInterval(Cursor.currentIntervalId);
		Cursor.clearCanvas()
		Cursor.currentIntervalId = null;
		if (Cursor.currentEditor.text === "") {
			Cursor.currentEditor.onempty && Cursor.currentEditor.onempty()
		}
		Cursor.currentEditor = null;
		Cursor.currentIndex = 0;
		Cursor.currentLineIndex = 0;
		Cursor.isEditing = false;
		Cursor.showCursor = false
		Cursor.removeEventListeners()
		Cursor.onStopEdit && Cursor.onStopEdit()
		Cursor.onStopEdit = null
	}

	static addEventListeners() {
		Cursor.removeEventListeners()
		document.addEventListener("keydown", Cursor.handleKeyPress);
	}

	static removeEventListeners() {
		document.removeEventListener("keydown", Cursor.handleKeyPress);
	}

	static getIndexOnMoveUp() {
		return Cursor.getIndexOnMoveTo(Cursor.currentLineIndex - 1);
	}

	static getIndexOnMoveDown() {
		return Cursor.getIndexOnMoveTo(Cursor.currentLineIndex + 1);
	}

	static getIndexOnMoveTo(targetLineIndex) {
		let editor = Cursor.currentEditor;
		let lines = editor.parseText();
		let currentIndex = Cursor.currentIndex;
		let currentLineIndex = Cursor.currentLineIndex;
		let currentLine = lines[currentLineIndex];
		let targetLine = lines[targetLineIndex];
		let currentLineXOffset =
			editor.properties.xOffsets[currentLineIndex] || 0;
		let targetLineXOffset =
			editor.properties.xOffsets[targetLineIndex] || 0;
		let currentCursorOffsetFromCenter =
			editor.getTextWidthOnCanvas(
				currentLine.slice(0, currentIndex + 1)
			) -
			editor.getTextWidthOnCanvas(currentLine) / 2 +
			currentLineXOffset;

		let targetCurorOffsetFromCenter =
			editor.getTextWidthOnCanvas(targetLine) / 2 +
			currentCursorOffsetFromCenter;
		let targetLeft =
			-editor.getTextWidthOnCanvas(targetLine) / 2 + targetLineXOffset;
		let targetRight =
			editor.getTextWidthOnCanvas(targetLine) / 2 + targetLineXOffset;
		if (currentCursorOffsetFromCenter < targetLeft) return -1;
		if (currentCursorOffsetFromCenter > targetRight)
			return targetLine.length - 1;

		let targetLineLeft =
			editor.center.x -
			editor.getTextWidthOnCanvas(targetLine) / 2 +
			targetLineXOffset;
		let targetOffset = targetLineLeft + targetCurorOffsetFromCenter;
		let xOffset = editor.properties.xOffsets[targetLineIndex] || 0;
		let targetIndex = editor.getIndexOfTextAtPoint(
			new Vector(targetOffset - xOffset, 0),
			targetLine
		);
		return targetIndex;
	}


	static startCursorBlink() {
		let tick = 0;
		clearInterval(Cursor.currentIntervalId)
		Cursor.currentIntervalId = setInterval(() => {
			if (tick % 2 === 0) {
				if (!Cursor.showCursor) return
				Cursor.drawCursor()
			} else {
				Cursor.clearCanvas();
			}
			tick++;
		}, 300);
	}

	static drawCursor() {
		let editor = Cursor.currentEditor;
		let cursor = new TextEditor(editor.center, {
			...propertiesPanel.getValues(),
			fillColor: "black",
			strokeColor: "black"
		})
		let lines = editor.parseText();
		let line = lines[Cursor.currentLineIndex];
		cursor.properties = JSON.parse(JSON.stringify(editor.properties));
		cursor.rotation = editor.rotation;
		let textWithCursor = "";
		let leftPaddingSize = editor.getPaddingSize(
			"",
			line.slice(0, Cursor.currentIndex + 1)
		);
		let rightPaddingSize = editor.getPaddingSize(
			"",
			line.slice(Cursor.currentIndex + 1)
		);
		for (let i = 0; i < lines.length; i++) {
			if (i === Cursor.currentLineIndex) {
				textWithCursor += makeSpace(leftPaddingSize);
				textWithCursor += "|";
				textWithCursor += makeSpace(rightPaddingSize);
			}
			if (i !== lines.length - 1) textWithCursor += "\n";
		}
		cursor.setText(textWithCursor);
		rotateCanvas(Cursor.ctx, cursor.center, cursor.rotation);
		cursor.draw(Cursor.ctx)
		rotateCanvas(Cursor.ctx, cursor.center, -cursor.rotation);
	}

	static clearCanvas() {
		Cursor.ctx.clearRect(
			-Cursor.canvas.width / 2,
			-Cursor.canvas.height / 2,
			Cursor.canvas.width,
			Cursor.canvas.height
		);
	}

	static getCursorRowAndIndexFromRawStringIndex(indexInRawString) {
		let index = 0
		let lines = Cursor.currentEditor.parseText()
		for (let row = 0; row < lines.length; row++) {
			let line = lines[row]
			index += line.length + (row > 0 ? 1 : 0) // +1 for \n
			if (index >= indexInRawString) {
				let currentIndex = indexInRawString - (index - line.length)
				return [row, currentIndex]
			}
		}
		throw new Error("Cursor.getCursorRowAndIndexFromRawStringIndex: could not get row and index")
	}

	static updateCursorPosition(indexInRawString) {
		let [row, index] = Cursor.getCursorRowAndIndexFromRawStringIndex(indexInRawString)
		Cursor.currentLineIndex = row
		Cursor.currentIndex = index
	}

	static restoreState(currentState) {
		let text = currentState.text
		let { currentEditor, currentIndex, currentLineIndex } = currentState.cursorState
		currentEditor.setText(text)
		if (text.length) Cursor.enterEditMode(Cursor.canvas, currentEditor, currentIndex, currentLineIndex)
	}

	static handleKeyPress(e) {
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement
		) {
			return;
		}
		e.stopPropagation();
		if (Cursor.inPreEditMode) {
			// implicit enter to edit mode by typing while inPreEditMode
			Cursor.inPreEditMode = false
			Cursor.showCursor = true
			Cursor.isEditing = true
			Cursor.startCursorBlink()
		}
		let editor = Cursor.currentEditor;
		let lines = editor.parseText();
		let currentIndex = Cursor.currentIndex;
		let lineIndex = Cursor.currentLineIndex;
		let line = lines[lineIndex];

		switch (e.key) {
			case "Escape":
				Cursor.stopEditMode();
				return;
			case "CapsLock":
			case "Control":
			case "Shift":
			case "Alt":
			case "Meta":
			case "Tab":
				return;
			case "Home":
				Cursor.currentIndex = -1;
				break;
			case "End":
				Cursor.currentIndex = line.length - 1;
				break;
			case "ArrowUp":
				if (TextHighlight.currentHighlightDetails) {
					if (e.shiftKey) {
						TextHighlight.moveHighlight(e.key)
					} else {
						let [startIndex, _] = TextHighlight.getHighlightedIndices()
						let [row, index] = Cursor.getCursorRowAndIndexFromRawStringIndex(startIndex - 1)
						Cursor.currentLineIndex = row
						Cursor.currentIndex = index
						TextHighlight.reset()
					}
				} else {
					if (e.shiftKey) {
						if (lineIndex > 0) {
							let row = lineIndex - 1
							let startIndex = Math.max(lines[row].length - 2, 0)
							let endIndex = Math.max(lines[row].length - 1, 0)
							TextHighlight.indexOfLineHighlightDescToMoveWithKey = "start"
							TextHighlight.registerHighlightFromRowAndIndex(editor, row, startIndex, endIndex, Cursor.canvas)
						}
					} else if (lineIndex > 0) {
						let targetIndex = Cursor.getIndexOnMoveUp();
						Cursor.currentLineIndex--;
						Cursor.currentIndex = targetIndex;
					}
				}
				return;

			case "ArrowDown":
				if (TextHighlight.currentHighlightDetails) {
					if (e.shiftKey) {
						TextHighlight.moveHighlight(e.key)
					} else {
						let [_, endIndex] = TextHighlight.getHighlightedIndices()
						let [row, index] = Cursor.getCursorRowAndIndexFromRawStringIndex(endIndex)
						Cursor.currentLineIndex = row
						Cursor.currentIndex = index
						TextHighlight.reset()
					}
				} else {
					if (e.shiftKey) {
						if (lineIndex < lines.length - 1) {
							let row = lineIndex + 1
							let startIndex = 0
							let endIndex = Math.min(lines[row].length, 1)
							TextHighlight.indexOfLineHighlightDescToMoveWithKey = "end"
							TextHighlight.registerHighlightFromRowAndIndex(editor, row, startIndex, endIndex, Cursor.canvas)
						}
					} else if (lineIndex < lines.length - 1) {
						let targetIndex = Cursor.getIndexOnMoveDown();
						Cursor.currentLineIndex++;
						Cursor.currentIndex = targetIndex;
					}
				}
				return;

			case "ArrowLeft":
				if (TextHighlight.currentHighlightDetails) {
					if (e.shiftKey) {
						TextHighlight.moveHighlight(e.key)
					} else {
						let [startIndex, _] = TextHighlight.getHighlightedIndices()
						let [row, index] = Cursor.getCursorRowAndIndexFromRawStringIndex(startIndex - 1)
						Cursor.currentLineIndex = row
						Cursor.currentIndex = index
						TextHighlight.reset()
					}
				} else {
					if (e.shiftKey) {
						if (currentIndex > -2) {
							let row = lineIndex
							let startIndex = currentIndex
							let endIndex = currentIndex + 1
							TextHighlight.indexOfLineHighlightDescToMoveWithKey = "start"
							TextHighlight.registerHighlightFromRowAndIndex(editor, row, startIndex, endIndex, Cursor.canvas)
						}
					} else if (currentIndex > -1) {
						Cursor.currentIndex--;
					} else if (lineIndex > 0) {
						Cursor.currentLineIndex--;
						Cursor.currentIndex = lines[Cursor.currentLineIndex].length - 1;
					}
				}
				return;

			case "ArrowRight":
				if (TextHighlight.currentHighlightDetails) {
					if (e.shiftKey) {
						TextHighlight.moveHighlight(e.key)
					} else {
						let [_, endIndex] = TextHighlight.getHighlightedIndices()
						let [row, index] = Cursor.getCursorRowAndIndexFromRawStringIndex(endIndex)
						Cursor.currentLineIndex = row
						Cursor.currentIndex = index
						TextHighlight.reset()
					}
				} else {
					if (e.shiftKey) {
						let row = lineIndex
						if (currentIndex < lines[row].length) {
							let startIndex = currentIndex + 1
							let endIndex = currentIndex + 2
							TextHighlight.indexOfLineHighlightDescToMoveWithKey = "end"
							TextHighlight.registerHighlightFromRowAndIndex(editor, row, startIndex, endIndex, Cursor.canvas)
						}
					} else if (currentIndex < line.length - 1) {
						Cursor.currentIndex++;
					} else if (lineIndex < lines.length - 1) {
						Cursor.currentLineIndex++;
						Cursor.currentIndex = -1;
					}
				}
				return;

			case "Backspace":
				Cursor.clearCanvas()
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = editor.text.slice(0, startIndex)
						+ editor.text.slice(endIndex)
					TextHighlight.reset()
					editor.setText(highlightedText, false)
					Cursor.updateCursorPosition(startIndex - 1)
				} else {
					if (currentIndex > -1) {
						line =
							line.slice(0, currentIndex) + line.slice(currentIndex + 1);
						lines[lineIndex] = line;
						Cursor.currentIndex--;
					} else if (lineIndex > 0) {
						let previousLineLength = lines[lineIndex - 1].length;
						lines[lineIndex - 1] += line;
						lines.splice(lineIndex, 1);
						Cursor.currentLineIndex--;
						Cursor.currentIndex = previousLineLength - 1;
					}
					editor.setText(lines.join("\n"), false);
				}
				break;

			case "Delete":
				Cursor.clearCanvas()
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = editor.text.slice(0, startIndex)
						+ editor.text.slice(endIndex)
					TextHighlight.reset()
					editor.setText(highlightedText, false)
					Cursor.updateCursorPosition(startIndex - 1)
				} else {
					if (currentIndex + 1 < line.length) {
						line =
							line.slice(0, currentIndex + 1) +
							line.slice(currentIndex + 2);
						lines[lineIndex] = line;
					} else if (lineIndex < lines.length - 1) {
						lines[lineIndex] += lines[lineIndex + 1];
						lines.splice(lineIndex + 1, 1);
					}
					editor.setText(lines.join("\n"), false);
				}
				break;

			case "Enter":
				Cursor.clearCanvas()
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = editor.text.slice(0, startIndex)
						+ '\n' + editor.text.slice(endIndex)
					TextHighlight.reset()
					editor.setText(highlightedText, false)
					Cursor.updateCursorPosition(startIndex + 1)
					Cursor.currentIndex--
				} else {
					line =
						line.slice(0, currentIndex + 1) +
						"\n" +
						line.slice(currentIndex + 1);
					lines[Cursor.currentLineIndex] = line;
					Cursor.currentIndex = -1;
					Cursor.currentLineIndex++;
					editor.setText(lines.join("\n"), false);
				}
				break;

			default:
				Cursor.clearCanvas()
				let keyPressedValue = e.key;
				if (keyPressedValue.length !== 1) {
					// speacial keys that has not been handled
					// e.g 'number lock' key
					return;
				}
				if (TextHighlight.currentHighlightDetails) {
					if (e.ctrlKey || e.metaKey) {
						switch (e.key.toUpperCase()) {
							case "A":
								TextHighlight.highlightAll(editor, Cursor.canvas)
								break
							case "C":
								let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
								endIndex++
								let highlightedText = editor.text.slice(0, endIndex)
								navigator.clipboard.writeText(highlightedText)
								break
							case "V":
								navigator.clipboard.readText()
									.then(copiedText => {
										let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
										endIndex++
										let updatedText = editor.text.slice(0, startIndex) +
											copiedText +
											editor.text.slice(endIndex)
										editor.setText(updatedText, false);
										let indexInRawString = startIndex + copiedText.length
										Cursor.updateCursorPosition(indexInRawString)
									})
								break
							case "Z":
								Cursor.currentEditor.undo()
								return
							case "Y":
								Cursor.currentEditor.redo()
								return
						}
					} else {
						let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
						endIndex++
						let updatedText = editor.text.slice(0, startIndex) +
							keyPressedValue +
							editor.text.slice(endIndex)
						TextHighlight.reset()
						editor.setText(updatedText, false)
						Cursor.updateCursorPosition(startIndex)
					}
				} else {
					if (e.ctrlKey || e.metaKey) {
						switch (e.key.toUpperCase()) {
							case "A":
								TextHighlight.highlightAll(editor, Cursor.canvas)
								break
							case "V":
								navigator.clipboard.readText()
									.then(copiedText => {
										let startIndex = 0
										for (let row = 0; row < lines.length; row++) {
											if (row === lineIndex) {
												startIndex += currentIndex
												break
											}
											startIndex += lines[row].length + 1
										}
										startIndex++
										let updatedText = editor.text.slice(0, startIndex) +
											copiedText +
											editor.text.slice(startIndex)
										editor.setText(updatedText, false);
										let indexInRawString = startIndex + copiedText.length - 1
										Cursor.updateCursorPosition(indexInRawString)
									})
							case "Z":
								Cursor.currentEditor.undo()
								return
							case "Y":
								Cursor.currentEditor.redo()
								return
						}
					} else {
						line =
							line.slice(0, currentIndex + 1) +
							keyPressedValue +
							line.slice(currentIndex + 1);
						Cursor.currentIndex++;
						lines[Cursor.currentLineIndex] = line;
						editor.setText(lines.join("\n"), false);
					}
				}
				break;
		}

		Cursor.currentEditor.recordTextChange()
	}

}
