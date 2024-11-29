class ColorSection extends PanelSection {
	constructor() {
		super("Color");
		this.registerShortcuts();
		this.panelProperties = [
			{
				key: "fillColor",
				type: "color",
				inputId: "fillColor",
				extractor: this.getFillColor.bind(this),
			},
			{
				key: "strokeColor",
				type: "color",
				inputId: "strokeColor",
				extractor: this.getStrokeColor.bind(this),
			},
			{
				key: "strokeWidth",
				type: "number",
				inputId: "strokeWidth",
				extractor: this.getStrokeWidth.bind(this),
			},
		];
	}

	addContent(holderDiv) {
		this.fillColorInput = new ColorInput({
			id: "fillColor",
			defaultColor: "#ffffffff",
			onChange: this.changeFill.bind(this),
		});
		this.strokeColorInput = new ColorInput({
			id: "strokeColor",
			defaultColor: "#000000ff",
			onChange: this.changeStroke.bind(this),
		});
		holderDiv.appendChild(this.fillColorInput.getDomNode());
		holderDiv.appendChild(this.strokeColorInput.getDomNode());

		const otherControls = document.createElement("div");
		holderDiv.appendChild(otherControls);
		holderDiv.appendChild(
			createDOMElement("input", {
				id: "fill",
				checked: true,
				onchange: (e) => this.changeFill(e.currentTarget.checked),
				title: "Fill",
				type: "checkbox",
			})
		);
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
		this.fillColorInput.setColor("#FFFFFFFF");
		this.strokeColorInput.setColor("#000000FF");
		this.changeFill(this.fillColorInput.getColor());
		this.changeStroke(this.strokeColorInput.getColor());
	}

	swapColors() {
		const aux = this.fillColorInput.getColor();
      this.fillColorInput.setColor(this.strokeColorInput.getColor());
      this.strokeColorInput.setColor(aux);
		this.changeFill(this.fillColorInput.getColor());
		this.changeStroke(this.strokeColorInput.getColor());
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
