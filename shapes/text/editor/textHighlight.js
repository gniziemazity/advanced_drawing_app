class TextHighlight {

    static currentHighlightDetails = null
    static indexOfLineHighlightDescToMoveWithKey = null
    static canvas = null

    static displayHighlight() {
        let currentHighlightDetails = TextHighlight.currentHighlightDetails
        if (currentHighlightDetails) {
            TextHighlight._highlight(currentHighlightDetails.currentEditor, currentHighlightDetails.linesHighlightDesc)
        }
    }

    static _highlight(editor, linesHighlightDesc) {
        Cursor.showCursor = false
        Cursor.inPreEditMode = true
        let top = editor.center.y - editor.size.height / 2;
        let highlightRectangles = []
        linesHighlightDesc.forEach(lineHighlightDesc => {
            let { startIndex, endIndex, line, row } = lineHighlightDesc
            let xOffset = editor.properties.xOffsets[row] || 0;
            let left = editor.center.x + xOffset
                - editor.getTextWidthOnCanvas(line) / 2
                + editor.getTextWidthOnCanvas(line.slice(0, startIndex))

            let right = left + editor.getTextWidthOnCanvas(line.slice(startIndex, endIndex));
            let fontSize = editor.properties.fontSize
            let height = fontSize
            let width = right - left
            let center = Vector.zero()

            center.x = left + width / 2
            center.y = top + fontSize / 2 + row * fontSize

            let size = { width, height }
            let options = {
                fillColor: "rgba(173, 216, 230, 0.5)",
                strokeColor: "none",
                fill: true,
                lineCap: "round",
            };
            if (editor.rotation) {
                center = Vector.rotateAroundCenter(
                    center,
                    editor.center,
                    editor.rotation
                )
            }

            let highlightRect = { center, size, options }
            highlightRect.rotation = editor.rotation

            highlightRectangles.push(highlightRect)
        });
        TextHighlight.drawHighlight(highlightRectangles)
    }

    static drawHighlight(highlightRectangles = []) {
        if (!TextHighlight.canvas) return
        let ctx = TextHighlight.canvas.getContext("2d")
        Cursor.clearCanvas()
        highlightRectangles.forEach(rectangleData => {
            const center = rectangleData.center

            const left = center.x - rectangleData.size.width / 2;
            const top = center.y - rectangleData.size.height / 2;

            ctx.beginPath();
            rotateCanvas(ctx, center, rectangleData.rotation);
            ctx.rect(left, top, rectangleData.size.width, rectangleData.size.height);
            rotateCanvas(ctx, center, -rectangleData.rotation);

            ctx.strokeStyle = rectangleData.options.strokeColor;
            ctx.fillStyle = rectangleData.options.fillColor;
            ctx.lineWidth = rectangleData.options.strokeWidth;
            ctx.lineCap = rectangleData.options.lineCap;
            ctx.lineJoin = rectangleData.options.lineJoin;
            if (rectangleData.options.fill) {
                ctx.fill();
            }
            if (rectangleData.options.stroke) {
                ctx.stroke();
            }
        })
    }

    static highlightAll(editor, canvas) {
        TextHighlight.canvas = canvas
        let linesHighlightDesc = editor.parseText().map((line, index) => {
            return {
                startIndex: 0,
                endIndex: line.length,
                line,
                row: index,
            }
        })
        TextHighlight.currentHighlightDetails = {
            linesHighlightDesc,
            currentEditor: editor
        }
        TextHighlight._highlight(editor, linesHighlightDesc)
    }

    static registerHighlight(editor, startPosition, mousePosition, canvas) {
        TextHighlight.canvas = canvas
        if (editor.rotation) {
            startPosition = Vector.rotateAroundCenter(
                startPosition,
                editor.center,
                -editor.rotation
            );
            mousePosition = Vector.rotateAroundCenter(
                mousePosition,
                editor.center,
                -editor.rotation
            );
        }

        let [startRow, startIndex] = editor.getRowOfLineAndIndexAtPoint(startPosition)
        let [mouseRow, mouseIndex] = editor.getRowOfLineAndIndexAtPoint(mousePosition)

        let lines = editor.parseText()

        if (!lines[startRow] || !lines[mouseRow]) return

        if (lines[startRow].length - 1 > startIndex) {
            startIndex++
        }

        if (lines[mouseRow].length - 1 > mouseIndex) {
            mouseIndex++
        }

        TextHighlight.indexOfLineHighlightDescToMoveWithKey = "end"

        if (mouseRow < startRow || (mouseRow == startRow && mouseIndex < startIndex)) {
            // simplify logic by always having startPoint above
            // and to the left
            let tempRow = mouseRow
            let tempIndex = mouseIndex
            mouseRow = startRow
            mouseIndex = startIndex
            startRow = tempRow
            startIndex = tempIndex
            TextHighlight.indexOfLineHighlightDescToMoveWithKey = "start"
        }

        let linesHighlightDesc = []
        switch (Math.sign(startRow - mouseRow)) {
            case 0:
                // same line
                linesHighlightDesc.push({
                    startIndex: Math.max(startIndex, 0),
                    endIndex: Math.max(mouseIndex, 0),
                    line: lines[startRow],
                    row: startRow,
                })
                break
            case -1:
                // start row is above
                for (let row = startRow; row <= mouseRow; row++) {
                    let localStartIndex = 0
                    let localEndIndex = lines[row].length
                    if (row === startRow) {
                        localStartIndex = startIndex
                    }
                    if (row === mouseRow) {
                        localEndIndex = mouseIndex
                    }
                    linesHighlightDesc.push({
                        startIndex: Math.max(localStartIndex, 0),
                        endIndex: Math.max(localEndIndex, 0),
                        line: lines[row],
                        row: row,
                    })
                }
                break
            case 1:
                // start row is below
                throw Error("TextHighlight.registerHighlight: Control flow should not reach here")
        }
        TextHighlight.currentHighlightDetails = {
            linesHighlightDesc,
            currentEditor: editor
        }
        TextHighlight.displayHighlight()
    }

    static registerHighlightFromRowAndIndex(editor, row, startIndex, endIndex, canvas) {
        TextHighlight.canvas = canvas
        let lines = editor.parseText()
        let linesHighlightDesc = [{
            startIndex,
            endIndex,
            line: lines[row],
            row: row,
        }]
        TextHighlight.currentHighlightDetails = {
            linesHighlightDesc,
            currentEditor: editor
        }
        TextHighlight.displayHighlight()
    }

    static getHighlightedIndices() {
        let startIndex = -1
        let endIndex = -1
        let currentHighlightDetails = TextHighlight.currentHighlightDetails
        if (!currentHighlightDetails) {
            return [startIndex, endIndex]
        }
        let linesHighlightDesc = currentHighlightDetails.linesHighlightDesc
        let startRow = linesHighlightDesc[0].row
        let endRow = linesHighlightDesc[linesHighlightDesc.length - 1].row
        let lines = currentHighlightDetails.currentEditor.parseText()
        startIndex = 0
        endIndex = 0
        for (let row = 0; row < lines.length; row++) {
            if (row === startRow) {
                startIndex += linesHighlightDesc[0].startIndex + (row > 0 ? 1 : 0)
                break
            }
            startIndex += lines[row].length + (row > 0 ? 1 : 0)
        }

        for (let row = 0; row < lines.length; row++) {
            if (row === endRow) {
                endIndex += linesHighlightDesc[linesHighlightDesc.length - 1].endIndex - 1 + (row > 0 ? 1 : 0)
                break
            }
            endIndex += lines[row].length + (row > 0 ? 1 : 0)
        }
        return [startIndex, endIndex]
    }

    static moveHighlight(key) {
        let indexOfHighlightDesc = TextHighlight.indexOfLineHighlightDescToMoveWithKey
            == "start" ? 0 : TextHighlight.currentHighlightDetails.linesHighlightDesc.length - 1
        let linesHighlightDesc = TextHighlight.currentHighlightDetails.linesHighlightDesc
        let highlightDesc = linesHighlightDesc[indexOfHighlightDesc]
        if (!highlightDesc) return
        let row = highlightDesc.row
        let lines = TextHighlight.currentHighlightDetails.currentEditor.parseText()
        let line = lines[row]

        let modifyStartIndex = TextHighlight.indexOfLineHighlightDescToMoveWithKey
            == "start" ? true : false

        switch (key.toLowerCase()) {
            case "arrowright":
                if (modifyStartIndex) {
                    if (
                        highlightDesc.startIndex < line.length &&
                        highlightDesc.startIndex < highlightDesc.endIndex
                    ) {
                        highlightDesc.startIndex++
                    } else if (
                        highlightDesc.startIndex === highlightDesc.endIndex &&
                        linesHighlightDesc.length === 1
                    ) {
                        TextHighlight.indexOfLineHighlightDescToMoveWithKey = "end"
                    } else {
                        return TextHighlight.moveHighlight("arrowdown")
                    }
                } else {
                    if (highlightDesc.endIndex < line.length) {
                        highlightDesc.endIndex++
                    } else {
                        return TextHighlight.moveHighlight("arrowdown")
                    }
                }
                break
            case "arrowleft":
                if (modifyStartIndex) {
                    if (
                        highlightDesc.startIndex > 0
                    ) {
                        highlightDesc.startIndex--
                    } else {
                        return TextHighlight.moveHighlight("arrowup")
                    }
                } else {
                    if (
                        highlightDesc.endIndex > 0 &&
                        highlightDesc.endIndex > highlightDesc.startIndex
                    ) {
                        highlightDesc.endIndex--
                    } else if (
                        highlightDesc.endIndex === highlightDesc.startIndex &&
                        linesHighlightDesc.length === 1
                    ) {
                        TextHighlight.indexOfLineHighlightDescToMoveWithKey = "start"
                    } else {
                        return TextHighlight.moveHighlight("arrowup")
                    }
                }
                break
            case "arrowdown":
                if (modifyStartIndex) {
                    if (linesHighlightDesc.length > 1) {
                        linesHighlightDesc.splice(0, 1)
                    } else if (row < lines.length - 1) {
                        highlightDesc.endIndex = lines[row].length
                        row++
                        linesHighlightDesc.push({
                            startIndex: 0,
                            endIndex: Math.min(lines[row].length, 1),
                            line: lines[row],
                            row: row,
                        })
                        TextHighlight.indexOfLineHighlightDescToMoveWithKey = "end"
                    }
                } else {
                    if (row < lines.length - 1) {
                        highlightDesc.endIndex = lines[row].length
                        row++
                        linesHighlightDesc.push({
                            startIndex: 0,
                            endIndex: Math.min(lines[row].length, 1),
                            line: lines[row],
                            row: row,
                        })
                    }
                }
                break
            case "arrowup":
                if (modifyStartIndex) {
                    if (row > 0) {
                        highlightDesc.startIndex = 0
                        row--
                        linesHighlightDesc.unshift({
                            startIndex: Math.max(lines[row].length - 1, 0),
                            endIndex: lines[row].length,
                            line: lines[row],
                            row: row,
                        })
                    }
                } else {
                    if (linesHighlightDesc.length > 1) {
                        linesHighlightDesc.splice(linesHighlightDesc.length - 1)
                    } else if (row > 0) {
                        highlightDesc.startIndex = 0
                        row--
                        linesHighlightDesc.unshift({
                            startIndex: Math.max(lines[row].length - 1, 0),
                            endIndex: lines[row].length,
                            line: lines[row],
                            row: row,
                        })
                        TextHighlight.indexOfLineHighlightDescToMoveWithKey = "start"
                    }
                }
                break
            default:
                throw new Error(`TextHighlight.moveHighlight: ${key} not a valid key to move highlight`)
        }
        TextHighlight.displayHighlight()
    }

    static reset() {
        TextHighlight.currentHighlightDetails = null
        Cursor.inPreEditMode = false
        TextHighlight.indexOfLineHighlightDescToMoveWithKey = null
        TextHighlight.drawHighlight([])
    }


}