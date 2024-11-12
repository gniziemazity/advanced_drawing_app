class Shape {
	constructor(options) {
		this.id = Shape.generateId();
		this.center = null;
		this.size = null;
		this.options = options;
		this.rotation = 0;
		this.selected = false;
	}

	static generateId() {
		// revise at some point
		return Math.floor(16777216 * Math.random());
	}

	static getHitRGB(id) {
		const red = (id & 0xff0000) >> 16;
		const green = (id & 0x00ff00) >> 8;
		const blue = id & 0x0000ff;
		return `rgb(${red},${green},${blue})`;
	}

	serialize() {
		throw new Error("serialize method must be implemented");
	}

	select(save = true) {
		this.selected = true;
		this.gizmo = new Gizmo(this);
		viewport.dispatchEvent(
			new CustomEvent("shapeSelected", {
				detail: { shape: this, save },
			})
		);
	}

	unselect(save = true) {
		this.selected = false;
		this.gizmo = null;
		viewport.dispatchEvent(
			new CustomEvent("shapeUnselected", {
				detail: { shape: this, save },
			})
		);
	}

	setCenter(center, save = true) {
		this.center = center;
		this.gizmo?.updatePosition();
		viewport.dispatchEvent(
			new CustomEvent("positionChanged", {
				detail: { shape: this, position: center, save },
			})
		);
	}

	_setWidth(width) {
		throw new Error("setWidth method must be implemented");
	}

	_setHeight(height) {
		throw new Error("setWidth method must be implemented");
	}

	setSize(width, height, save = true) {
		this._setWidth(width);
		this._setHeight(height);
		this.gizmo?.updateSize();
		viewport.dispatchEvent(
			new CustomEvent("sizeChanged", {
				detail: { shape: this, size: { width, height }, save },
			})
		);
	}

	setRotation(angle, save = true) {
		this.rotation = angle;
		this.gizmo?.updateRotation();
		viewport.dispatchEvent(
			new CustomEvent("rotationChanged", {
				detail: { shape: this, rotation: angle, save },
			})
		);
	}

	setOptions(options, save = true) {
		for (const key in options) {
			if (this.options.hasOwnProperty(key)) {
				this.options[key] = options[key];
			}
		}
		viewport.dispatchEvent(
			new CustomEvent("optionsChanged", { detail: { shape: this, save } })
		);
	}

	recenter() {
		const points = this.getPoints();
		this.center = Vector.mid(points);
		this.size = BoundingBox.fromPoints(points);
		for (const point of points) {
			const newPoint = Vector.subtract(point, this.center);
			point.x = newPoint.x;
			point.y = newPoint.y;
		}
		this.setPoints(points);
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

	click() {
		if (this.selected) {
			this.unselect();
		} else {
			this.select();
		}
	}

	getPoints() {
		throw new Error("getPoints method must be implemented");
	}

	setPoints(points) {
		throw new Error("setPoints method must be implemented");
	}

	draw(ctx) {
		throw new Error("draw method must be implemented");
	}
}
