class PanelSection {
	constructor(title, { collapsable, visible, sectionClass } = {}) {
		this.title = title;
		this.collapsable = collapsable ?? true;
		this.visible = visible ?? true;
		this.sectionClass = sectionClass ?? "";
		this.section = null;
		this.sectionHeader = null;
		this.sectionContent = null;
		this.#generateSection();
		this.#addEventListeners();

		/**
		 * This defines the properties that can be updated through the panel, to be set in the subclass constructor
		 * Based on these properties, the panel will update its values automatically
		 * format:
		 * [
		 *  {
		 *      key: string, // unique identifier for the property
		 *      type: string, // "number", "string", "boolean", "enum"
		 *      enum: array, // if type is "enum" then this should be an array of possible values
		 *      inputId: string, // id of the input element in the panel
		 *      extractor: function // function that extracts the property from a shape
		 *  },
		 *  ...
		 * ]
		 */
		this.panelProperties = [];
	}

	#generateSection() {
		this.section = createDOMElement("div", {
			style: this.visible ? "" : "display: none",
		});
		this.sectionHeader = createDOMElement("div", {
			class: "panel-head",
		});
		this.sectionHeader.innerText = "▼ " + this.title;
		this.addTitleContent(this.sectionHeader);
		this.sectionContent = createDOMElement("div", {
			class: "panel-section " + this.sectionClass,
		});
		this.addContent(this.sectionContent);
		this.section.appendChild(this.sectionHeader);
		this.section.appendChild(this.sectionContent);
	}

	#addEventListeners() {
		if (this.collapsable) {
			this.sectionHeader.addEventListener(
				"click",
				this.toggleCollapse.bind(this)
			);
		}
	}

	getSection() {
		return this.section;
	}

	show() {
		if (!this.visible) {
			this.visible = true;
			this.section.style.display = "";
		}
	}

	hide() {
		if (this.visible) {
			this.visible = false;
			this.section.style.display = "none";
		}
	}

	toggleCollapse() {
		if (this.sectionContent.style.display === "none") {
			this.sectionContent.style.display = "";
			this.sectionHeader.innerText = "▼ " + this.title;
		} else {
			this.sectionContent.style.display = "none";
			this.sectionHeader.innerText = "▶ " + this.title;
		}
		this.addTitleContent(this.sectionHeader);
	}

	addContent(holderDiv) {
		throw new Error(
			"PanelSection.addContent() must be implemented by the subclass"
		);
	}

	addTitleContent(holderDiv) {}

	reset() {}

	updateDisplay(selectedShapes) {
		const placeholderText = "Multiple Values";

		const selectedProperties = this.getSelectedProperties(selectedShapes);

		for (const key in selectedProperties) {
			const selectedProperty = this.panelProperties.find(
				(p) => p.key === key
			);
			let value = selectedProperties[key];
			let el;
			switch (selectedProperty.type) {
				case "number":
					if (Number(value)) {
						value = Math.round(value);
					}
				case "string":
					el = document.getElementById(selectedProperty.inputId);
					el.value = value === null ? "" : value;
					el.placeholder = value || placeholderText;
					break;
				case "color":
					el = document.getElementById(selectedProperty.inputId);
					el.setColor(value);
					break;
				case "boolean":
					document.getElementById(selectedProperty.inputId).checked =
						value || false;
					break;
				case "enum":
					if (value) {
						for (const option of selectedProperty.enum) {
							const radio = document.getElementById(
								selectedProperty.inputId + option
							);
							radio.checked = value === option;
							const label = this.sectionContent.querySelector(
								`label[for="${radio.id}"]`
							);
							label.style.backgroundColor =
								value === option
									? "var(--highlight-color)"
									: "transparent";
						}
					}
					break;
			}
		}
	}

	getSelectedProperties(selectedShapes) {
		let selectedProperties = null;
		for (const shape of selectedShapes) {
			if (selectedProperties === null) {
				selectedProperties = {};
				for (const property of this.panelProperties) {
					selectedProperties[property.key] = property.extractor(shape);
				}
			} else {
				for (let key in selectedProperties) {
					let newPanelProperty = selectedProperties[key];
					const property = this.panelProperties.find((p) => p.key === key);
					if (newPanelProperty !== property.extractor(shape)) {
						selectedProperties[key] = null;
					}
				}
			}
		}
		return selectedProperties;
	}
}
