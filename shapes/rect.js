class Rect extends Shape {
	constructor(corner1, options) {
		super(options);
		//take out corner 1 and corner 2 to
		//the drawing tool itself (it will need its own object)
		this.corner1 = corner1;
		this.corner2 = corner1;
	}

	static load(data) {
		console.log(data);
		const rect = new Rect();
		rect.id = data.id;
		rect.options = JSON.parse(JSON.stringify(data.options));
		rect.center = Vector.load(data.center);
		rect.size = data.size;
		rect.selected = data.selected;
		rect.rotation = data.rotation ?? 0;
		return rect;
	}

	serialize() {
		console.log(this.size);
		return {
			type: "Rect",
			id: this.id,
			options: JSON.parse(JSON.stringify(this.options)),
			center: this.center,
			size: this.size,
			selected: this.selected,
			rotation: this.rotation,
		};
	}

	setCorner2(corner2) {
		this.corner2 = corner2;
	}

	getPoints() {
		if (this.size) {
			return [
				new Vector(-this.size.width / 2, -this.size.height / 2),
				new Vector(-this.size.width / 2, this.size.height / 2),
				new Vector(this.size.width / 2, this.size.height / 2),
				new Vector(this.size.width / 2, -this.size.height / 2),
			];
		} else {
			return [this.corner1, this.corner2];
		}
	}

	setPoints(points) {
		//this.corner1 = points[0];
		//this.corner2 = points[1];
	}

	setWidth(width) {
		this.size.width = width;
	}

	setHeight(height) {
		this.size.height = height;
	}

	draw(ctx, hitRegion = false) {
		const center = this.center ? this.center : { x: 0, y: 0 };
		let left, top, width, height;
		if (this.size) {
			left = center.x - this.size.width / 2;
			top = center.y - this.size.height / 2;
			width = this.size.width;
			height = this.size.height;
		} else {
			const minX = Math.min(this.corner1.x, this.corner2.x);
			const minY = Math.min(this.corner1.y, this.corner2.y);
			width = Math.abs(this.corner1.x - this.corner2.x);
			height = Math.abs(this.corner1.y - this.corner2.y);
			left = minX + center.x;
			top = minY + center.y;
		}
		ctx.beginPath();
		ctx.rect(left, top, width, height);

		if (hitRegion) {
			this.applyHitRegionStyles(ctx);
		} else {
			this.applyStyles(ctx);
		}
	}
}

ShapeFactory.registerShape(Rect, "Rect");
