const notDrawable = ["Image", "Select", "Text"]

function beforeEach() {
    shapes = [];
    gizmos = [];
    currentShape = null;
    clipboard = null;
    clearViewPort(viewport)
    clearHitTestCanvas(viewport)
}

function clearViewPort(viewport) {
    viewport.ctx.fillStyle = "white";
    viewport.ctx.fillRect(
        -viewport.canvas.width / 2,
        -viewport.canvas.height / 2,
        viewport.canvas.width,
        viewport.canvas.height
    );
}

function clearHitTestCanvas(viewport) {
    viewport.hitTestingCtx.fillStyle = "#fff";
    viewport.hitTestingCtx.fillRect(
        -viewport.canvas.width / 2,
        -viewport.canvas.height / 2,
        viewport.canvas.width,
        viewport.canvas.height
    );
}

function getRandomXcanvasPoint() {
    return Math.round(Math.random() * viewport.canvas.width)
}

function getRandomYcanvasPoint() {
    return Math.round(Math.random() * viewport.canvas.height)
}

function getShapeAtPoint(x, y) {
    setCurrentTool("Select")
    let e = dispatchMouseEventOnCanvas("pointerdown", x, y)

    // deselect already selected shape based on original selectTool.pointerdown event
    // and redraw
    shapes.forEach((s) => s.selected = false)
    gizmos = []
    viewport.drawShapes(shapes)

    const startPosition = new Vector(e.offsetX, e.offsetY);

    const [r, g, b, a] = viewport.hitTestingCtx.getImageData(
        startPosition.x,
        startPosition.y,
        2,
        2,
        { colorSpace: "srgb" }
    ).data;

    const id = (r << 16) | (g << 8) | b;
    const shape = shapes.find((s) => s.id == id) || shapes.find((s) => rgbDiffLessThanThreshHold(s.id, id));
    dispatchMouseEventOnCanvas("pointerup", x, y)
    if (!shape) {
        console.log(id, shapes)
        debugger
        // noticed sometimes ctx.getImageData returns slightly different
        // rgb values different from shape.id by 1 e.g [30, 248, 7] and [29, 248, 6]
        // so i wrote the rgbDiffLessThanThreshHold function.
        // is there a chance this function could solve the occassional anti-aliased
        // hit region click bug? where it does not pick the shape under click?
    }
    return shape
}

// maybe this function could solve the occassional anti-aliased
// hit region click bug? where it does not pick the shape under click?
function rgbDiffLessThanThreshHold(id1, id2, treshHold=10) {
    return Math.abs(getHitRGBSum(id1) - getHitRGBSum(id2)) < treshHold
}

function getHitRGBSum(id) {
    const red = (id & 0xff0000) >> 16;
    const green = (id & 0x00ff00) >> 8;
    const blue = id & 0x0000ff;
    return red + green + blue
}

function setCurrentTool(tool) {
    ShapeTools.selectTool(tool)
}

function dispatchMouseEventOnCanvas(type, clientX, clientY) {
    let event = new MouseEvent(type, {
        clientX,
        clientY,
        bubbles: true,
        cancelable: true
    });
    
    myCanvas.dispatchEvent(event);
    return event
}

function simulateShapeDraw(shapeName, startX, startY, endX, endY) {
    setCurrentTool(shapeName)
    dispatchMouseEventOnCanvas("pointerdown", startX, startY)
    dispatchMouseEventOnCanvas("pointermove", endX, endY)
    dispatchMouseEventOnCanvas("pointerup", endX, endY)
}

function simulateShapeDelete(startX, startY, endX, endY) {
    setCurrentTool("Select")
    dispatchMouseEventOnCanvas("pointerdown", startX, startY)
    dispatchMouseEventOnCanvas("pointerup", endX, endY)
    EditingTools.delete()
}

function simulateShapeCopyAndPaste(startX, startY, endX, endY) {
    setCurrentTool("Select")
    dispatchMouseEventOnCanvas("pointerdown", startX, startY)
    dispatchMouseEventOnCanvas("pointerup", endX, endY)
    EditingTools.duplicate()
}

