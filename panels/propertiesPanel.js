class PropertiesPanel {
	constructor(holderDiv) {
		this.holderDiv = holderDiv;
		this.holderDiv.innerText = "Properties";
		this.holderDiv.appendChild(createDOMElement("br"));
		this.holderDiv.appendChild(
			createInputWithLabel("X", {
				type: "number",
				onchange: "PropertiesPanel.changeX(this.value)",
				id: "xInput",
			})
		);
		this.holderDiv.appendChild(
			createInputWithLabel("Y", {
				type: "number",
				onchange: "PropertiesPanel.changeY(this.value)",
				id: "yInput",
			})
		);
		this.holderDiv.appendChild(
			createInputWithLabel("Width", {
				type: "number",
				onchange: "PropertiesPanel.changeWidth(this.value)",
				id: "widthInput",
			})
		);
		this.holderDiv.appendChild(
			createInputWithLabel("Height", {
				type: "number",
				onchange: "PropertiesPanel.changeHeight(this.value)",
				id: "heightInput",
			})
		);
		this.holderDiv.appendChild(
			createInputWithLabel("Constrain", {
				type: "checkbox",
				id: "constrainDimensions",
			})
		);
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "fillColor",
				onchange: "PropertiesPanel.changeFillColor(this.value)",
				oninput: "PropertiesPanel.previewFillColor(this.value)",
				title: "Fill Color",
				type: "color",
				value: "#ff0000",
			})
		);
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "fill",
				checked: true,
				onchange: "PropertiesPanel.changeFill(this.checked)",
				title: "Fill",
				type: "checkbox",
			})
		);
		this.holderDiv.appendChild(createDOMElement("br"));
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "strokeColor",
				onchange: "PropertiesPanel.changeStrokeColor(this.value)",
				oninput: "PropertiesPanel.previewStrokeColor(this.value)",
				title: "Stroke Color",
				type: "color",
				value: "#0000ff",
			})
		);
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "stroke",
				checked: true,
				onchange: "PropertiesPanel.changeStroke(this.checked)",
				title: "Stroke",
				type: "checkbox",
			})
		);
		this.holderDiv.appendChild(createDOMElement("br"));
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "strokeWidth",
				max: "100",
				min: "1",
				onchange: "PropertiesPanel.changeStrokeWidth(this.value)",
				oninput: "PropertiesPanel.previewStrokeWidth(this.value)",
				title: "Stroke Width",
				type: "range",
				value: "5",
			})
		);
		this.holderDiv.appendChild(createDOMElement("br"));
		this.holderDiv.appendChild(
			createDOMElement("input", {
				id: "text",
				oninput: "PropertiesPanel.changeText(this.value)",
				title: "Stroke Width",
				type: "text",
				value: "TEST",
			})
		);
		this.holderDiv.appendChild(createDOMElement("br"));
	}

	static changeX(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.center.x = Number(value) + stageProperties.left));

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static changeY(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.center.y = Number(value) + stageProperties.top));

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static changeWidth(value) {
		const newWidth = Math.max(Number(value), 1);
		let newHeight = 0;

		shapes
			.filter((s) => s.selected)
			.forEach((s) => {
				const currentWidth = s.size.width;
				const currentHeight = s.size.height;
				newHeight = currentHeight;
				if (constrainDimensions.checked) {
					const aspectRatio = currentWidth / currentHeight;
					const constrainedHeight = newWidth / aspectRatio;
					newHeight = constrainedHeight;
				}
				s.setSize(newWidth, newHeight);
			});

		setValue(widthInput, Math.round(newWidth));
		if (getValue(heightInput) != "") {
			setValue(heightInput, Math.round(newHeight));
		}

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static changeHeight(value) {
		const newHeight = Math.max(Number(value), 1);
		let newWidth = 0;

		shapes
			.filter((s) => s.selected)
			.forEach((s) => {
				const currentWidth = s.size.width;
				const currentHeight = s.size.height;
				newWidth = currentWidth;
				if (constrainDimensions.checked) {
					const aspectRatio = currentWidth / currentHeight;
					const constrainedWidth = newHeight * aspectRatio;
					newWidth = constrainedWidth;
				}
				s.setSize(newWidth, newHeight);
			});

		setValue(heightInput, Math.round(newHeight));
		if (getValue(widthInput) != "") {
			setValue(widthInput, Math.round(newWidth));
		}

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static previewFillColor(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.fillColor = value));

		drawShapes(shapes);
	}

	static changeFillColor(value) {
		PropertiesPanel.previewFillColor(value);
		HistoryTools.record(shapes);
	}

	static changeFill(value) {
		shapes.filter((s) => s.selected).forEach((s) => (s.options.fill = value));

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static previewStrokeColor(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.strokeColor = value));

		drawShapes(shapes);
	}

	static changeStrokeColor(value) {
		PropertiesPanel.previewStrokeColor(value);
		HistoryTools.record(shapes);
	}

	static changeStroke(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.stroke = value));

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static previewStrokeWidth(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.strokeWidth = Number(value)));

		drawShapes(shapes);
	}

	static changeStrokeWidth(value) {
		PropertiesPanel.previewStrokeWidth(value);
		HistoryTools.record(shapes);
	}

	static changeText(value) {
		shapes
			.filter((s) => s.selected && s.text !== undefined)
			.forEach((s) => s.setText(value));

		HistoryTools.record(shapes);
		drawShapes(shapes);
	}

	static reset() {
		xInput.value = "";
		yInput.value = "";
		widthInput.value = "";
		heightInput.value = "";
		text.value = "";
		xInput.placeholder = "";
		yInput.placeholder = "";
		widthInput.placeholder = "";
		heightInput.placeholder = "";
	}

	static updateDisplay(selectedShapes) {
		if (selectedShapes.length === 0) {
			PropertiesPanel.reset();
			return;
		}

		let newProperties = null;
		for (const shape of selectedShapes) {
			if (newProperties === null) {
				newProperties = {
					x: shape.center.x - stageProperties.left,
					y: shape.center.y - stageProperties.top,
					width: shape.size.width,
					height: shape.size.height,
					fillColor: shape.options.fillColor,
					fill: shape.options.fill,
					strokeColor: shape.options.strokeColor,
					stroke: shape.options.stroke,
					strokeWidth: shape.options.strokeWidth,
					text: shape.text,
				};
			} else {
				if (newProperties.x !== shape.center.x - stageProperties.left) {
					newProperties.x = null;
				}
				if (newProperties.y !== shape.center.y - stageProperties.top) {
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
		}
	}
}
