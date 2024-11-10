class PropertiesPanel {
	constructor(holderDiv) {
		this.holderDiv = holderDiv;

		const panelBodyDiv = createDOMElement("div", {
			class: "panel-body",
		});
		holderDiv.appendChild(panelBodyDiv);

		//Define all the sections of the properties panel here, in order of display
		this.sections = {
			properties: new PropertiesSection(),
			colors: new ColorSection(),
			text: new TextSection(),
			filters: new FiltersSection(),
			arrange: new ArrangeSection(),
			layers: new LayersSection(),
		}
		
		for (const key of Object.keys(this.sections)) {
			panelBodyDiv.appendChild(this.sections[key].getSection());
		}

		this.reset();
		this.sections.colors.resetColors();

		LayerTools.selectLayer(0);

		viewport.addEventListener(
			"positionChanged",
			this.updateDisplay.bind(this)
		);
		viewport.addEventListener("sizeChanged", this.updateDisplay.bind(this));
		viewport.addEventListener(
			"rotationChanged",
			this.updateDisplay.bind(this)
		);
		viewport.addEventListener("shapeSelected", this.updateDisplay.bind(this));
		viewport.addEventListener(
			"shapeUnselected",
			this.updateDisplay.bind(this)
		);
		viewport.addEventListener("textChanged", this.updateDisplay.bind(this));
		viewport.addEventListener("history", this.updateDisplay.bind(this));
	}

	reset() {
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

		this.sections.filters.hide();
		this.sections.text.hide();
		this.sections.text.changeTextAlignment("Center", false);
	}

	getValues() {
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

	//TODO: Refactor below functions to add the functionality to the separate panel sections

	// To add a PanelProperty field that will update when updateDisplay is
	// called. we have to do 3 things:
	// - update the variable panelFields with the new panel property field
	// - in PropertiesPanel.getNewProperties function: write a simple get<FieldValue> function
	// 	 that takes in a shape argument
	// - in PropertiesPanel.getNewProperties function: update the variable newProperties
	//   with the field to update and an extract function that uses your get<FieldValue>
	updateDisplay() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length === 0) {
			this.reset();
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

		let newProperties = this.getNewProperties(selectedShapes);
		if (selectedShapes.length === 1 && selectedShapes[0].filters) {
			this.sections.filters.populateFilters(selectedShapes[0].filters);
			this.sections.filters.show();
		}

		if (selectedShapes.length === 1 && selectedShapes[0] instanceof Text) {
			this.sections.text.show();
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
				case "textAlignment":
					document.getElementById(`textAlignCenter`).checked = true;
					let value = newProperty.value;
					if (value) {
						const radio = document.getElementById(`textAlign${value}`)
						radio.checked = true;
						const label = this.sections.text.sectionContent.querySelector(
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

	getNewProperties(selectedShapes) {
		let getX = (shape) => shape.center.x - STAGE_PROPERTIES.left;
		let getY = (shape) => shape.center.y - STAGE_PROPERTIES.top;
		let getWidth = (shape) => shape.size.width;
		let getHeight = (shape) => shape.size.height;
		let getFillColor = (shape) => shape.options.fillColor;
		let getFill = (shape) => shape.options.fill;
		let getStrokeColor = (shape) => shape.options.strokeColor;
		let getStroke = (shape) => shape.options.stroke;
		let getStrokeWidth = (shape) => shape.options.strokeWidth;
		let getRotation = (shape) => shape.rotation;
		let getFontSize = (shape) =>
			shape.text !== undefined ? shape.getFontSize() : "";
		let getTextAlignment = (shape) =>
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
					textAlignment: {
						value: getTextAlignment(shape),
						extractor: getTextAlignment,
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