function TestAllShapesCanBeDrawn() {
    try {
        for (const shapeTool of ShapeTools.tools) {
            beforeEach()
            if (!notDrawable.includes(shapeTool.name)) {
                let startPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                let endPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                simulateShapeDraw(shapeTool.name, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                let mid = Vector.midVector([startPoint, endPoint])
                let shape = getShapeAtPoint(Math.round(mid.x), Math.round(mid.y))
                if (shape?.constructor.name !== shapeTool.name) {
                    failed(TestAllShapesCanBeDrawn, "failed to draw " + shapeTool.name)
                } else {
                    success(TestAllShapesCanBeDrawn, `drew ${shapeTool.name} successfully`)
                }
            }
        }
    } catch (err) {
        failed(TestAllShapesCanBeDrawn, err.message)
    }
}

function TestAllShapesCanBeDeleted() {
    try {
        for (const shapeTool of ShapeTools.tools) {
            beforeEach()
            if (!notDrawable.includes(shapeTool.name)) {
                let startPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                let endPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                simulateShapeDraw(shapeTool.name, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                assert(shapes.length === 1, "shapes length should be 1 after draw")
                let mid = Vector.midVector([startPoint, endPoint])
                simulateShapeDelete(mid.x, mid.y, mid.x, mid.y)
                assert(shapes.length === 0, "shapes length should be 0 after delete")
                success(TestAllShapesCanBeDeleted, `deleted ${shapeTool.name} successfully`)
            }
        }
    } catch (err) {
        failed(TestAllShapesCanBeDeleted, err.message)
    }
}

function TestAllShapesCanBeCopyAndPasted() {
    try {
        for (const shapeTool of ShapeTools.tools) {
            beforeEach()
            if (!notDrawable.includes(shapeTool.name)) {
                let startPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                let endPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                simulateShapeDraw(shapeTool.name, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                assert(shapes.length === 1, "shapes length should be 1 after draw")
                let mid = Vector.midVector([startPoint, endPoint])
                simulateShapeCopyAndPaste(mid.x, mid.y, mid.x, mid.y)
                assert(shapes.length === 2, "shapes length should be x2 after copy and paste")
                success(TestAllShapesCanBeCopyAndPasted, `copy pasted ${shapeTool.name} successfully`)
            }
        }
    } catch (err) {
        failed(TestAllShapesCanBeCopyAndPasted, err.message)
    }
}

function TestSave() {
    beforeEach()
    try {
        assert(shapes.length === 0, "shapes should be empty")
        drawAllShapes()
        assert(shapes.length > 0, "shapes should not be empty after drawAllShapes")
        let savedFile = mimicDocumentToolsDotSave()
        if (!savedFile) {
            failed(TestSave, "failed to save")
        } else {
            success(TestSave, "saved shapes successfully")
        }
    } catch (err) {
        failed(TestSave, err.message)
    }
}

async function TestExport() {
    beforeEach()
    try {
        assert(shapes.length === 0, "shapes should be empty")
        drawAllShapes()
        assert(shapes.length > 0, "shapes should not be empty after drawAllShapes")
        let blob = await mimicDocumentToolsDotExport()
        if (!blob) {
            failed(TestExport, "failed to export canvas to blob")
        } else {
            success(TestExport, "exported canvas to blob successfuly")
        }
    } catch (err) {
        failed(TestExport, err.message)
    }
}

async function TestLoadSavedJSON() {
    beforeEach()
    try {
        assert(shapes.length === 0, "shapes should be empty")
        drawAllShapes()
        assert(shapes.length > 0, "shapes should not be empty after drawAllShapes")
        let blob = mimicDocumentToolsDotSave()
        let shapesLengthBeforeLoad = shapes.length
        assert(shapesLengthBeforeLoad > 0, "shapes should not be empty after drawAllShapes")
        let loadedShapes = await mimicDocumentToolsDotLoad(blob, "json")
        if (shapesLengthBeforeLoad !== loadedShapes.length) {
            failed(TestLoadSavedJSON, "failed: reloaded shapes should have the same length as during export")
        } else {
            success(TestLoadSavedJSON, "saved canvas to JSON and reloaded successfuly")
        }
    } catch (err) {
        failed(TestLoadSavedJSON, err.message)
    }
}

async function TestLoadExportedPNG() {
    beforeEach()
    try {
        assert(shapes.length === 0, "shapes should be empty")
        drawAllShapes()
        assert(shapes.length > 0, "shapes should not be empty after drawAllShapes")
        let blob = await mimicDocumentToolsDotExport()
        let shapesLengthBeforeLoad = shapes.length
        assert(shapesLengthBeforeLoad > 0, "shapes should not be empty after drawAllShapes")
        let loadedShapes = await mimicDocumentToolsDotLoad(blob, "png")
        // loaded png is added to already existing shapes
        if (shapesLengthBeforeLoad + 1 !== loadedShapes.length) {
            failed(TestLoadExportedPNG, "failed: reloaded shapes should have the same length + 1 as during export")
        } else {
            success(TestLoadExportedPNG, "exported canvas and reloaded as png successfuly")
        }
    } catch (err) {
        failed(TestLoadExportedPNG, err.message)
    }
}

async function TestLoadingPreviousDrawings() {
    try {
        for (let drawing of previosDrawings) {
            beforeEach()
            assert(shapes.length === 0, "shapes should be empty")
            let blob = drawing.type === "json"? jsonToBlob(drawing.content) : dataURLToBlob(drawing.content)
            let loadedShapes = await mimicDocumentToolsDotLoad(blob, drawing.type)
            if (loadedShapes.length === 0) {
                failed(TestLoadingPreviousDrawings, "failed: reload drawing: " + drawing.name)
            } else {
                success(TestLoadingPreviousDrawings, "successfully reloaded " + drawing.name)
            }
        }
    } catch (err) {
        failed(TestLoadingPreviousDrawings, err.message)
    }
}

function assert(shouldBeTrue, msg) {
    if (!shouldBeTrue) {
        throw new Error("assert: " + msg)
    }
}

function appendElementToBody(element) {
    document.querySelector("body").appendChild(element)
}

function success(func, msg) {
    let detail = `${func.name}:  ${msg}`
    let element = createDOMElement("div", null, detail)
    element.appendChild(createDOMElement("hr"))
    element.style.color = "green"
    element.style.width = "fit-content"
    appendElementToBody(element)
}

function failed(func, msg) {
    let detail = `${func.name}:  ${msg}`
    let element = createDOMElement("div", null, detail)
    element.appendChild(createDOMElement("hr"))
    element.style.color = "red"
    element.style.width = "fit-content"
    appendElementToBody(element)
}

function displayNotTested() {
 let notTested = ["PropertiesPanel functions", "Gizmo handles and its effects"]
 notTested.forEach(detail => {
    let tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
    let element = document.createElement("div")
    element.innerHTML = `${tab}not tested: ${detail}`
    element.style.color = "blue"
    element.style.width = "fit-content"
    element.appendChild(createDOMElement("hr"))
    appendElementToBody(element)
 })
}

function drawAllShapes() {
    for (const shapeTool of ShapeTools.tools) {
        if (!notDrawable.includes(shapeTool.name)) {
            let startPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
            let endPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
            simulateShapeDraw(shapeTool.name, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
        }
    }
}

function mimicDocumentToolsDotSave() {
    const data = JSON.stringify(
        shapes.map((s) => s.serialize(STAGE_PROPERTIES))
    );

    const file = new Blob([data], { type: "application/json" });
    
    return file
}

function mimicDocumentToolsDotExport() {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = STAGE_PROPERTIES.width;
    tmpCanvas.height = STAGE_PROPERTIES.height;
    const tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.translate(-STAGE_PROPERTIES.left, -STAGE_PROPERTIES.top);
    for (const shape of shapes) {
        const isSelected = shape.selected;
        shape.selected = false;
        shape.draw(tmpCtx);
        shape.selected = isSelected;
    }

    return new Promise((resolve) => {
        tmpCanvas.toBlob((blob) => {
            resolve(blob)
        });
    })
}

function mimicDocumentToolsDotLoad(blob, type) {
    return loadBlob(blob, type)
}

async function loadBlob(blob, type) {
    const reader = new FileReader();

    if (type === "json") {
        reader.readAsText(blob);
    } else if (type === "png") {
        reader.readAsDataURL(blob);
    }

    return new Promise((resolve) => {
        reader.onload = (e) => {
            if (type === "json") {
                const data = JSON.parse(e.target.result);
                shapes = ShapeFactory.loadShapes(data, viewport.stageProperties);
                viewport.drawShapes(shapes);
                HistoryTools.record(shapes);
                resolve(shapes)
            } else if (type === "png") {
                // DocumentTools.loadImage duplicate
                const img = new Image();
                img.onload = () => {
                    const myImage = new MyImage(img, PropertiesPanel.getValues());
                    myImage.setCenter(
                        new Vector(
                            STAGE_PROPERTIES.left + STAGE_PROPERTIES.width / 2,
                            STAGE_PROPERTIES.top + STAGE_PROPERTIES.height / 2
                        )
                    );
                    shapes.push(myImage);
                    viewport.drawShapes(shapes);
                    HistoryTools.record(shapes);
                    resolve(shapes)
                };
                img.src = e.target.result;
            }
        };
    })
}

function dataURLToBlob(dataURL) {
    const [header, base64Data] = dataURL.split(',');
    const mimeString = header.match(/:(.*?);/)[1];
    const byteString = atob(base64Data);
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeString });
}

function jsonToBlob(jsonString) {
    return new Blob([jsonString], { type: 'application/json' })
}

function logFileContent() {
    let attributes = {
        type: "file",
    }
    let element = createInputWithLabel("file", attributes)
    element.onchange =  (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        const extension = file.name.split(".").pop();
    
        reader.onload = (e) => {
            if (extension === "json") {
                console.log(e.target.result);
            } else if (extension === "png") {
                console.log(e.target.result);
            }
        };
    
        if (extension === "json") {
            reader.readAsText(file);
        } else if (extension === "png") {
            reader.readAsDataURL(file);
        }
    }
    element.style.color = "green"
    appendElementToBody(element)
}

TestAllShapesCanBeDrawn()
TestSave();
TestAllShapesCanBeDeleted()
TestAllShapesCanBeCopyAndPasted()
async function runasyncTestsSynchroniously() {
    await TestExport()
    await TestLoadSavedJSON()
    await TestLoadExportedPNG()
    await TestLoadingPreviousDrawings()
    displayNotTested()
}
runasyncTestsSynchroniously()