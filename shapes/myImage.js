class MyImage extends Shape {
	constructor(img, options) {
		super(options);
		this.img = img;
		this.size = { width: img.width, height: img.height };

		const tmpCanvas = document.createElement("canvas");
		tmpCanvas.width = img.width;
		tmpCanvas.height = img.height;
		const tmpCtx = tmpCanvas.getContext("2d");
		tmpCtx.drawImage(img, 0, 0);
		this.base64 = tmpCanvas.toDataURL();

		this.filters = [];
	}

	static load(data) {
		const myImage = new MyImage(new Image());
		myImage.id = data.id;
		myImage.img.src = data.base64;
		myImage.base64 = data.base64;
		myImage.options = JSON.parse(JSON.stringify(data.options));
		myImage.center = Vector.load(data.center);
		myImage.size = data.size;
		myImage.selected = data.selected;
		myImage.rotation = data.rotation ?? 0;
		if (data.filters) {
			for (const filterData of data.filters) {
				switch (filterData.type) {
					case "Chroma":
						myImage.filters.push(Chroma.load(filterData));
						break;
				}
			}
		}
		return myImage;
	}

	serialize() {
		return {
			type: "MyImage",
			id: this.id,
			options: JSON.parse(JSON.stringify(this.options)),
			center: this.center,
			size: JSON.parse(JSON.stringify(this.size)),
			base64: this.base64,
			selected: this.selected,
			rotation: this.rotation,
			filters: this.filters.map((filter) => filter.serialize()),
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
		this.size.width = width;
	}

	_setHeight(height) {
		this.size.height = height;
	}

	draw(ctx, hitRegion = false) {
		if (!this.img.complete) {
			// prevent errors in drawing image when it is not
			// fully loaded.
			setTimeout(() => {
				this.draw(ctx, hitRegion);
			}, 50);
			return;
		}

		const center = this.center ? this.center : { x: 0, y: 0 };
		let left, top, width, height;

		left = center.x - this.size.width / 2;
		top = center.y - this.size.height / 2;
		width = this.size.width;
		height = this.size.height;

		if (hitRegion) {
			ctx.beginPath();
			ctx.rect(left, top, width, height);
			this.applyHitRegionStyles(ctx);
		} else {
			ctx.save();
			ctx.translate(center.x, center.y);
			ctx.scale(Math.sign(width), Math.sign(height));
			ctx.beginPath();
			const filteredImage = this.filters.reduce(
				(img, filter) => filter.apply(img),
				this.img
			);
			ctx.drawImage(filteredImage, -width / 2, -height / 2, width, height);
			this.applyStyles(ctx);
			ctx.restore();
		}
	}
}

ShapeFactory.registerShape(MyImage, "MyImage");
