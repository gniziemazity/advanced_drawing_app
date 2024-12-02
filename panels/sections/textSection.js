class TextSection extends PanelSection {
	constructor() {
		super("Text", { visible: false });
		this.panelProperties = [
			{
				key: "fontSize",
				type: "number",
				inputId: "fontSize",
				extractor: this.getFontSize.bind(this),
			},
			{
				key: "textAlignment",
				type: "enum",
				enum: ["Left", "Center", "Right"],
				inputId: "textAlign",
				extractor: this.getTextAlignment.bind(this),
			},
		];
	}

	addContent(holderDiv) {
		holderDiv.appendChild(
			createInputWithLabel("font-size", {
				type: "number",
				oninput: (e) => this.changeFontSize(e.currentTarget.value, false),
				id: "fontSize",
			})
		);

		const alignmentDiv = createDOMElement("div", {
			class: "panel-section three_col_grid",
			style: "padding-top:0;",
		});
		holderDiv.appendChild(alignmentDiv);
		for (const alignment of ["Left", "Center", "Right"]) {
			alignmentDiv.appendChild(
				createRadioWithImage("text_" + alignment.toLowerCase(), alignment, {
					type: "radio",
					id: "textAlign" + alignment,
					name: "textAlign",
					class: "radio",
					title: "align " + alignment.toLowerCase(),
					onchange: () => this.changeTextAlignment(alignment, false),
				})
			);
		}
	}

	reset() {
		this.hide();
		this.changeTextAlignment("Center", false);
	}

	changeFontSize(value, save = true) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.isText())
			.forEach((s) => s.setFontSize(value, save));
	}

	changeTextAlignment(value, save = true) {
		viewport
			.getSelectedShapes()
			.filter((s) => s.isText())
			.forEach((s) => s.setAlignment(value, save));

		this.sectionContent
			.querySelectorAll(".radio-button-button")
			.forEach((label) => {
				label.style.backgroundColor = "transparent";
			});

		const radio = document.getElementById("textAlign" + value);
		radio.checked = true;
		const label = this.sectionContent.querySelector(
			`label[for="${radio.id}"]`
		);
		label.style.backgroundColor = "var(--highlight-color)";
	}

	getFontSize(shape) {
		return shape.isText() ? shape.getFontSize() : "";
	}
	getTextAlignment(shape) {
		return shape.isText() ? shape.getAlignment() : "";
	}
}
