class Handle {
	static size = 10;
	static TYPES = {
		TOP: "top",
		RIGHT: "right",
		BOTTOM: "bottom",
		LEFT: "left",
		TOP_LEFT: "topLeft",
		TOP_RIGHT: "topRight",
		BOTTOM_LEFT: "bottomLeft",
		BOTTOM_RIGHT: "bottomRight",
		ROTATE: "rotate",
	};

	constructor(center, type, attachedHandle = null) {
		this.center = center;
		this.id = Shape.generateId();
		this.type = type;
		this.attachedHandle = attachedHandle;
	}

	draw(ctx, hitRegion = false) {
		const dilation = hitRegion ? 5 : 0;
		const size = dilation + Handle.size / viewport.zoom;
		ctx.fillStyle = hitRegion ? Shape.getHitRGB(this.id) : "black";
		ctx.strokeStyle = hitRegion ? Shape.getHitRGB(this.id) : "white";
		ctx.lineWidth = 2 / viewport.zoom;
		ctx.fillRect(
			this.center.x - size / 2,
			this.center.y - size / 2,
			size,
			size
		);
		if (!hitRegion) {
			ctx.strokeRect(
				this.center.x - size / 2,
				this.center.y - size / 2,
				size,
				size
			);
			if (this.attachedHandle) {
				ctx.moveTo(this.center.x, this.center.y);
				ctx.lineTo(
					this.attachedHandle.center.x,
					this.attachedHandle.center.y
				);
				ctx.strokeStyle = "black";
				ctx.stroke();
			}
		}
	}
}
