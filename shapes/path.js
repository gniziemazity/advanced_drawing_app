class Path extends Shape {
	constructor(startPoint, options) {
		super(options);
		this.points = [startPoint];
	}

	static load(data) {
		const path = new Path();
		path.id = data.id;

		path.center = Vector.load(data.center);
		path.size = data.size;
		path.options = JSON.parse(JSON.stringify(data.options));

		path.points = data.points.map((p) => Vector.load(p));

		path.rotation = data.rotation ?? 0;

		path.selected = data.selected;

		return path;
	}

	serialize() {
		return {
			type: "Path",
			id: this.id,
			center: this.center,
			size: JSON.parse(JSON.stringify(this.size)),
			points: JSON.parse(JSON.stringify(this.points)),
			options: JSON.parse(JSON.stringify(this.options)),
			rotation: this.rotation,
			selected: this.selected,
		};
	}

	addPoint(point) {
		this.points.push(point);
	}

	getPoints() {
		return this.points;
	}

	setPoints(points) {
		this.points = points;
	}

	_setWidth(newWidth) {
		const box = BoundingBox.fromPoints(this.points);
		let flip = 1;

		flip = Math.sign(newWidth) !== Math.sign(this.size.width) ? -1 : 1;
		const eps = 0.0001;
		if (box.width == 0) {
			console.error("Size 0 problem!");
		}
		let width = box.width == 0 ? eps : box.width;

		const ratio = (flip * Math.abs(newWidth)) / width;

		for (const point of this.points) {
			point.x *= ratio;
		}
		this.size.width = newWidth;
	}

	_setHeight(newHeight) {
		const box = BoundingBox.fromPoints(this.points);
		let flip = 1;

		flip = Math.sign(newHeight) !== Math.sign(this.size.height) ? -1 : 1;

		const eps = 0.0001;
		if (box.height == 0) {
			console.error("Size 0 problem!");
		}
		const height = box.height == 0 ? eps : box.height;
		const ratio = (flip * Math.abs(newHeight)) / height;
		for (const point of this.points) {
			point.y *= ratio;
		}
		this.size.height = newHeight;
	}

	draw(ctx, hitRegion = false) {
		const center = this.center ? this.center : { x: 0, y: 0 };
		ctx.beginPath();
		ctx.moveTo(this.points[0].x + center.x, this.points[0].y + center.y);
		for (let i = 1; i < this.points.length; i++) {
			ctx.lineTo(this.points[i].x + center.x, this.points[i].y + center.y);
		}
		if (hitRegion) {
			this.applyHitRegionStyles(ctx);
		} else {
			this.applyStyles(ctx);
		}
	}
}

ShapeFactory.registerShape(Path, "Path");
