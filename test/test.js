const notDrawable = ["Image", "Select"]

function beforeEach() {
    shapes = [];
    gizmos = [];
    currentShape = null;
    clipboard = null;
    clearViewPort(viewport)
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

function getRandomXcanvasPoint() {
    return Math.round(Math.random() * (viewport.canvas.width / 2))
}

function getRandomYcanvasPoint() {
    return Math.round(Math.random() * (viewport.canvas.height / 2))
}

function getShapeAtPoint(x, y) {
    let e = dispatchMouseEventOnCanvas("pointerdown", x, y)
    setCurrentTool("Select")
    const startPosition = new Vector(e.offsetX, e.offsetY);

    const [r, g, b, a] = viewport.hitTestingCtx.getImageData(
        startPosition.x,
        startPosition.y,
        1,
        1
    ).data;

    const id = (r << 16) | (g << 8) | b;
    const shape = shapes.find((s) => s.id == id);
    dispatchMouseEventOnCanvas("pointerup", x, y)
    return shape
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

function TestAllShapesCanBeDrawn() {
    try {
        for (const shapeTool of ShapeTools.tools) {
            if (!notDrawable.includes(shapeTool.name)) {
                beforeEach()
                let startPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                let endPoint = new Vector(getRandomXcanvasPoint(), getRandomYcanvasPoint())
                simulateShapeDraw(shapeTool.name, startPoint.x, startPoint.y, endPoint.x, endPoint.y)
                let mid = Vector.midVector([startPoint, endPoint])
                let shape = getShapeAtPoint(mid.x, mid.y)
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
    element.style.color = "green"
    appendElementToBody(element)
}

function failed(func, msg) {
    let detail = `${func.name}:  ${msg}`
    let element = createDOMElement("div", null, detail)
    element.style.color = "red"
    appendElementToBody(element)
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

TestAllShapesCanBeDrawn()
TestSave();
async function runasyncTestsSynchroniously() {
    await TestExport()
    await TestLoadSavedJSON()
    await TestLoadExportedPNG()
}
runasyncTestsSynchroniously()