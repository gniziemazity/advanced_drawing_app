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
			xOffsets: {},
			textBaseline: "middle",
			lineJoin: "round",
			lineCap: "round",
			dilation: 20, //for hit test
		};

		this.numberClicked = 0;

		this.thinWhiteSpace = String.fromCharCode(8202); // helps in aligning text finely

		this.setText("Enter Text Here", false);
	}

	static load(data) {
		const text = new Text();
		text.id = data.id;
		text.options = JSON.parse(JSON.stringify(data.options));
		text.properties = JSON.parse(
			JSON.stringify({ ...text.properties, ...data?.properties })
		);
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
			properties: this.properties,
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
		let maxLineWidth = this.getWidestLine();
		this.size = {};
		this.size.width = maxLineWidth;
		let lines = this.parseText();
		this.size.height = this.properties.fontSize * lines.length;
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	setFontSize(value, save = true) {
		let fontFamily = this.properties.font.split(" ")[1];
		this.properties.font = `${value}px ${fontFamily}`;
		this.properties.fontSize = value;
		let lines = this.parseText();
		this.size.height = this.properties.fontSize * lines.length;
		this.size.width = this.getWidestLine();
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	setAlignment(value, save = true) {
		this.properties._textAlign = value;
		viewport.dispatchEvent(
			new CustomEvent("textChanged", { detail: { shape: this, save } })
		);
	}

	getFontSize() {
		return this.properties.fontSize;
	}

	getAlignment() {
		return this.properties._textAlign;
	}

	getWidestLine() {
		let maxLineWidth = 0;
		let lines = this.parseText();
		for (let line of lines) {
			let lineWidth = this.getTextWidthOnCanvas(line);
			if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
		}
		return maxLineWidth;
	}

	parseText() {
		let lines = this.text.split("\n");
		let longestLineWidth = 0;
		for (let line of lines) {
			if (this.getTextWidthOnCanvas(line) > longestLineWidth) {
				longestLineWidth = this.getTextWidthOnCanvas(line);
			}
		}
		if (this.properties._textAlign) {
			switch (this.properties._textAlign) {
				case "Center":
					this.properties.xOffsets = {};
					break;
				case "Left":
					for (let i = 0; i < lines.length; i++) {
						let line = lines[i];
						if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
							let offsetSize =
								longestLineWidth - this.getTextWidthOnCanvas(line);
							this.properties.xOffsets[i] = -offsetSize / 2;
						}
					}
					break;
				case "Right":
					for (let i = 0; i < lines.length; i++) {
						let line = lines[i];
						if (this.getTextWidthOnCanvas(line) < longestLineWidth) {
							let offsetSize =
								longestLineWidth - this.getTextWidthOnCanvas(line);
							this.properties.xOffsets[i] = offsetSize / 2;
						}
					}
					break;
			}
		}

		return lines;
	}

	getPaddingSize(line, longestLine) {
		let longWidth = this.getTextWidthOnCanvas(longestLine);
		let shortWidth = this.getTextWidthOnCanvas(line);
		let widthOfSpace = this.getTextWidthOnCanvas(this.thinWhiteSpace);
		let paddingSize = (longWidth - shortWidth) / widthOfSpace;
		return Math.round(paddingSize);
	}

	getIndexOfTextAtPoint(point, line) {
		let index = 0;
		let left = this.center.x - this.getTextWidthOnCanvas(line) / 2;
		let lines = this.parseText();
		let xOffset = 0;
		for (let i = 0; i < lines.length; i++) {
			if (line === lines[i]) {
				xOffset = this.properties.xOffsets[i] || 0;
			}
		}

		while (index < line.length) {
			let offset =
				left +
				this.getTextWidthOnCanvas(line.slice(0, index + 1)) +
				xOffset;
			if (offset >= point.x) {
				if (
					// point is at left side of character
					point.x -
					left -
					this.getTextWidthOnCanvas(line.slice(0, index)) -
					xOffset <
					this.getTextWidthOnCanvas(line[index]) / 2
				) {
					index--;
				}
				break;
			}
			index++;
		}

		return index;
	}

	getTextWidthOnCanvas(text) {
		return this.getTextMeasure(text).width;
	}

	getTextMeasure(text) {
		const tmpCanvas = document.createElement("canvas");
		const tmpCtx = tmpCanvas.getContext("2d");
		this.setProperties(tmpCtx);
		return tmpCtx.measureText(text);
	}

	click() {
		if (Cursor.isEditing) {
			return;
		}

		this.numberClicked += 1;
		if (this.numberClicked % 2 !== 0) {
			this.select();
		}
	}

	unselect(save = true) {
		this.numberClicked = 0;
		this.selected = false;
		this.gizmo = null;
		TextHighlight.reset()

		viewport.dispatchEvent(
			new CustomEvent("shapeUnselected", {
				detail: { shape: this, save },
			})
		);
	}

	getRowOfLineAndIndexAtPoint(point) {
		let shapeHeight = this.size.height;
		let top = this.center.y - shapeHeight / 2;

		let lines = this.parseText();

		let ratioOnYaxis = Math.abs((point.y - top) / shapeHeight);
		let row = Math.floor(ratioOnYaxis * lines.length);

		let line = lines[row] || "";

		let index = this.getIndexOfTextAtPoint(point, line);
		return [row, index]
	}

	draw(ctx, hitRegion = false) {
		const center = this.center ? this.center : { x: 0, y: 0 };
		let left, top, fontSize;

		top = center.y - this.size.height / 2;

		fontSize = this.properties.fontSize;

		let lines = this.parseText();

		ctx.save();
		this.setProperties(ctx);

		if (hitRegion) {
			let row = 0;
			for (let line of lines) {
				let xOffset = this.properties.xOffsets[row] || 0;
				const hitTestRectTop = top + row * fontSize
				let width = this.getTextWidthOnCanvas(line)

				left = center.x + xOffset - width / 2;

				ctx.beginPath();
				// use rect for hit region, fillText causes some annoying
				// missess when trying to click on text
				ctx.rect(left, hitTestRectTop, width, fontSize);
				this.applyHitRegionStyles(ctx, 5)

				row++;
			}
		} else {
			let row = 0;
			for (let line of lines) {
				let xOffset = this.properties.xOffsets[row] || 0;
				left = center.x + xOffset;
				ctx.beginPath();
				if (this.options.fill) {
					ctx.fillStyle = this.options.fillColor;
					ctx.fillText(line, left, top + fontSize / 2 + row * fontSize);
				}
				if (this.options.stroke) {
					ctx.strokeStyle = this.options.strokeColor;
					ctx.lineWidth = this.options.strokeWidth;
					ctx.strokeText(line, left, top + fontSize / 2 + row * fontSize);
				}
				row++;
			}
		}

		ctx.restore();
		TextHighlight.displayHighlight()
	}
}

ShapeFactory.registerShape(Text, "Text");
