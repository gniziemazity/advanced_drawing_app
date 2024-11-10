class ColorSection extends PanelSection {

    constructor() {
        super("Color", { sectionClass: "three_col_grid" });
        this.registerShortcuts();
    }
    
    addContent(holderDiv) {
        holderDiv.appendChild(
			createDOMElement("input", {
				id: "fillColor",
				onchange: (e) => this.changeFillColor(e.currentTarget.value),
				oninput: (e) => this.changeFillColor(e.currentTarget.value, false),
				title: "Fill Color",
				type: "color",
			})
		);
		holderDiv.appendChild(
			createDOMElement("input", {
				id: "fill",
				checked: true,
				onchange: (e) => this.changeFill(e.currentTarget.checked),
				title: "Fill",
				type: "checkbox",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "resetBtn",
				title: "Reset (D)",
				class: "tool-button",
				onclick: this.resetColors.bind(this),
				iconName: "reset_colors",
			})
		);
		holderDiv.appendChild(
			createDOMElement("input", {
				id: "strokeColor",
				onchange: (e) => this.changeStrokeColor(e.currentTarget.value),
				oninput: (e) => this.changeStrokeColor(e.currentTarget.value, false),
				title: "Stroke Color",
				type: "color",
			})
		);
		holderDiv.appendChild(
			createDOMElement("input", {
				id: "stroke",
				checked: true,
				onchange: (e) => this.changeStroke(e.currentTarget.checked),
				title: "Stroke",
				type: "checkbox",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "swapBtn",
				title: "Swap (X)",
				class: "tool-button",
				onclick: this.swapColors.bind(this),
				iconName: "swap_colors",
			})
		);
		holderDiv.appendChild(
			createDOMElement("input", {
				id: "strokeWidth",
				max: "30",
				min: "1",
				onchange: (e) => this.changeStrokeWidth(e.currentTarget.value),
				oninput: (e) => this.changeStrokeWidth(e.currentTarget.value, false),
				title: "Stroke Width",
				type: "range",
				value: "5",
			})
		);
    }

    registerShortcuts() {
        shortcutManager.addShortcut(new Shortcut({ control: false, key: "d", action: this.resetColors.bind(this) }));
		shortcutManager.addShortcut(new Shortcut({ control: false, key: "x", action: this.swapColors.bind(this) }));
    }

    changeFillColor(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ fillColor: value }, save));
	}

	changeFill(value) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ fill: value }));
	}

	changeStrokeColor(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ strokeColor: value }, save));
	}

	changeStroke(value) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ stroke: value }));
	}

	changeStrokeWidth(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.setOptions({ strokeWidth: Number(value) }, save));
	}

	resetColors() {
		fillColor.value = "#ffffff";
		strokeColor.value = "#000000";
		this.changeFillColor(fillColor.value);
		this.changeStrokeColor(strokeColor.value);
	}

	swapColors() {
		const fillStyle = fillColor.value;
		const strokeStyle = strokeColor.value;

		fillColor.value = strokeStyle;
		strokeColor.value = fillStyle;

		this.changeFillColor(fillColor.value);
		this.changeStrokeColor(strokeColor.value);
	}
}