class TransformTools {
	/**
	 * Send a shape to back by one level.
	 */
	static sendBack() {
		const currentIndex = ShapeTools.getSelectedIndex();
		const newIndex = currentIndex - 1;

		if (newIndex < 0) {
			throw new Error("Can't move the shape back!");
		}

		moveItem(shapes, currentIndex, newIndex);
		HistoryTools.record();
		viewport.drawShapes();
	}

	/**
	 * Bring a shape to front by one level.
	 */
	static bringFront() {
		const count = shapes.length;
		const currentIndex = ShapeTools.getSelectedIndex();
		const newIndex = currentIndex + 1;

		if (newIndex >= count) {
			throw new Error("Can't move the shape front!");
		}

		moveItem(shapes, currentIndex, newIndex);
		HistoryTools.record();
		viewport.drawShapes();
	}

	/**
	 * Send a shape behind all shapes.
	 */
	static sendBackward() {
		const currentIndex = ShapeTools.getSelectedIndex();
		const newIndex = 0;

		moveItem(shapes, currentIndex, newIndex);
		HistoryTools.record();
		viewport.drawShapes();
	}

	/**
	 * Bring a shape in front of all shapes.
	 */
	static bringForward() {
		const count = shapes.length;
		const currentIndex = ShapeTools.getSelectedIndex();
		const newIndex = count - 1;

		moveItem(shapes, currentIndex, newIndex);
		HistoryTools.record();
		viewport.drawShapes();
	}
}
