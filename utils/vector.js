class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static fromOffsets(info) {
		return new Vector(info.offsetX, info.offsetY);
	}

	static zero() {
		return new Vector(0, 0);
	}

	static load(data) {
		return new Vector(data.x, data.y);
	}

	static mid(vectors) {
		const minX = Math.min(...vectors.map((p) => p.x));
		const minY = Math.min(...vectors.map((p) => p.y));
		const maxX = Math.max(...vectors.map((p) => p.x));
		const maxY = Math.max(...vectors.map((p) => p.y));
		return new Vector(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2);
	}

	static add(v1, v2) {
		return v1.add(v2);
	}

	static subtract(v1, v2) {
		return v1.subtract(v2);
	}

	static magnitude(v) {
		return v.magnitude();
	}

	static scale(v, scalar) {
		return v.scale(scalar);
	}

	static min(v1, v2) {
		return v1.min(v2);
	}

	static max(v1, v2) {
		return v1.max(v2);
	}

	static dot(v1, v2) {
		return v1.dot(v2);
	}

	static topLeft(vectors) {
		let topLeft = vectors[0];
		for (const vector of vectors) {
			topLeft = topLeft.min(vector);
		}
		return topLeft;
	}

	static bottomRight(vectors) {
		let bottomRight = vectors[0];
		for (const vector of vectors) {
			bottomRight = bottomRight.max(vector);
		}
		return bottomRight;
	}

	static getSignedAngle(v1, v2) {
		return Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x);
	}

	static rotateAroundCenter(v, center, angle) {
		// Translate point to 0,0
		let translated = new Vector(v.x - center.x, v.y - center.y);

		let rotated = {
			x: translated.x * Math.cos(angle) - translated.y * Math.sin(angle),
			y: translated.x * Math.sin(angle) + translated.y * Math.cos(angle),
		};

		// Translate back to cente.x, center.y
		return new Vector(rotated.x + center.x, rotated.y + center.y);
	}

	static distance(v1, v2) {
		return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
	}

	add(v) {
		return new Vector(this.x + v.x, this.y + v.y);
	}

	subtract(v) {
		return new Vector(this.x - v.x, this.y - v.y);
	}

	magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	scale(scalar) {
		return new Vector(this.x * scalar, this.y * scalar);
	}

	min(v) {
		return new Vector(Math.min(this.x, v.x), Math.min(this.y, v.y));
	}

	max(v) {
		return new Vector(Math.max(this.x, v.x), Math.max(this.y, v.y));
	}

	dot(v) {
		return this.x * v.x + this.y * v.y;
	}

	direction() {
		return Math.atan2(this.y, this.x);
	}

	toPolar() {
		return { dir: this.direction(), mag: this.magnitude() };
	}

	toXY({ dir, mag }) {
		this.x = mag * Math.cos(dir);
		this.y = mag * Math.sin(dir);
	}
}
