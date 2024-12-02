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
		};

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
		for (const key of Object.keys(this.sections)) {
			this.sections[key].reset();
		}
	}

	getValues() {
		return {
			fillColor: this.sections["colors"].fillColorInput.getColor(),
			strokeColor: this.sections["colors"].strokeColorInput.getColor(),
			fill: this.sections["colors"].fillColorInput.getColor() != null,
			stroke: this.sections["colors"].strokeColorInput.getColor() != null,
			strokeWidth: Number(strokeWidth.value),
			lineCap: "round",
			lineJoin: "round",
		};
	}

	updateDisplay() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length === 0) {
			this.reset();
			return;
		}

		if (selectedShapes.length === 1 && selectedShapes[0].filters) {
			this.sections.filters.populateFilters(selectedShapes[0].filters);
			this.sections.filters.show();
		}

		if (selectedShapes.length === 1 && selectedShapes[0] instanceof Text) {
			this.sections.text.show();
		}

		for (const key of Object.keys(this.sections)) {
			this.sections[key].updateDisplay(selectedShapes);
		}
	}
}
