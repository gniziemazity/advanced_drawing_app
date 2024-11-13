class Line extends Path {
	addPoint(point) {
		this.points = [this.points[0], point];
	}
}
