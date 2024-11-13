class Cursor {
	static currentText = null;
	static currentIndex = 0;
	static currentLineIndex = 0;
	static currentIntervalId = null;
	static isEditing = false;

	static attemptToEnterEditMode(shape, startPosition) {
		if (shape.numberClicked && shape.numberClicked % 2 === 0) {
			viewport.dispatchEvent(
				new CustomEvent("TextSelected", {
					detail: { shape, clickedPoint: startPosition },
				})
			);
		}
	}

	static enterEditMode(textShape, index, lineIndex) {
		Cursor.stopEditMode();
		Cursor.currentText = textShape;
		Cursor.currentIndex = index;
		Cursor.currentLineIndex = lineIndex;

		Cursor.addEventListeners();
		Cursor.isEditing = true;

		Cursor.startCursorBlink();
	}

	static addEventListeners() {
		document.addEventListener("keydown", Cursor.handleKeyPress);
	}

	static handleKeyPress(e) {
		if (
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement
		) {
			return;
		}
		e.stopPropagation();
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
				if (lineIndex > 0) {
					let targetIndex = Cursor.getIndexOnMoveUp();
					Cursor.currentLineIndex--;
					Cursor.currentIndex = targetIndex;
				}
				break;

			case "ArrowDown":
				if (lineIndex < lines.length - 1) {
					let targetIndex = Cursor.getIndexOnMoveDown();
					Cursor.currentLineIndex++;
					Cursor.currentIndex = targetIndex;
				}
				break;

			case "ArrowLeft":
				if (currentIndex > -1) {
					Cursor.currentIndex--;
				} else if (lineIndex > 0) {
					Cursor.currentLineIndex--;
					Cursor.currentIndex = lines[Cursor.currentLineIndex].length - 1;
				}
				break;

			case "ArrowRight":
				if (currentIndex < line.length - 1) {
					Cursor.currentIndex++;
				} else if (lineIndex < lines.length - 1) {
					Cursor.currentLineIndex++;
					Cursor.currentIndex = -1;
				}
				break;

			case "Backspace":
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
				textShape.setText(lines.join("\n"));
				break;

			case "Delete":
				if (currentIndex + 1 < line.length) {
					line =
						line.slice(0, currentIndex + 1) +
						line.slice(currentIndex + 2);
					lines[lineIndex] = line;
				} else if (lineIndex < lines.length - 1) {
					lines[lineIndex] += lines[lineIndex + 1];
					lines.splice(lineIndex + 1, 1);
				}
				textShape.setText(lines.join("\n"));
				break;

			case "Enter":
				line =
					line.slice(0, currentIndex + 1) +
					"\n" +
					line.slice(currentIndex + 1);
				lines[Cursor.currentLineIndex] = line;
				Cursor.currentIndex = -1;
				Cursor.currentLineIndex++;
				textShape.setText(lines.join("\n"));
				break;

			default:
				let keyPressedValue = e.key;
				if (keyPressedValue.length !== 1) {
					// speacial keys that has not been handled
					// e.g 'number lock' key
					return;
				}
				line =
					line.slice(0, currentIndex + 1) +
					keyPressedValue +
					line.slice(currentIndex + 1);
				Cursor.currentIndex++;
				lines[Cursor.currentLineIndex] = line;
				textShape.setText(lines.join("\n"));
				break;
		}

		viewport.dispatchEvent(
			new CustomEvent("textChanged", {
				detail: { shape: textShape, save: true },
			})
		);
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
		document.removeEventListener("keydown", Cursor.handleKeyPress);
		viewport.drawShapes();
	}

	static startCursorBlink() {
		let tick = 0;
		Cursor.currentIntervalId = setInterval(() => {
			if (tick % 2 === 0) {
				viewport.drawShapes([Cursor.getCursor()]);
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
		let cursor = new Text(textShape.center, propertiesPanel.getValues());
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
}
