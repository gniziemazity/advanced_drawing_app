class PropertiesPanel {
	constructor(holderDiv) {
		this.holderDiv = holderDiv;

		const panelHeaderDiv = createDOMElement("div", {
			class: "panel-head",
		});
		panelHeaderDiv.innerText = "Properties";

		const panelBodyDiv = createDOMElement("div", {
			class: "panel-body",
			["data-title"]: "Properties",
		});

		this.holderDiv.appendChild(panelHeaderDiv);
		this.holderDiv.appendChild(panelBodyDiv);

		const colorSection = createDOMElement("div", {
			class: "panel-section three_col_grid",
			["data-title"]: "Color",
		});
		const textSection = createDOMElement("div", {
			class: "panel-section",
			["data-title"]: "Text",
		});
		const transformSection = createDOMElement("div", {
			class: "panel-section",
			["data-title"]: "Transform",
		});
		const arrangeSection = createDOMElement("div", {
			class: "panel-section four_col_grid",
			["data-title"]: "Arrange",
		});
		this.layerSection = createDOMElement("div", {
			class: "panel-section two_col_grid",
			["data-title"]: "Layers",
		});

		panelBodyDiv.appendChild(transformSection);
		panelBodyDiv.appendChild(colorSection);
		panelBodyDiv.appendChild(textSection);
		panelBodyDiv.appendChild(arrangeSection);
		panelBodyDiv.appendChild(this.layerSection);

		transformSection.appendChild(
			createInputWithLabel("X", {
				type: "number",
				onchange: "PropertiesPanel.changeX(this.value)",
				oninput: "PropertiesPanel.changeX(this.value, false)",
				id: "xInput",
			})
		);
		transformSection.appendChild(
			createInputWithLabel("Y", {
				type: "number",
				onchange: "PropertiesPanel.changeY(this.value)",
				oninput: "PropertiesPanel.changeY(this.value, false)",
				id: "yInput",
			})
		);
		transformSection.appendChild(
			createInputWithLabel("Width", {
				type: "number",
				onchange: "PropertiesPanel.changeWidth(this.value)",
				oninput: "PropertiesPanel.changeWidth(this.value, false)",
				id: "widthInput",
			})
		);
		transformSection.appendChild(
			createInputWithLabel("Height", {
				type: "number",
				onchange: "PropertiesPanel.changeHeight(this.value)",
				oninput: "PropertiesPanel.changeHeight(this.value, false)",
				id: "heightInput",
			})
		);
		transformSection.appendChild(
			createInputWithLabel("Rotation", {
				type: "number",
				onchange: "PropertiesPanel.setRotation(this.value)",
				oninput: "PropertiesPanel.setRotation(this.value, false)",
				id: "rotationInput",
			})
		);
		transformSection.appendChild(
			createInputWithLabel("Constrain", {
				type: "checkbox",
				id: "constrainDimensions",
			})
		);

		arrangeSection.appendChild(
			createDOMElement(
				"button",
				{
					id: "sendBackBtn",
					onclick: "TransformTools.sendToBack()",
					title: "Send to Back",
				},
				"Back"
			)
		);
		arrangeSection.appendChild(
			createDOMElement(
				"button",
				{
					id: "bringFrontBtn",
					onclick: "TransformTools.bringToFront()",
					title: "Bring to Front",
				},
				"Front"
			)
		);
		arrangeSection.appendChild(
			createDOMElement(
				"button",
				{
					id: "sendBackwardBtn",
					onclick: "TransformTools.sendBackward()",
					title: "Send Backward",
				},
				"Bwd"
			)
		);
		arrangeSection.appendChild(
			createDOMElement(
				"button",
				{
					id: "bringForwardBtn",
					onclick: "TransformTools.bringForward()",
					title: "Bring Forward",
				},
				"Fwd"
			)
		);

		this.populateLayers(1);

		colorSection.appendChild(
			createDOMElement("input", {
				id: "fillColor",
				onchange: "PropertiesPanel.changeFillColor(this.value)",
				oninput: "PropertiesPanel.changeFillColor(this.value, false)",
				title: "Fill Color",
				type: "color",
			})
		);
		colorSection.appendChild(
			createDOMElement("input", {
				id: "fill",
				checked: true,
				onchange: "PropertiesPanel.changeFill(this.checked)",
				title: "Fill",
				type: "checkbox",
			})
		);
		colorSection.appendChild(
			createDOMElement(
				"button",
				{ id: "resetBtn", onclick: "PropertiesPanel.resetColors()" },
				"Reset"
			)
		);
		colorSection.appendChild(
			createDOMElement("input", {
				id: "strokeColor",
				onchange: "PropertiesPanel.changeStrokeColor(this.value)",
				oninput: "PropertiesPanel.changeStrokeColor(this.value, false)",
				title: "Stroke Color",
				type: "color",
			})
		);
		colorSection.appendChild(
			createDOMElement("input", {
				id: "stroke",
				checked: true,
				onchange: "PropertiesPanel.changeStroke(this.checked)",
				title: "Stroke",
				type: "checkbox",
			})
		);
		colorSection.appendChild(
			createDOMElement(
				"button",
				{ id: "swapBtn", onclick: "PropertiesPanel.swapColors()" },
				"Swap"
			)
		);
		colorSection.appendChild(
			createDOMElement("input", {
				id: "strokeWidth",
				max: "30",
				min: "1",
				onchange: "PropertiesPanel.changeStrokeWidth(this.value)",
				oninput: "PropertiesPanel.changeStrokeWidth(this.value, false)",
				title: "Stroke Width",
				type: "range",
				value: "5",
			})
		);
		textSection.appendChild(
			createDOMElement("textarea", {
				id: "text",
				oninput: "PropertiesPanel.changeText(this.value)",
				title: "Text",
				value: "",
				placeholder: "Enter Text",
				style: "width: 100%;"
			})
		);
		textSection.appendChild(
			createInputWithLabel("font-size", {
				type: "number",
				oninput: "PropertiesPanel.changeFontSize(this.value, false)",
				id: "fontSize",
			})
		);

		for (let alignment of ["Left", "Center", "Right"]) {
			textSection.appendChild(
				createInputWithLabel(alignment, {
					type: "radio",
					onchange: `PropertiesPanel.changeTextAlignment("${alignment}", false)`,
					id: "textAlign"+alignment,
					name: "textAlign",
				})
			);
		}

		PropertiesPanel.reset();
		PropertiesPanel.resetColors();

		viewport.addEventListener(
			"positionChanged",
			PropertiesPanel.updateDisplay
		);
		viewport.addEventListener("sizeChanged", PropertiesPanel.updateDisplay);
		viewport.addEventListener(
			"rotationChanged",
			PropertiesPanel.updateDisplay
		);
		viewport.addEventListener("shapeSelected", PropertiesPanel.updateDisplay);
		viewport.addEventListener(
			"shapeUnselected",
			PropertiesPanel.updateDisplay
		);
		viewport.addEventListener("textChanged", PropertiesPanel.updateDisplay)
		viewport.addEventListener("history", PropertiesPanel.updateDisplay);
		viewport.addEventListener("layersChanged", (e) => {
			this.populateLayers(e.detail.count);
		});
	}

	populateLayers(count) {
		this.layerSection.innerHTML = "";
		this.layerSection.appendChild(
			createDOMElement(
				"button",
				{
					id: "addLayerBtn",
					onclick: "LayerTools.addLayer()",
					title: "Add Layer",
				},
				"➕"
			)
		);
		this.layerSection.appendChild(createDOMElement("div", {}, ""));

		for (let i = 1; i <= count; i++) {
         const props = {
            type: "radio",
            id: "layer_" + i + "_radio",
            name: "layerRadio",
            onchange: `LayerTools.selectLayer(${i-1})`
         }
         if(viewport.selectedLayer == viewport.layers[i-1]){
            props.checked=true;
         }
			this.layerSection.appendChild(
				createInputWithLabel("layer " + i, props)
			);

			this.layerSection.appendChild(
				createDOMElement(
					"button",
					{
						id: "layer_" + i + "_removeBtn",
						onclick: "LayerTools.removeLayer(" + (i - 1) + ")",
						title: "Remove Layer",
					},
					"🗑️"
				)
			);
		}
	}

	static changeX(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) =>
				s.setCenter(
					new Vector(Number(value) + STAGE_PROPERTIES.left, s.center.y),
					save
				)
			);
	}

	static changeY(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) =>
				s.setCenter(
					new Vector(s.center.x, Number(value) + STAGE_PROPERTIES.top),
					save
				)
			);
	}

	static changeWidth(value, save = true) {
		let newWidth = value;
		let newHeight = 0;

		viewport.getSelectedShapes().forEach((s) => {
			const currentWidth = s.size.width;
			if (value == 0) {
				newWidth = Math.sign(currentWidth) * -1
			}
			const currentHeight = s.size.height;
			newHeight = currentHeight;
			if (constrainDimensions.checked) {
				const aspectRatio = currentWidth / currentHeight;
				const constrainedHeight = newWidth / aspectRatio;
				newHeight = constrainedHeight;
			}
			s.setSize(newWidth, newHeight, save);
		});

		setValue(widthInput, Math.round(newWidth));
		if (getValue(heightInput) != "") {
			setValue(heightInput, Math.round(newHeight));
		}
	}

	static changeHeight(value, save = true) {
		let newHeight = value;
		let newWidth = 0;

		viewport.getSelectedShapes().forEach((s) => {
			const currentWidth = s.size.width;
			const currentHeight = s.size.height;
			if (value == 0) {
				newHeight = Math.sign(currentHeight) * -1
			}
			newWidth = currentWidth;
			if (constrainDimensions.checked) {
				const aspectRatio = currentWidth / currentHeight;
				const constrainedWidth = newHeight * aspectRatio;
				newWidth = constrainedWidth;
			}
			s.setSize(newWidth, newHeight, save);
		});

		setValue(heightInput, Math.round(newHeight));
		if (getValue(widthInput) != "") {
			setValue(widthInput, Math.round(newWidth));
		}
	}

	static setRotation(degrees, save = true) {
		const radians = (degrees * Math.PI) / 180;
		viewport.getSelectedShapes().forEach((s) => {
			s.setRotation(radians, save);
		});
		setValue(rotationInput, degrees);
	}

	static changeFillColor(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ fillColor: value }, save));
	}

	static changeFill(value) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ fill: value }));
	}

	static changeStrokeColor(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ strokeColor: value }, save));
	}

	static changeStroke(value) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ stroke: value }));
	}

	static changeStrokeWidth(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ strokeWidth: Number(value) }, save));
	}

	static changeText(value, save = true) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.text !== undefined)
			.forEach((s) => s.setText(value, save));
	}

	static changeFontSize(value, save = true) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.text !== undefined)
			.forEach((s) => s.setFontSize(value, save));
	}

	static changeTextAlignment(value, save = true) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.text !== undefined)
			.forEach((s) => s.setAligngment(value, save));
	}

	static resetColors() {
		fillColor.value = "#ffffff";
		strokeColor.value = "#000000";
		PropertiesPanel.changeFillColor(fillColor.value);
		PropertiesPanel.changeStrokeColor(strokeColor.value);
	}

	static swapColors() {
		const fillStyle = fillColor.value;
		const strokeStyle = strokeColor.value;

		fillColor.value = strokeStyle;
		strokeColor.value = fillStyle;

		PropertiesPanel.changeFillColor(fillColor.value);
		PropertiesPanel.changeStrokeColor(strokeColor.value);
	}

	static reset() {
		xInput.value = "";
		rotationInput.value = "";
		yInput.value = "";
		widthInput.value = "";
		heightInput.value = "";
		text.value = "";
		xInput.placeholder = "";
		yInput.placeholder = "";
		widthInput.placeholder = "";
		heightInput.placeholder = "";
		rotationInput.placeholder = "";
		document.getElementById(`textAlignCenter`).checked = true
	}

	static getValues() {
		return {
			fillColor: fillColor.value,
			strokeColor: strokeColor.value,
			fill: fill.checked,
			stroke: stroke.checked,
			strokeWidth: Number(strokeWidth.value),
			lineCap: "round",
			lineJoin: "round",
		};
	}

	// To add a PanelProperty field that will update when updateDisplay is
	// called. we have to do 3 things:
	// - update the variable panelFields with the new panel property field
	// - in PropertiesPanel.getNewProperties function: write a simple get<FieldValue> function 
	// 	 that takes in a shape argument
	// - in PropertiesPanel.getNewProperties function: update the variable newProperties
	//   with the field to update and an extract function that uses your get<FieldValue>
	static updateDisplay() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length === 0) {
			PropertiesPanel.reset();
			return;
		}

		const panelFields = {
			xInput, yInput, widthInput, heightInput, fillColor, fill, 
			strokeColor, stroke, strokeWidth, text, rotationInput, 
			fontSize, textAlignLeft, textAlignCenter, textAlignRight
		}

		const placeholderText = "Multiple Values";

		let newProperties = PropertiesPanel.getNewProperties(selectedShapes)

		for (let key in newProperties) {
			let newProperty = newProperties[key]
			if (Number(newProperty.value)) {
				newProperty.value = Math.round(newProperty.value)
			}

			switch (key) {
				case "fill", "stroke":
					panelFields[key].checked = newProperty.value || false
					break
				case "textAlingnment":
					document.getElementById(`textAlignCenter`).checked = true
					let value = newProperty.value
					if (value) {
						document.getElementById(`textAlign${value}`).checked = true
					} 
					break
				default:
					panelFields[key].value = newProperty.value === null ? "" : newProperty.value
					panelFields[key].placeholder = key === "text" ? "Enter Text" : newProperty.value || placeholderText
			}
		}
	}

	static getNewProperties(selectedShapes) {
		let getX = (shape) => shape.center.x - STAGE_PROPERTIES.left
		let getY = (shape) => shape.center.y - STAGE_PROPERTIES.top
		let getWidth = (shape) => shape.size.width
		let getHeight = (shape) => shape.size.height
		let getFillColor = (shape) => shape.options.fillColor
		let getFill = (shape) => shape.options.fill
		let getStrokeColor = (shape) => shape.options.strokeColor
		let getStroke = (shape) => shape.options.stroke
		let getStrokeWidth = (shape) => shape.options.strokeWidth
		let getText = (shape) => shape.text || null
		let getRotation = (shape) => shape.rotation
		let getFontSize = (shape) => shape.text !== undefined ? shape.getFontSize() : ""
		let getTextAlignMent = (shape) => shape.text !== undefined ? shape.getAlignment() : ""

		let newProperties = null;
		for (const shape of selectedShapes) {
			if (newProperties === null) {
				newProperties = {
					xInput: { value: getX(shape), extractor: getX },
					yInput: { value: getY(shape), extractor: getY },
					widthInput: { value: getWidth(shape), extractor: getWidth },
					heightInput: { value: getHeight(shape), extractor: getHeight },
					fillColor: { value: getFillColor(shape), extractor: getFillColor },
					fill: { value: getFill(shape), extractor: getFill },
					strokeColor: { value: getStrokeColor(shape), extractor: getStrokeColor },
					stroke: { value: getStroke(shape), extractor: getStroke },
					strokeWidth: { value: getStrokeWidth(shape), extractor: getStrokeWidth },
					text: { value: getText(shape), extractor: getText },
					rotationInput: { value: getRotation(shape), extractor: getRotation },
					fontSize: { value: getFontSize(shape), extractor: getFontSize },
					textAlingnment: { value: getTextAlignMent(shape), extractor: getTextAlignMent },
				};
			} else {
				for (let key in newProperties) {
					let newPanelProperty = newProperties[key]
					if (newPanelProperty.value !== newPanelProperty.extractor(shape)) {
						newPanelProperty.value = null
					}
				}		
			}
		}
		return newProperties
	}
}
