class PropertiesSection extends PanelSection {
	constructor() {
		super("Properties");
		this.panelProperties = [
			{
				key: "x",
				type: "number",
				inputId: "xInput",
				extractor: this.getX.bind(this),
			},
			{
				key: "y",
				type: "number",
				inputId: "yInput",
				extractor: this.getY.bind(this),
			},
			{
				key: "width",
				type: "number",
				inputId: "widthInput",
				extractor: this.getWidth.bind(this),
			},
			{
				key: "height",
				type: "number",
				inputId: "heightInput",
				extractor: this.getHeight.bind(this),
			},
			{
				key: "rotation",
				type: "number",
				inputId: "rotationInput",
				extractor: this.getRotation.bind(this),
			},
		];
	}

	addContent(holderDiv) {
		holderDiv.appendChild(
			createInputWithLabel("X", {
				type: "number",
				onchange: (e) => this.changeX(e.currentTarget.value),
				oninput: (e) => this.changeX(e.currentTarget.value, false),
				id: "xInput",
			})
		);
		holderDiv.appendChild(
			createInputWithLabel("Y", {
				type: "number",
				onchange: (e) => this.changeY(e.currentTarget.value),
				oninput: (e) => this.changeY(e.currentTarget.value, false),
				id: "yInput",
			})
		);
		holderDiv.appendChild(
			createInputWithLabel("Width", {
				type: "number",
				onchange: (e) => this.changeWidth(e.currentTarget.value),
				oninput: (e) => this.changeWidth(e.currentTarget.value, false),
				id: "widthInput",
			})
		);
		holderDiv.appendChild(
			createInputWithLabel("Height", {
				type: "number",
				onchange: (e) => this.changeHeight(e.currentTarget.value),
				oninput: (e) => this.changeHeight(e.currentTarget.value, false),
				id: "heightInput",
			})
		);
		holderDiv.appendChild(
			createInputWithLabel("Rotation", {
				type: "number",
				onchange: (e) => this.setRotation(e.currentTarget.value),
				oninput: (e) => this.setRotation(e.currentTarget.value, false),
				id: "rotationInput",
			})
		);
		holderDiv.appendChild(
			createInputWithLabel("Constrain", {
				type: "checkbox",
				id: "constrainDimensions",
			})
		);
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
	}

	changeX(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) =>
				s.setCenter(
					new Vector(Number(value) + STAGE_PROPERTIES.left, s.center.y),
					save
				)
			);
	}

	changeY(value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) =>
				s.setCenter(
					new Vector(s.center.x, Number(value) + STAGE_PROPERTIES.top),
					save
				)
			);
	}

	changeWidth(value, save = true) {
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

	changeHeight(value, save = true) {
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

	setRotation(degrees, save = true) {
		const radians = (degrees * Math.PI) / 180;
		viewport.getSelectedShapes().forEach((s) => {
			s.setRotation(radians, save);
		});
		setValue(rotationInput, degrees);
	}

	getX(shape) {
		return shape.center.x - STAGE_PROPERTIES.left;
	}

	getY(shape) {
		return shape.center.y - STAGE_PROPERTIES.top;
	}

	getWidth(shape) {
		return shape.getWidth();
	}

	getHeight(shape) {
		return shape.getHeight();
	}

	getRotation(shape) {
		return shape.rotation * (180 / Math.PI);
	}
}
