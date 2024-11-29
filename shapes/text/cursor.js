class Cursor {
	static currentText = null;
	static currentIndex = 0;
	static currentLineIndex = 0;
	static currentIntervalId = null;
	static isEditing = false;
	static inPreEditMode = false;
	static showCursor = false

	static attemptToEnterEditMode(shape, startPosition) {
		if (shape.numberClicked && shape.numberClicked % 2 === 0) {
			viewport.dispatchEvent(
				new CustomEvent("TextSelected", {
					detail: { shape, clickedPoint: startPosition },
				})
			);
			HistoryTools.recordTextChange()
		}
	}

	static enterEditMode(textShape, index, lineIndex) {
		Cursor.stopEditMode();
		TextHighlight.reset()
		Cursor.currentText = textShape;
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
		Cursor.currentIntervalId = null;
		if (Cursor.currentText.text === "") {
			Cursor.currentText.selected = true;
			viewport.deleteShapes([Cursor.currentText]);
		}
		Cursor.currentText = null;
		Cursor.currentIndex = 0;
		Cursor.currentLineIndex = 0;
		Cursor.isEditing = false;
		Cursor.showCursor = false
		Cursor.removeEventListeners()
		viewport.drawShapes();
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
		let textShape = Cursor.currentText;
		let lines = textShape.parseText();
		let currentIndex = Cursor.currentIndex;
		let currentLineIndex = Cursor.currentLineIndex;
		let currentLine = lines[currentLineIndex];
		let targetLine = lines[targetLineIndex];
		let currentLineXOffset =
			textShape.properties.xOffsets[currentLineIndex] || 0;
		let targetLineXOffset =
			textShape.properties.xOffsets[targetLineIndex] || 0;
		let currentCursorOffsetFromCenter =
			textShape.getTextWidthOnCanvas(
				currentLine.slice(0, currentIndex + 1)
			) -
			textShape.getTextWidthOnCanvas(currentLine) / 2 +
			currentLineXOffset;

		let targetCurorOffsetFromCenter =
			textShape.getTextWidthOnCanvas(targetLine) / 2 +
			currentCursorOffsetFromCenter;
		let targetLeft =
			-textShape.getTextWidthOnCanvas(targetLine) / 2 + targetLineXOffset;
		let targetRight =
			textShape.getTextWidthOnCanvas(targetLine) / 2 + targetLineXOffset;
		if (currentCursorOffsetFromCenter < targetLeft) return -1;
		if (currentCursorOffsetFromCenter > targetRight)
			return targetLine.length - 1;

		let targetLineLeft =
			textShape.center.x -
			textShape.getTextWidthOnCanvas(targetLine) / 2 +
			targetLineXOffset;
		let targetOffset = targetLineLeft + targetCurorOffsetFromCenter;
		let xOffset = textShape.properties.xOffsets[targetLineIndex] || 0;
		let targetIndex = textShape.getIndexOfTextAtPoint(
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
				viewport.overlayLayer.drawItems([Cursor.getCursor()], false)
			} else {
				viewport.drawShapes();
			}
			tick++;
		}, 300);
	}

	static getCursor() {
		let textShape = Cursor.currentText;
		let lines = textShape.parseText();
		let line = lines[Cursor.currentLineIndex];
		let cursor = new Text(textShape.center, {
			...propertiesPanel.getValues(),
			fillColor: "black",
			strokeColor: "black"
		});
		cursor.properties = JSON.parse(JSON.stringify(textShape.properties));
		cursor.rotation = textShape.rotation;
		let textWithCursor = "";
		let leftPaddingSize = textShape.getPaddingSize(
			"",
			line.slice(0, Cursor.currentIndex + 1)
		);
		let rightPaddingSize = textShape.getPaddingSize(
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
		cursor.setText(textWithCursor, false);
		return cursor;
	}

	static getCursorRowAndIndexFromRawStringIndex(indexInRawString) {
		let index = 0
		let lines = Cursor.currentText.parseText()
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
		let { currentText, currentIndex, currentLineIndex } = currentState.cursorState
		currentText.setText(text, false)
		if (text.length) Cursor.enterEditMode(currentText, currentIndex, currentLineIndex)
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
		let textShape = Cursor.currentText;
		let lines = textShape.parseText();
		let currentIndex = Cursor.currentIndex;
		let lineIndex = Cursor.currentLineIndex;
		let line = lines[lineIndex];

		switch (e.key) {
			case "Escape":
				Cursor.stopEditMode();
				viewport.selectShapes([]);
				break;
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
							TextHighlight.registerHighlightFromRowAndIndex(textShape, row, startIndex, endIndex)
						}
					} else if (lineIndex > 0) {
						let targetIndex = Cursor.getIndexOnMoveUp();
						Cursor.currentLineIndex--;
						Cursor.currentIndex = targetIndex;
					}
				}
				break;

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
							TextHighlight.registerHighlightFromRowAndIndex(textShape, row, startIndex, endIndex)
						}
					} else if (lineIndex < lines.length - 1) {
						let targetIndex = Cursor.getIndexOnMoveDown();
						Cursor.currentLineIndex++;
						Cursor.currentIndex = targetIndex;
					}
				}
				break;

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
							TextHighlight.registerHighlightFromRowAndIndex(textShape, row, startIndex, endIndex)
						}
					} else if (currentIndex > -1) {
						Cursor.currentIndex--;
					} else if (lineIndex > 0) {
						Cursor.currentLineIndex--;
						Cursor.currentIndex = lines[Cursor.currentLineIndex].length - 1;
					}
				}
				break;

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
							TextHighlight.registerHighlightFromRowAndIndex(textShape, row, startIndex, endIndex)
						}
					} else if (currentIndex < line.length - 1) {
						Cursor.currentIndex++;
					} else if (lineIndex < lines.length - 1) {
						Cursor.currentLineIndex++;
						Cursor.currentIndex = -1;
					}
				}
				break;

			case "Backspace":
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = textShape.text.slice(0, startIndex)
						+ textShape.text.slice(endIndex)
					TextHighlight.reset()
					textShape.setText(highlightedText, false)
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
					textShape.setText(lines.join("\n"), false);
				}
				break;

			case "Delete":
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = textShape.text.slice(0, startIndex)
						+ textShape.text.slice(endIndex)
					TextHighlight.reset()
					textShape.setText(highlightedText, false)
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
					textShape.setText(lines.join("\n"), false);
				}
				break;

			case "Enter":
				if (TextHighlight.currentHighlightDetails) {
					let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
					endIndex++
					let highlightedText = textShape.text.slice(0, startIndex)
						+ '\n' + textShape.text.slice(endIndex)
					TextHighlight.reset()
					textShape.setText(highlightedText, false)
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
					textShape.setText(lines.join("\n"), false);
				}
				break;

			default:
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
								TextHighlight.highlightAll(textShape)
								break
							case "C":
								let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
								endIndex++
								let highlightedText = textShape.text.slice(0, endIndex)
								navigator.clipboard.writeText(highlightedText)
								break
							case "V":
								navigator.clipboard.readText()
									.then(copiedText => {
										let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
										endIndex++
										let updatedText = textShape.text.slice(0, startIndex) +
											copiedText +
											textShape.text.slice(endIndex)
										textShape.setText(updatedText, false);
										let indexInRawString = startIndex + copiedText.length
										Cursor.updateCursorPosition(indexInRawString)
									})
								break
							case "Z":
								HistoryTools.textEditUndo()
								return
							case "Y":
								HistoryTools.textEditRedo()
								return
						}
					} else {
						let [startIndex, endIndex] = TextHighlight.getHighlightedIndices()
						endIndex++
						let updatedText = textShape.text.slice(0, startIndex) +
							keyPressedValue +
							textShape.text.slice(endIndex)
						TextHighlight.reset()
						textShape.setText(updatedText, false)
						Cursor.updateCursorPosition(startIndex)
					}
				} else {
					if (e.ctrlKey || e.metaKey) {
						switch (e.key.toUpperCase()) {
							case "A":
								TextHighlight.highlightAll(textShape)
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
										let updatedText = textShape.text.slice(0, startIndex) +
											copiedText +
											textShape.text.slice(startIndex)
										textShape.setText(updatedText, false);
										let indexInRawString = startIndex + copiedText.length - 1
										Cursor.updateCursorPosition(indexInRawString)
									})
							case "Z":
								HistoryTools.textEditUndo()
								return
							case "Y":
								HistoryTools.textEditRedo()
								return
						}
					} else {
						line =
							line.slice(0, currentIndex + 1) +
							keyPressedValue +
							line.slice(currentIndex + 1);
						Cursor.currentIndex++;
						lines[Cursor.currentLineIndex] = line;
						textShape.setText(lines.join("\n"), false);
					}
				}
				break;
		}

		HistoryTools.recordTextChange()
		viewport.dispatchEvent(
			new CustomEvent("textChanged", {
				detail: { shape: textShape, save: false },
			})
		);
	}

}
