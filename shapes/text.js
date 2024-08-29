class Text extends Shape {
	constructor(center, options) {
		super(options);
		this.center = center;

		//unify later with other shapes
		this.properties = {
			fontSize: 60,
			font: "60px Arial",
			textAlign: "center",
			textBaseline: "middle",
			lineJoin: "round",
			lineCap: "round",
			dilation: 10, //for hit test
		};

		this.setText("Enter Text Here", false);
	}

	static load(data) {
		const text = new Text();
		text.id = data.id;
		text.options = JSON.parse(JSON.stringify(data.options));
		text.center = Vector.load(data.center);
		text.size = data.size;
		text.selected = data.selected;
		text.text = data.text;
		text.rotation = data.rotation ?? 0;
		return text;
	}

	serialize() {
		return {
			type: "Text",
			id: this.id,
			options: JSON.parse(JSON.stringify(this.options)),
			center: this.center,
			size: JSON.parse(JSON.stringify(this.size)),
			text: this.text,
			selected: this.selected,
			rotation: this.rotation,
		};
	}

	getPoints() {
		return [
			new Vector(-this.size.width / 2, -this.size.height / 2),
			new Vector(-this.size.width / 2, this.size.height / 2),
			new Vector(this.size.width / 2, this.size.height / 2),
			new Vector(this.size.width / 2, -this.size.height / 2),
		];
	}

	_setWidth(width) {
		//do nothing
	}

	_setHeight(height) {
		//do nothing
	}

	setProperties(ctx) {
		for (const key in this.properties) {
			ctx[key] = this.properties[key];
		}
	}

	setText(value, save = true) {
		this.text = value;
		// WARNING, potential memory leak
		const tmpCanvas = document.createElement("canvas");
		const tmpCtx = tmpCanvas.getContext("2d");
		this.setProperties(tmpCtx);
		const metrics = tmpCtx.measureText(this.text);
		this.size = {};
		this.size.width = metrics.width;
		this.size.height = this.properties.fontSize;
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	draw(ctx, hitRegion = false) {
		const center = this.center ? this.center : { x: 0, y: 0 };
		let left, top, width, height;

		left = center.x - this.size.width / 2;
		top = center.y - this.size.height / 2;
		width = this.size.width;
		height = this.size.height;

		ctx.save();
		this.setProperties(ctx);

		if (hitRegion) {
			ctx.beginPath();
			const rgb = Shape.getHitRGB(this.id);
			ctx.fillStyle = rgb;
			ctx.strokeStyle = rgb;
			ctx.lineWidth = this.options.strokeWidth + this.properties.dilation;
			ctx.fillText(this.text, left + width / 2, top + height / 2);
			ctx.strokeText(this.text, left + width / 2, top + height / 2);
			ctx.restore();
		} else {
			ctx.beginPath();
			if (this.options.fill) {
				ctx.fillStyle = this.options.fillColor;
				ctx.fillText(this.text, left + width / 2, top + height / 2);
			}
			if (this.options.stroke) {
				ctx.strokeStyle = this.options.strokeColor;
				ctx.lineWidth = this.options.strokeWidth;
				ctx.strokeText(this.text, left + width / 2, top + height / 2);
			}
			ctx.restore();
		}
	}
}

ShapeFactory.registerShape(Text, "Text");