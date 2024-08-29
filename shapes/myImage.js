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
		if (Gizmo.canFlip.x) {
			Gizmo.canFlip.x = false;
			width = Math.abs(width) * Math.sign(this.size.width) * -1;
		} else {
			width = Math.abs(width) * Math.sign(this.size.width);
		}
		this.size.width = width;
	}

	_setHeight(height) {
		if (Gizmo.canFlip.y) {
			Gizmo.canFlip.y = false;
			height = Math.abs(height) * Math.sign(this.size.height) * -1;
		} else {
			height = Math.abs(height) * Math.sign(this.size.height);
		}
		this.size.height = height;
	}

	draw(ctx, hitRegion = false) {
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
			ctx.drawImage(this.img, -width / 2, -height / 2, width, height);
			this.applyStyles(ctx);
			ctx.restore();
		}
	}
}

ShapeFactory.registerShape(MyImage, "MyImage");
