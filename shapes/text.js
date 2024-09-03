class Text extends Shape {
	constructor(center, options) {
		super(options);
		this.center = center;

		//unify later with other shapes
		this.properties = {
			fontSize: 60,
			font: "60px Arial",
			textAlign: "center",
			_textAlign: "Center",
			textBaseline: "middle",
			lineJoin: "round",
			lineCap: "round",
			dilation: 20, //for hit test
		};

		this.thinWhiteSpace = String.fromCharCode(8201)  // helps in aligning text finely

		this.setText("Enter Text Here", false);
	}

	static load(data) {
		const text = new Text();
		text.id = data.id;
		text.options = JSON.parse(JSON.stringify(data.options));
		text.properties = JSON.parse(JSON.stringify({...text.properties, ...data?.properties}));
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
			properties: this.properties
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
		let maxLineWidth = this.getWidestLine()
		this.size = {};
		this.size.width = maxLineWidth;
		let lines = this.parseText()
		this.size.height = this.properties.fontSize * lines.length;
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	setFontSize(value, save = true) {
		let fontFamily = this.properties.font.split(" ")[1]
		this.properties.font = `${value}px ${fontFamily}`
		this.properties.fontSize = value
		let lines = this.parseText()
		this.size.height = this.properties.fontSize * lines.length;
		this.size.width = this.getWidestLine()
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	setAligngment(value, save = true) {
		this.properties._textAlign = value
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	getFontSize() {
		return this.properties.fontSize
	}

	getAlignment() {
		return this.properties._textAlign
	}

	getWidestLine() {
		let maxLineWidth = 0
		let lines = this.parseText()
		for (let line of lines) {
			let lineWidth = this.getTextWidthOnCanvas(line)
			if (lineWidth > maxLineWidth) maxLineWidth = lineWidth
		}
		return maxLineWidth
	}

	parseText() {
		let lines = this.text.split("\n")
		let longestLineWidth = 0
		let longestLine = lines[0]
		for (let line of lines) {
			if (this.getTextWidthOnCanvas(line) > longestLineWidth) {
				longestLineWidth = this.getTextWidthOnCanvas(line)
				longestLine = line
			}
		}
		if (this.properties._textAlign) {
			switch (this.properties._textAlign) {
				case "Center":
					break
				case "Left":
					for (let i = 0; i < lines.length; i++) {
						let line = lines[i]
						if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
							let paddingSize = this.getPaddingSize(line, longestLine)
							line = line + makeSpace(paddingSize)
							lines[i] = line
						}
					}
					break
				case "Right":
					for (let i = 0; i < lines.length; i++) {
						let line = lines[i]
						if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
							let paddingSize = this.getPaddingSize(line, longestLine)
							line = makeSpace(paddingSize) + line
							lines[i] = line
						}
					}
					break
			}
		}
		
		return lines
	}

	getPaddingSize(line, longestLine) {
		let longWidth = this.getTextWidthOnCanvas(longestLine)
		let shortWidth = this.getTextWidthOnCanvas(line)
		let widthOfSpace = this.getTextWidthOnCanvas(this.thinWhiteSpace)
		let paddingSize = (longWidth - shortWidth) / widthOfSpace
		return Math.round(paddingSize)
	}

	getTextWidthOnCanvas(text) {
		const tmpCanvas = document.createElement("canvas");
		const tmpCtx = tmpCanvas.getContext("2d");
		this.setProperties(tmpCtx);
		return tmpCtx.measureText(text).width
	}

	draw(ctx, hitRegion = false) {
		const center = this.center ? this.center : { x: 0, y: 0 };
		let left, top, width, fontSize;

		left = center.x - this.size.width / 2;
		top = center.y - this.size.height / 2;
		width = this.size.width;

		fontSize = this.properties.fontSize

		let lines = this.parseText()

		ctx.save();
		this.setProperties(ctx);

		if (hitRegion) {
			let row = 0
			for (let line of lines) {
				ctx.font = `${fontSize}px Arial`
				ctx.beginPath();
				const rgb = Shape.getHitRGB(this.id);
				ctx.fillStyle = rgb;
				ctx.strokeStyle = rgb;
				ctx.lineWidth = this.options.strokeWidth + this.properties.dilation;
				ctx.fillText(line, left + width / 2, (top + fontSize / 2) + row * fontSize);
				ctx.strokeText(line, left + width / 2, (top + fontSize / 2) + row * fontSize);
				row++
			}
		} else {
			let row = 0
			for (let line of lines) {
				ctx.font = `${fontSize}px Arial`
				ctx.beginPath();
				if (this.options.fill) {
					ctx.fillStyle = this.options.fillColor;
					ctx.fillText(line, left + width / 2, (top + fontSize / 2) + row * fontSize);
				}
				if (this.options.stroke) {
					ctx.strokeStyle = this.options.strokeColor;
					ctx.lineWidth = this.options.strokeWidth;
					ctx.strokeText(line, left + width / 2, (top + fontSize / 2) + row * fontSize);
				}
				row++
			}
		}

		ctx.restore();
	}
}

ShapeFactory.registerShape(Text, "Text");