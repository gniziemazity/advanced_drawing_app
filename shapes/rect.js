class Rect extends Shape {
	constructor(center, size, options) {
		super(options);

		this.center = center;
		this.size = size;
		this.options = options;

		this.rotation = 0;
	}

	static load(data) {
		const rect = new Rect();
		rect.id = data.id;

		rect.center = Vector.load(data.center);
		rect.size = data.size;
		rect.options = JSON.parse(JSON.stringify(data.options));

		rect.rotation = data.rotation ?? 0;

		rect.selected = data.selected;

		return rect;
	}

	serialize() {
		return {
			type: "Rect",
			id: this.id,
			center: this.center,
			size: JSON.parse(JSON.stringify(this.size)),
			options: JSON.parse(JSON.stringify(this.options)),
			rotation: this.rotation,
			selected: this.selected,
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
		const center = this.center ? this.center : { x: 0, y: 0 };

		const left = center.x - this.size.width / 2;
		const top = center.y - this.size.height / 2;

		ctx.beginPath();
		ctx.rect(left, top, this.size.width, this.size.height);

		if (hitRegion) {
			this.applyHitRegionStyles(ctx);
		} else {
			this.applyStyles(ctx);
		}
	}
}

ShapeFactory.registerShape(Rect, "Rect");
