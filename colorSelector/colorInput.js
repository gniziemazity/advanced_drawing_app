//This class is to have an actual colorInput element that can be used in the DOM
class ColorInput {
	static colorSelector = new ColorSelector();

	constructor({
		id = "",
		width = 32,
		height = 24,
		defaultColor = "#00000000",
		onChange = () => {},
		onInput = () => {},
	} = {}) {
		this.onChange = onChange;
		this.onInput = onInput;
		this.color = defaultColor;

		this.colorElement = new ColorElement({ id, width, height, defaultColor });
		this.colorElement.addEventListener(
			"click",
			this.#openColorSelector.bind(this)
		);
		this.colorElement.setColor = this.setColor.bind(this);
	}

	setColor(color) {
		this.color = color;
		this.colorElement.updateColor(color);

		if (this.onChange) {
			this.onChange(this.color);
		}
	}

	getColor() {
		return this.color;
	}

	#openColorSelector(e) {
		e.stopPropagation();
		ColorInput.colorSelector.show(this);
	}

	getBoundingClientRect() {
		return this.colorElement.getBoundingClientRect();
	}

	getDomNode() {
		return this.colorElement;
	}
}
