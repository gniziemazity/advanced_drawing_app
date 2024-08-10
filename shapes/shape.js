class Shape {
	constructor(options) {
		// never deliberately called
		this.id = Shape.generateId();
		this.options = options;
		this.center = null;
		this.size = null;
		this.rotation = 0;
		this.selected = false;
	}

	static generateId() {
		return Math.floor(16777216 * Math.random());
	}

	serialize() {
		throw new Error("serialize method must be implemented");
	}

	setCenter(center) {
		this.center = center;
	}

	setWidth(width) {
		throw new Error("setWidth method must be implemented");
	}

	setHeight(height) {
		throw new Error("setWidth method must be implemented");
	}

	setRotation(angle) {
		this.rotation = angle;
		this.rotation %= 360;
	}

	rotateBy(angle) {
      this.rotation +=angle;
	  this.rotation %= 360;
	}

	rotateCanvas(ctx){
		if (this.center) {
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate(-(this.rotation * Math.PI) / 180);
			ctx.translate(-this.center.x, -this.center.y);
		}
	}

	resetCanvasRotation(ctx){
		if (this.center) {
			ctx.translate(this.center.x, this.center.y);
			ctx.rotate((this.rotation * Math.PI) / 180);
			ctx.translate(-this.center.x, -this.center.y);
		}
	}

	setSize(width, height) {
		this.setWidth(width);
		this.setHeight(height);
	}

	changeWidth(prevWidth, ratio) {
		this.setWidth(prevWidth * ratio);
	}

	changeHeight(prevHeight, ratio) {
		this.setHeight(prevHeight * ratio);
	}

	changeSize(prevWidth, prevHeight, ratioWidth, ratioHeight) {
		this.setSize(prevWidth * ratioWidth, prevHeight * ratioHeight);
	}

	recenter() {
		const points = this.getPoints();
		this.center = Vector.midVector(points);
		this.size = getSize(points);
		for (const point of points) {
			const newPoint = Vector.subtract(point, this.center);
			point.x = newPoint.x;
			point.y = newPoint.y;
		}
		this.setPoints(points);
	}

	static getHitRGB(id) {
		const red = (id & 0xff0000) >> 16;
		const green = (id & 0x00ff00) >> 8;
		const blue = id & 0x0000ff;
		return `rgb(${red},${green},${blue})`;
	}

	applyHitRegionStyles(ctx, dilation = 10) {
		const rgb = Shape.getHitRGB(this.id);
		ctx.lineCap = this.options.lineCap;
		ctx.lineJoin = this.options.lineJoin;
		ctx.fillStyle = rgb;
		ctx.strokeStyle = rgb;
		ctx.lineWidth = this.options.strokeWidth + dilation;
		// always doing a fill because of the poll during the live stream
		// most people seem to prefer selecting an object with no fill, when clicking on it
		//if (this.options.fill) {
		ctx.fill();
		//}
		if (this.options.stroke) {
			ctx.stroke();
		}
	}

	applyStyles(ctx) {
		ctx.save();
		ctx.strokeStyle = this.options.strokeColor;
		ctx.fillStyle = this.options.fillColor;
		ctx.lineWidth = this.options.strokeWidth;
		ctx.lineCap = this.options.lineCap;
		ctx.lineJoin = this.options.lineJoin;
		if (this.options.fill) {
			ctx.fill();
		}
		if (this.options.stroke) {
			ctx.stroke();
		}
		ctx.restore();
	}

	getPoints() {
		throw new Error("getPoints method must be implemented");
	}

	setPoints(points) {
		throw new Error("setPoints method must be implemented");
	}

	drawHitRegion(ctx) {
		throw new Error("draw method must be implemented");
	}

	draw(ctx) {
		throw new Error("draw method must be implemented");
	}
}

function secondCornerMoveCallback(e, startPosition, currentShape) {
	const mousePosition = viewport.getAdjustedPosition(Vector.fromOffsets(e));
	let secondCornerPosition = mousePosition;
	if (e.shiftKey) {
		const deltaX = startPosition.x - mousePosition.x;
		const deltaY = startPosition.y - mousePosition.y;
		const minDelta = Math.min(Math.abs(deltaX), Math.abs(deltaY));
		secondCornerPosition = new Vector(
			startPosition.x - Math.sign(deltaX) * minDelta,
			startPosition.y - Math.sign(deltaY) * minDelta
		);
	}
	currentShape.setCorner2(secondCornerPosition);

	viewport.drawShapes([...shapes, currentShape]);
}

function secondCornerUpCallback(e, currentShape, moveCallback, upCallback) {
	viewport.canvas.removeEventListener("pointermove", moveCallback);
	viewport.canvas.removeEventListener("pointerup", upCallback);

	currentShape.recenter();
	if (currentShape.size.width > 0 && currentShape.size.height > 0) {
		shapes.push(currentShape);
		HistoryTools.record(shapes);
	}
}
