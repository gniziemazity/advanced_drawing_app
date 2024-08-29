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
			class: "panel-section three_col_grid",
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
			createDOMElement("input", {
				id: "text",
				oninput: "PropertiesPanel.changeText(this.value)",
				title: "Text",
				type: "text",
				value: "TEST",
			})
		);

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
		const newWidth = Math.max(Number(value), 1);
		let newHeight = 0;

		viewport.getSelectedShapes().forEach((s) => {
			const currentWidth = s.size.width;
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
		const newHeight = Math.max(Number(value), 1);
		let newWidth = 0;

		viewport.getSelectedShapes().forEach((s) => {
			const currentWidth = s.size.width;
			const currentHeight = s.size.height;
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

	static changeText(value) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.text !== undefined)
			.forEach((s) => s.setText(value));
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

	static updateDisplay() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length === 0) {
			PropertiesPanel.reset();
			return;
		}

		let newProperties = null;
		for (const shape of selectedShapes) {
			if (newProperties === null) {
				newProperties = {
					x: shape.center.x - STAGE_PROPERTIES.left,
					y: shape.center.y - STAGE_PROPERTIES.top,
					width: shape.size.width,
					height: shape.size.height,
					fillColor: shape.options.fillColor,
					fill: shape.options.fill,
					strokeColor: shape.options.strokeColor,
					stroke: shape.options.stroke,
					strokeWidth: shape.options.strokeWidth,
					text: shape.text,
					rotationAngle: shape.rotation,
				};
			} else {
				if (newProperties.x !== shape.center.x - STAGE_PROPERTIES.left) {
					newProperties.x = null;
				}
				if (newProperties.y !== shape.center.y - STAGE_PROPERTIES.top) {
					newProperties.y = null;
				}
				if (newProperties.width !== shape.size.width) {
					newProperties.width = null;
				}
				if (newProperties.height !== shape.size.height) {
					newProperties.height = null;
				}
				if (newProperties.fillColor !== shape.options.fillColor) {
					newProperties.fillColor = null;
				}
				if (newProperties.fill !== shape.options.fill) {
					newProperties.fill = null;
				}
				if (newProperties.strokeColor !== shape.options.strokeColor) {
					newProperties.strokeColor = null;
				}
				if (newProperties.stroke !== shape.options.stroke) {
					newProperties.stroke = null;
				}
				if (newProperties.strokeWidth !== shape.options.strokeWidth) {
					newProperties.strokeWidth = null;
				}
				if (newProperties.text !== shape.text) {
					newProperties.text = null;
				}
				if (newProperties.rotationAngle !== shape.rotation) {
					newProperties.rotationAngle = null;
				}
			}
		}
		if (newProperties === null) {
			return;
		} else {
			xInput.value = newProperties.x ? Math.round(newProperties.x) : "";
			yInput.value = newProperties.y ? Math.round(newProperties.y) : "";
			widthInput.value = newProperties.width
				? Math.round(newProperties.width)
				: "";
			heightInput.value = newProperties.height
				? Math.round(newProperties.height)
				: "";
			fillColor.value = newProperties.fillColor
				? newProperties.fillColor
				: "";
			fill.checked = newProperties.fill ? newProperties.fill : false;
			strokeColor.value = newProperties.strokeColor
				? newProperties.strokeColor
				: "";
			stroke.checked = newProperties.stroke ? newProperties.stroke : false;
			strokeWidth.value = newProperties.strokeWidth
				? newProperties.strokeWidth
				: "";
			text.value = newProperties.text ? newProperties.text : "";
			rotationInput.value = formatAngle(newProperties.rotationAngle) ?? "";

			const placeholderText = "Multiple Values";
			xInput.placeholder = newProperties.x ? "" : placeholderText;
			yInput.placeholder = newProperties.y ? "" : placeholderText;
			widthInput.placeholder = newProperties.width ? "" : placeholderText;
			heightInput.placeholder = newProperties.height ? "" : placeholderText;
			fillColor.placeholder = newProperties.fillColor ? "" : placeholderText;
			fill.placeholder = newProperties.fill ? "" : placeholderText;
			strokeColor.placeholder = newProperties.strokeColor
				? ""
				: placeholderText;
			stroke.placeholder = newProperties.stroke ? "" : placeholderText;
			strokeWidth.placeholder = newProperties.strokeWidth
				? ""
				: placeholderText;
			text.placeholder = newProperties.text ? "" : placeholderText;
			rotationInput.placeholder = newProperties.rotationAngle
				? ""
				: placeholderText;
		}
	}
}
