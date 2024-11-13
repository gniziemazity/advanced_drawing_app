class Oval extends Shape {
	constructor(center, size, options) {
		super(options);

		this.center = center;
		this.size = size;
		this.options = options;

		this.rotation = 0;
	}

	static load(data) {
		const oval = new Oval();
		oval.id = data.id;

		oval.center = Vector.load(data.center);
		oval.size = data.size;
		oval.options = JSON.parse(JSON.stringify(data.options));

		oval.rotation = data.rotation ?? 0;

		oval.selected = data.selected;

		return oval;
	}

	serialize() {
		return {
			type: "Oval",
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

		ctx.beginPath();
		const radiusX = Math.abs(this.size.width / 2);
		const radiusY = Math.abs(this.size.height / 2);

		ctx.ellipse(center.x, center.y, radiusX, radiusY, 0, 0, 2 * Math.PI);

		if (hitRegion) {
			this.applyHitRegionStyles(ctx);
		} else {
			this.applyStyles(ctx);
		}
	}
}

ShapeFactory.registerShape(Oval, "Oval");
