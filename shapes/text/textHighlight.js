// handle draw highlight
// records indexes
// gives index range in main text

class TextHighlight {

    static currentHighlightDetails = null

    static displayHighlight() {
        let currentHighlightDetails = TextHighlight.currentHighlightDetails
        if (currentHighlightDetails) {
            TextHighlight.highlight(currentHighlightDetails.currentText, currentHighlightDetails.linesHighlightDesc)
        }
    }

    static highlight(textShape, linesHighlightDesc) {
        let top = textShape.center.y - textShape.size.height / 2;
        let highlightRectangles = []
        linesHighlightDesc.forEach(lineHighlightDesc => {
            let { startIndex, endIndex, line, row } = lineHighlightDesc
            let xOffset = textShape.properties.xOffsets[row] || 0;
            let left = textShape.center.x + xOffset
                - textShape.getTextWidthOnCanvas(line) / 2
                + textShape.getTextWidthOnCanvas(line.slice(0, startIndex))

            let right = left + textShape.getTextWidthOnCanvas(line.slice(startIndex, endIndex));
            let fontSize = textShape.properties.fontSize
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
            if (textShape.rotation) {
                center = Vector.rotateAroundCenter(
                    center,
                    textShape.center,
                    textShape.rotation
                )
            }
            let highlightRect = new Rect(center, size, options)
            highlightRect.rotation = textShape.rotation

            highlightRectangles.push(highlightRect)
        });
        viewport.overlayLayer.drawItems(highlightRectangles, false)
    }

    static highlightAll(textShape) {
        let linesHighlightDesc = textShape.parseText().map((line, index) => {
            return {
                startIndex: 0,
                endIndex: line.length,
                line,
                row: index,
            }
        })
        TextHighlight.currentHighlightDetails = {
            linesHighlightDesc,
            currentText: textShape
        }
        TextHighlight.highlight(textShape, linesHighlightDesc)
    }

    static registerHighlight(textShape, startPosition, mousePosition) {
        let adjustedStartPos = viewport.getAdjustedPosition(startPosition)
        let adjustedMousePos = viewport.getAdjustedPosition(mousePosition)
        if (textShape.rotation) {
            adjustedStartPos = Vector.rotateAroundCenter(
                adjustedStartPos,
                textShape.center,
                -textShape.rotation
            );
            adjustedMousePos = Vector.rotateAroundCenter(
                adjustedMousePos,
                textShape.center,
                -textShape.rotation
            );
        }

        let [startRow, startIndex] = textShape.getRowOfLineAndIndexAtPoint(adjustedStartPos)
        let [mouseRow, mouseIndex] = textShape.getRowOfLineAndIndexAtPoint(adjustedMousePos)

        let lines = textShape.parseText()

        if (!lines[startRow] || !lines[mouseRow]) return

        if (lines[startRow].length - 1 > startIndex) {
            startIndex++
        }

        if (lines[mouseRow].length - 1 > mouseIndex) {
            mouseIndex++
        }

        if (mouseRow < startRow || (mouseRow == startRow && mouseIndex < startIndex)) {
            // simplify logic by always having startPoint above
            // and to the left
            let tempRow = mouseRow
            let tempIndex = mouseIndex
            mouseRow = startRow
            mouseIndex = startIndex
            startRow = tempRow
            startIndex = tempIndex
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
            currentText: textShape
        }
    }

    static getHighlightedIndeces() {
        let startIndex = -1
        let endIndex = -1
        let currentHighlightDetails = TextHighlight.currentHighlightDetails
        if (!currentHighlightDetails) {
            return [startIndex, endIndex]
        }
        let linesHighlightDesc = currentHighlightDetails.linesHighlightDesc
        let startRow = linesHighlightDesc[0].row
        let endRow = linesHighlightDesc[linesHighlightDesc.length - 1].row
        let lines = currentHighlightDetails.currentText.parseText()
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

    static reset() {
        TextHighlight.currentHighlightDetails = null
    }


}