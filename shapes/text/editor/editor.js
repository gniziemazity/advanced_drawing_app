class TextEditor {
    constructor(center, options, onchange = () => { }) {
        this.center = center;
        this.options = options
        this.onchange = onchange

        const properties = {
            fontSize: 60,
            font: "60px Arial",
            textAlign: "center",
            _textAlign: "Center",
            xOffsets: {},
            textBaseline: "middle",
            lineJoin: "round",
            lineCap: "round",
            dilation: 20, //for hit test
        };

        this.properties = properties

        this.undoStack = []
        this.redoStack = []

        this.thinWhiteSpace = String.fromCharCode(8202); // helps in aligning text finely
    }

    setProperties(ctx) {
        for (const key in this.properties) {
            ctx[key] = this.properties[key];
        }
    }

    setText(value) {
        this.text = value;
        let maxLineWidth = this.getWidestLine();
        this.size = {};
        this.size.width = maxLineWidth;
        let lines = this.parseText();
        this.size.height = this.properties.fontSize * lines.length;
        this.onchange()
    }

    setFontSize(value) {
        let fontFamily = this.properties.font.split(" ")[1];
        this.properties.font = `${value}px ${fontFamily}`;
        this.properties.fontSize = value;
        let lines = this.parseText();
        this.size.height = this.properties.fontSize * lines.length;
        this.size.width = this.getWidestLine();
        this.onchange()
    }

    setAlignment(value) {
        this.properties._textAlign = value;
        this.onchange()
    }

    getFontSize() {
        return this.properties.fontSize;
    }

    getAlignment() {
        return this.properties._textAlign;
    }

    getWidestLine() {
        let maxLineWidth = 0;
        let lines = this.parseText();
        for (let line of lines) {
            let lineWidth = this.getTextWidthOnCanvas(line);
            if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
        }
        return maxLineWidth;
    }

    parseText() {
        let lines = this.text.split("\n");
        let longestLineWidth = 0;
        for (let line of lines) {
            if (this.getTextWidthOnCanvas(line) > longestLineWidth) {
                longestLineWidth = this.getTextWidthOnCanvas(line);
            }
        }
        if (this.properties._textAlign) {
            switch (this.properties._textAlign) {
                case "Center":
                    this.properties.xOffsets = {};
                    break;
                case "Left":
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i];
                        if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
                            let offsetSize =
                                longestLineWidth - this.getTextWidthOnCanvas(line);
                            this.properties.xOffsets[i] = -offsetSize / 2;
                        }
                    }
                    break;
                case "Right":
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i];
                        if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
                            let offsetSize =
                                longestLineWidth - this.getTextWidthOnCanvas(line);
                            this.properties.xOffsets[i] = offsetSize / 2;
                        }
                    }
                    break;
            }
        }

        return lines;
    }

    getPaddingSize(line, longestLine) {
        let longWidth = this.getTextWidthOnCanvas(longestLine);
        let shortWidth = this.getTextWidthOnCanvas(line);
        let widthOfSpace = this.getTextWidthOnCanvas(this.thinWhiteSpace);
        let paddingSize = (longWidth - shortWidth) / widthOfSpace;
        return Math.round(paddingSize);
    }

    getIndexOfTextAtPoint(point, line) {
        let index = 0;
        let left = this.center.x - this.getTextWidthOnCanvas(line) / 2;
        let lines = this.parseText();
        let xOffset = 0;
        for (let i = 0; i < lines.length; i++) {
            if (line === lines[i]) {
                xOffset = this.properties.xOffsets[i] || 0;
            }
        }

        while (index < line.length) {
            let offset =
                left +
                this.getTextWidthOnCanvas(line.slice(0, index + 1)) +
                xOffset;
            if (offset >= point.x) {
                if (
                    // point is at left side of character
                    point.x -
                    left -
                    this.getTextWidthOnCanvas(line.slice(0, index)) -
                    xOffset <
                    this.getTextWidthOnCanvas(line[index]) / 2
                ) {
                    index--;
                }
                break;
            }
            index++;
        }

        return index;
    }

    getTextWidthOnCanvas(text) {
        return this.getTextMeasure(text).width;
    }

    getTextMeasure(text) {
        const tmpCanvas = document.createElement("canvas");
        const tmpCtx = tmpCanvas.getContext("2d");
        this.setProperties(tmpCtx);
        return tmpCtx.measureText(text);
    }

    getRowOfLineAndIndexAtPoint(point) {
        let shapeHeight = this.size.height;
        let top = this.center.y - shapeHeight / 2;

        let lines = this.parseText();

        let ratioOnYaxis = Math.abs((point.y - top) / shapeHeight);
        let row = Math.floor(ratioOnYaxis * lines.length);

        let line = lines[row] || "";

        let index = this.getIndexOfTextAtPoint(point, line);
        return [row, index]
    }

    getLinesBoxes() {
        const center = this.center ? this.center : { x: 0, y: 0 };
        let top, fontSize;

        top = center.y - this.size.height / 2;

        fontSize = this.properties.fontSize;

        let lines = this.parseText();
        let boxes = []
        let row = 0;
        for (let line of lines) {
            let xOffset = this.properties.xOffsets[row] || 0;
            const hitTestRectTop = top + row * fontSize
            let width = this.getTextWidthOnCanvas(line)

            let left = center.x + xOffset - width / 2;

            boxes.push({
                left, top: hitTestRectTop, width, height: fontSize
            })

            row++;
        }

        return boxes
    }

    recordTextChange() {
        let undoStack = this.undoStack

        let lastState = undoStack[undoStack.length - 1]
        if (
            lastState &&
            lastState.text === this.text
        ) {
            return
        }

        this.redoStack = []
        undoStack.push(
            {
                text: this.text,
                cursorState: {
                    currentEditor: Cursor.currentEditor,
                    currentIndex: Cursor.currentIndex,
                    currentLineIndex: Cursor.currentLineIndex,
                }
            }
        )
    }

    undo() {
        let undoStack = this.undoStack
        let redoStack = this.redoStack

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

    redo() {
        let undoStack = this.undoStack
        let redoStack = this.redoStack
        if (redoStack?.length > 0) {
            const currentState = redoStack.pop();
            undoStack.push(currentState);
            Cursor.restoreState(currentState)
        }
    }

    draw(ctx) {
        const center = this.center ? this.center : { x: 0, y: 0 };
        let left, top, fontSize;

        top = center.y - this.size.height / 2;

        fontSize = this.properties.fontSize;

        let lines = this.parseText();

        ctx.save();
        this.setProperties(ctx);

        let row = 0;
        for (let line of lines) {
            let xOffset = this.properties.xOffsets[row] || 0;
            left = center.x + xOffset;
            ctx.beginPath();
            if (this.options.fill) {
                ctx.fillStyle = this.options.fillColor;
                ctx.fillText(line, left, top + fontSize / 2 + row * fontSize);
            }
            if (this.options.stroke) {
                ctx.strokeStyle = this.options.strokeColor;
                ctx.lineWidth = this.options.strokeWidth;
                ctx.strokeText(line, left, top + fontSize / 2 + row * fontSize);
            }
            row++;
        }

        ctx.restore();
        TextHighlight.displayHighlight()
    }
}

function makeSpace(length) {
    let str = "";
    for (let i = 0; i < length; i++) {
        str += String.fromCharCode(8202); // append thin space
    }
    return str;
}