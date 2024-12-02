//This class is merely to be able to show a preview of a color in the color selector or color input.
//It has support for the alpha grid background, and the diagonal line for no color.
class ColorElement {
	constructor({ id = "", width = 32, height = 24, color = "#00000000" } = {}) {
		this.width = width;
		this.height = height;
		this.color = color;

		this.div = createDOMElement("div", { id, class: "colorInput" });
		this.div.style.width = `${this.width}px`;
		this.div.style.height = `${this.height}px`;

		this.colorDiv = createDOMElement("div");
		this.colorDiv.style.backgroundColor = this.color;

		this.div.updateColor = this.updateColor.bind(this);
		this.div.appendChild(this.colorDiv);

		return this.div;
	}

	updateColor(color) {
		this.color = color;
		if (this.color) {
			this.div.classList.remove("noColor");
			this.colorDiv.style.backgroundColor = this.color;
		} else {
			this.div.classList.add("noColor");
			this.colorDiv.style.backgroundColor = "transparent";
		}
	}
}
