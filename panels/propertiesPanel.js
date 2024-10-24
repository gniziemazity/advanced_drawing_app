class PropertiesPanel {
	constructor(holderDiv) {
		PropertiesPanel.holderDiv = holderDiv;

		const panelBodyDiv = createDOMElement("div", {
			class: "panel-body",
		});

		const transformHeader = createDOMElement("div", {
			class: "panel-head",
		});
		transformHeader.innerText = "Properties";

		const colorHeader = createDOMElement("div", {
			class: "panel-head",
		});
		colorHeader.innerText = "Color";
		const colorSection = createDOMElement("div", {
			class: "panel-section three_col_grid",
		});

		const filtersHeader = createDOMElement("div", {
			class: "panel-head",
			style: "display:none;",
		});
		filtersHeader.innerText = "Filters";

		const filtersSection = createDOMElement("div", {
			class: "panel-section three_col_grid",
			style: "display:none;",
		});
		PropertiesPanel.filtersSection = filtersSection;
		PropertiesPanel.filtersHeader = filtersHeader;
		PropertiesPanel.filtersHeader.appendChild(
			createButtonWithIcon({
				id: "addFilterBtn",
				onclick: "PropertiesPanel.addChromaFilter()",
				title: "Add Chroma Filter",
				iconName: "plus",
			})
		);

		const textHeader = createDOMElement("div", {
			class: "panel-head",
			style: "display:none;",
		});
		textHeader.innerText = "Text";

		const textSection = createDOMElement("div", {
			class: "panel-section",
			style: "display:none;",
		});
		PropertiesPanel.textSection = textSection;
		PropertiesPanel.textHeader = textHeader;
		const transformSection = createDOMElement("div", {
			class: "panel-section",
		});

		const arrangeHeader = createDOMElement("div", {
			class: "panel-head",
		});
		arrangeHeader.innerText = "Arrange";
		const arrangeSection = createDOMElement("div", {
			class: "panel-section four_col_grid",
		});

		const layersHeader = createDOMElement("div", {
			class: "panel-head",
		});
		layersHeader.innerText = "Layers";
		PropertiesPanel.layersHeader = layersHeader;
		PropertiesPanel.layersHeader.appendChild(
			createButtonWithIcon({
				id: "addLayerBtn",
				onclick: "LayerTools.addLayer()",
				title: "Add Layer",
				iconName: "plus",
			})
		);
		PropertiesPanel.layersSection = createDOMElement("div", {
			class: "panel-section two_col_grid",
			style: "max-height:110px",
		});

		holderDiv.appendChild(panelBodyDiv);
		panelBodyDiv.appendChild(transformHeader);
		panelBodyDiv.appendChild(transformSection);
		panelBodyDiv.appendChild(colorHeader);
		panelBodyDiv.appendChild(colorSection);
		panelBodyDiv.appendChild(textHeader);
		panelBodyDiv.appendChild(textSection);
		panelBodyDiv.appendChild(filtersHeader);
		panelBodyDiv.appendChild(filtersSection);
		panelBodyDiv.appendChild(arrangeHeader);
		panelBodyDiv.appendChild(arrangeSection);
		panelBodyDiv.appendChild(layersHeader);
		panelBodyDiv.appendChild(PropertiesPanel.layersSection);

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
			createButtonWithIcon({
				id: "sendBackBtn",
				onclick: "TransformTools.sendToBack()",
				title: "Send to Back",
				iconName: "back",
			})
		);
		arrangeSection.appendChild(
			createButtonWithIcon({
				id: "sendBackwardBtn",
				onclick: "TransformTools.sendBackward()",
				title: "Send Backward",
				iconName: "bwd",
			})
		);
		arrangeSection.appendChild(
			createButtonWithIcon({
				id: "bringForwardBtn",
				onclick: "TransformTools.bringForward()",
				title: "Bring Forward",
				iconName: "fwd",
			})
		);
		arrangeSection.appendChild(
			createButtonWithIcon({
				id: "bringFrontBtn",
				onclick: "TransformTools.bringToFront()",
				title: "Bring to Front",
				iconName: "front",
			})
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
			createButtonWithIcon({
				id: "resetBtn",
				title: "Reset",
				class: "tool-button",
				onclick: "PropertiesPanel.resetColors()",
				iconName: "reset_colors",
			})
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
			createButtonWithIcon({
				id: "swapBtn",
				title: "Swap",
				class: "tool-button",
				onclick: "PropertiesPanel.swapColors()",
				iconName: "swap_colors",
			})
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
			createInputWithLabel("font-size", {
				type: "number",
				oninput: "PropertiesPanel.changeFontSize(this.value, false)",
				id: "fontSize",
			})
		);

		const alignmentDiv = createDOMElement("div", {
			class: "panel-section three_col_grid",
			style: "padding-top:0;",
		});
		textSection.appendChild(alignmentDiv);
		for (let alignment of ["Left", "Center", "Right"]) {
			alignmentDiv.appendChild(
				createRadioWithImage("text_" + alignment.toLowerCase(), {
					type: "radio",
					id: "textAlign" + alignment,
					name: "textAlign",
					class: "radio",
					title: "align " + alignment.toLowerCase(),
					onchange: `PropertiesPanel.changeTextAlignment('${alignment}', false)`
				})
			);
		}

		PropertiesPanel.reset();
		PropertiesPanel.resetColors();

		PropertiesPanel.changeTextAlignment("Center", false);
		LayerTools.selectLayer(0);

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
		viewport.addEventListener("textChanged", PropertiesPanel.updateDisplay);
		viewport.addEventListener("history", PropertiesPanel.updateDisplay);
		viewport.addEventListener("layersChanged", (e) => {
			this.populateLayers(e.detail.count);
		});
	}

	static showFilters(filters) {
		PropertiesPanel.filtersSection.innerHTML = "";

		for (let i = 0; i < filters.length; i++) {
			const filter = filters[i];
			PropertiesPanel.filtersSection.appendChild(
				createDOMElement("input", {
					id: "colorKey_" + i,
					onchange:
						"PropertiesPanel.changeChromaKey(" + i + ",this.value)",
					title: "Color Key",
					value: filter.getHexColor(),
					type: "color",
				})
			);
			PropertiesPanel.filtersSection.appendChild(
				createDOMElement("input", {
					id: "threshold_" + i,
					max: "255",
					min: "0",
					onchange:
						"PropertiesPanel.changeChromaThreshold(" + i + ",this.value)",
					title: "Threshold",
					type: "range",
					value: filter.threshold,
					style: "width: var(--input-medium-width);",
				})
			);
			PropertiesPanel.filtersSection.appendChild(
				createButtonWithIcon({
					onclick: "PropertiesPanel.removeFilter(" + i + ")",
					title: "Remove Filter",
					iconName: "minus",
				})
			);
		}
	}

	populateLayers(count) {
		PropertiesPanel.layersSection.innerHTML = "";

		for (let i = 1; i <= count; i++) {
			const props = {
				type: "radio",
				id: "layer_" + i + "_radio",
				name: "layerRadio",
				class: "radio",
				onchange: `LayerTools.selectLayer(${i - 1})`,
			};
			if (viewport.selectedLayer == viewport.layers[i - 1]) {
				props.checked = true;
			}
			PropertiesPanel.layersSection.appendChild(
				createInputWithLabel("layer " + i, props)
			);

			if (count > 1) {
				PropertiesPanel.layersSection.appendChild(
					createButtonWithIcon({
						id: "layer_" + i + "_removeBtn",
						onclick: "LayerTools.removeLayer(" + (i - 1) + ")",
						title: "Remove Layer",
						iconName: "minus",
					})
				);
			} else {
				PropertiesPanel.layersSection.appendChild(
					createDOMElement("div", {}, "")
				);
			}
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

		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 0) {
			newHeight = STAGE_PROPERTIES.height;
			const aspectRatio = STAGE_PROPERTIES.width / STAGE_PROPERTIES.height;
			if (constrainDimensions.checked) {
				if (!isNaN(aspectRatio)) {
					newHeight = newWidth / aspectRatio;
				} else {
					newHeight = newWidth;
				}
			}
			resizeStage(newWidth, newHeight);
			setValue(widthInput, Math.round(newWidth));
			setValue(heightInput, Math.round(newHeight));
			return;
		}

		selectedShapes.forEach((s) => {
			const currentWidth = s.size.width;
			if (value == 0) {
				newWidth = Math.sign(currentWidth) * -1;
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

		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 0) {
			newWidth = STAGE_PROPERTIES.width;
			const aspectRatio = STAGE_PROPERTIES.width / STAGE_PROPERTIES.height;
			if (constrainDimensions.checked) {
				if (!isNaN(aspectRatio)) {
					newWidth = newHeight * aspectRatio;
				} else {
					newWidth = newHeight;
				}
			}
			resizeStage(newWidth, newHeight);
			setValue(widthInput, Math.round(newWidth));
			setValue(heightInput, Math.round(newHeight));
			return;
		}

		viewport.getSelectedShapes().forEach((s) => {
			const currentWidth = s.size.width;
			const currentHeight = s.size.height;
			if (value == 0) {
				newHeight = Math.sign(currentHeight) * -1;
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

		PropertiesPanel.textSection
			.querySelectorAll(".radio-button-button")
			.forEach((label) => {
				label.style.backgroundColor = "transparent";
			});
		const radio = document.getElementById("textAlign" + value);
		radio.checked = true;
		const label = PropertiesPanel.textSection.querySelector(
			`label[for="${radio.id}"]`
		);
		label.style.backgroundColor = "var(--highlight-color)";
	}

	static changeChromaKey(index, value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.filters[index].setKeyFromHex(value), save);
	}

	static changeChromaThreshold(index, value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.filters[index].setThreshold(value), save);
	}

	static addChromaFilter() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 1 && selectedShapes[0].filters) {
			selectedShapes[0].filters.push(new Chroma());
		}
		PropertiesPanel.updateDisplay();
	}

	static removeFilter(index) {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 1 && selectedShapes[0].filters) {
			selectedShapes[0].filters.splice(index, 1);
		}
		PropertiesPanel.updateDisplay();
	}

	static reset() {
		xInput.value = "";
		rotationInput.value = "";
		yInput.value = "";
		widthInput.value = STAGE_PROPERTIES.width;
		heightInput.value = STAGE_PROPERTIES.height;
		xInput.placeholder = "";
		yInput.placeholder = "";
		widthInput.placeholder = "";
		heightInput.placeholder = "";
		rotationInput.placeholder = "";
		document.getElementById(`textAlignCenter`).checked = true;

		PropertiesPanel.filtersSection.style.display = "none";
		PropertiesPanel.textSection.querySelectorAll('label')
		.forEach( label => {
			label.style.backgroundColor = "transparent"
		})
		PropertiesPanel.textSection.style.display = "none";
		PropertiesPanel.filtersHeader.style.display = "none";
		PropertiesPanel.textHeader.style.display = "none";
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
			xInput,
			yInput,
			widthInput,
			heightInput,
			fillColor,
			fill,
			strokeColor,
			stroke,
			strokeWidth,
			rotationInput,
			fontSize,
			textAlignLeft,
			textAlignCenter,
			textAlignRight,
		};

		const placeholderText = "Multiple Values";

		let newProperties = PropertiesPanel.getNewProperties(selectedShapes);
		if (selectedShapes.length === 1 && selectedShapes[0].filters) {
			PropertiesPanel.showFilters(selectedShapes[0].filters);
			PropertiesPanel.filtersSection.style.display = "";
			PropertiesPanel.filtersHeader.style.display = "";
		}

		if (selectedShapes.length === 1 && selectedShapes[0] instanceof Text) {
			PropertiesPanel.textSection.style.display = "";
			PropertiesPanel.textHeader.style.display = "";
		}

		for (let key in newProperties) {
			let newProperty = newProperties[key];
			if (Number(newProperty.value)) {
				newProperty.value = Math.round(newProperty.value);
			}

			switch (key) {
				case ("fill", "stroke"):
					panelFields[key].checked = newProperty.value || false;
					break;
				case "textAlingnment":
					document.getElementById(`textAlignCenter`).checked = true;
					let value = newProperty.value;
					if (value) {
						const radio = document.getElementById(`textAlign${value}`)
						radio.checked = true;
						const label = PropertiesPanel.textSection.querySelector(
							`label[for="${radio.id}"]`
						);
						label.style.backgroundColor = "var(--highlight-color)";
					}
					break;
				default:
					panelFields[key].value =
						newProperty.value === null ? "" : newProperty.value;
					panelFields[key].placeholder =
						newProperty.value || placeholderText;
			}
		}
	}

	static getNewProperties(selectedShapes) {
		let getX = (shape) => shape.center.x - STAGE_PROPERTIES.left;
		let getY = (shape) => shape.center.y - STAGE_PROPERTIES.top;
		let getWidth = (shape) => shape.size.width;
		let getHeight = (shape) => shape.size.height;
		let getFillColor = (shape) => shape.options.fillColor;
		let getFill = (shape) => shape.options.fill;
		let getStrokeColor = (shape) => shape.options.strokeColor;
		let getStroke = (shape) => shape.options.stroke;
		let getStrokeWidth = (shape) => shape.options.strokeWidth;
		let getText = (shape) => shape.text || null;
		let getRotation = (shape) => shape.rotation;
		let getFontSize = (shape) =>
			shape.text !== undefined ? shape.getFontSize() : "";
		let getTextAlignMent = (shape) =>
			shape.text !== undefined ? shape.getAlignment() : "";

		let newProperties = null;
		for (const shape of selectedShapes) {
			if (newProperties === null) {
				newProperties = {
					xInput: { value: getX(shape), extractor: getX },
					yInput: { value: getY(shape), extractor: getY },
					widthInput: { value: getWidth(shape), extractor: getWidth },
					heightInput: { value: getHeight(shape), extractor: getHeight },
					fillColor: {
						value: getFillColor(shape),
						extractor: getFillColor,
					},
					fill: { value: getFill(shape), extractor: getFill },
					strokeColor: {
						value: getStrokeColor(shape),
						extractor: getStrokeColor,
					},
					stroke: { value: getStroke(shape), extractor: getStroke },
					strokeWidth: {
						value: getStrokeWidth(shape),
						extractor: getStrokeWidth,
					},
					rotationInput: {
						value: getRotation(shape),
						extractor: getRotation,
					},
					fontSize: { value: getFontSize(shape), extractor: getFontSize },
					textAlingnment: {
						value: getTextAlignMent(shape),
						extractor: getTextAlignMent,
					},
				};
			} else {
				for (let key in newProperties) {
					let newPanelProperty = newProperties[key];
					if (
						newPanelProperty.value !== newPanelProperty.extractor(shape)
					) {
						newPanelProperty.value = null;
					}
				}
			}
		}
		return newProperties;
	}
}
