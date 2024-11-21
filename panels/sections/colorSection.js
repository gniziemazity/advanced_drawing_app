class ColorSection extends PanelSection {
	constructor() {
		super("Color");
		this.registerShortcuts();
		this.panelProperties = [
			{
				key: "strokeWidth",
				type: "number",
				inputId: "strokeWidth",
				extractor: this.getStrokeWidth.bind(this),
			},
		];
	}

	addContent(holderDiv) {
		const colorSelectorContainer = createDOMElement("div", {
			id: "colorSelectorContainer",
		});
		colorSelectorContainer.style.gridColumn = "2 span";
		colorSelectorContainer.style.flexDirection = "column";
		this.fillColorSelector = new ColorSelector(
			colorSelectorContainer
		);
		this.fillColorSelector.value="#ffffff";
		this.fillColorSelector.addEventListener("input", this.changeFill);
		this.strokeColorSelector = new ColorSelector(
			colorSelectorContainer
		);
		this.strokeColorSelector.value="#000000";
		this.strokeColorSelector.addEventListener("input", this.changeStroke);
		holderDiv.appendChild(colorSelectorContainer);
		
		const otherControls=document.createElement("div");
		holderDiv.appendChild(otherControls);
		
		otherControls.appendChild(
			createButtonWithIcon({
				id: "resetBtn",
				title: "Reset (D)",
				class: "tool-button",
				onclick: this.resetColors.bind(this),
				iconName: "reset_colors",
			})
		);
		otherControls.appendChild(
			createButtonWithIcon({
				id: "swapBtn",
				title: "Swap (X)",
				class: "tool-button",
				onclick: this.swapColors.bind(this),
				iconName: "swap_colors",
			})
		);
		
		otherControls.appendChild(
			createDOMElement("input", {
				id: "strokeWidth",
				max: "30",
				min: "1",
				step: "1",
				onchange: (e) => this.changeStrokeWidth(e.currentTarget.value),
				oninput: (e) =>
					this.changeStrokeWidth(e.currentTarget.value, false),
				title: "Stroke Width",
				type: "range",
				value: "5",
				style: "margin-left: 20px",
			})
		);
		otherControls.appendChild(
			createDOMElement("input", {
				id: "strokeWidthNumber",
				max: "30",
				min: "1",
				step: "1",
				onchange: (e) => this.changeStrokeWidth(e.currentTarget.value),
				oninput: (e) =>
					this.changeStrokeWidth(e.currentTarget.value, false),
				title: "Stroke Width",
				type: "number",
				value: "5",
			})
		);
	}

	registerShortcuts() {
		shortcutManager.addShortcut(
			new Shortcut({
				control: false,
				key: "d",
				action: this.resetColors.bind(this),
			})
		);
		shortcutManager.addShortcut(
			new Shortcut({
				control: false,
				key: "x",
				action: this.swapColors.bind(this),
			})
		);
	}

	changeFill(value) {
		if (!value) {
			viewport
				.getSelectedShapes()
				.forEach((s) => s.setOptions({ fill: false }));
		} else {
			viewport
				.getSelectedShapes()
				.forEach((s) => s.setOptions({ fill: true, fillColor: value }));
		}
	}

	changeStroke(value) {
		if (!value) {
			viewport
				.getSelectedShapes()
				.forEach((s) => s.setOptions({ stroke: false }));
		} else {
			viewport
				.getSelectedShapes()
				.forEach((s) => s.setOptions({ strokeColor: value }));
		}
	}

	changeStrokeWidth(value, save = true) {
		strokeWidthNumber.value = value;
		strokeWidth.value = value;
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ strokeWidth: Number(value) }, save));
	}

	resetColors() {
		this.fillColorSelector.value = "#ffffff";
		this.strokeColorSelector.value = "#000000";
		this.changeFill(this.fillColorSelector.value);
		this.changeStroke(this.strokeColorSelector.value);
	}

	swapColors() {
		const aux = this.fillColorSelector.value;

		this.fillColorSelector.value=this.strokeColorSelector.value;
		this.strokeColorSelector.value=aux;

		this.changeFill(this.fillColorSelector.value);
		this.changeStroke(this.strokeColorSelector.value);
	}

	getFillColor(shape) {
		return shape.options.fillColor;
	}
	getFill(shape) {
		return shape.options.fill;
	}
	getStrokeColor(shape) {
		return shape.options.strokeColor;
	}
	getStroke(shape) {
		return shape.options.stroke;
	}
	getStrokeWidth(shape) {
		return shape.options.strokeWidth;
	}
}
