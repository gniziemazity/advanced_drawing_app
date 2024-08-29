class TransformTools {
	/**
	 * Send a shape to back by one level.
	 */
	static sendBack() {
		const currentIndex = Viewport.getSelectedIndex();
		const newIndex = currentIndex - 1;

		if (newIndex < 0) {
			throw new Error("Can't move the shape back!");
		}

		moveItem(viewport.shapes, currentIndex, newIndex);
		HistoryTools.record(viewport.shapes);
		viewport.drawShapes();
	}

	/**
	 * Bring a shape to front by one level.
	 */
	static bringFront() {
		const count = viewport.shapes.length;
		const currentIndex = Viewport.getSelectedIndex();
		const newIndex = currentIndex + 1;

		if (newIndex >= count) {
			throw new Error("Can't move the shape front!");
		}

		moveItem(viewport.shapes, currentIndex, newIndex);
		HistoryTools.record(viewport.shapes);
		viewport.drawShapes();
	}

	/**
	 * Send a shape behind all shapes.
	 */
	static sendBackward() {
		const currentIndex = Viewport.getSelectedIndex();
		const newIndex = 0;

		if (currentIndex === newIndex) {
			throw new Error("Can't move the shape back!");
		}

		moveItem(viewport.shapes, currentIndex, newIndex);
		HistoryTools.record(viewport.shapes);
		viewport.drawShapes();
	}

	/**
	 * Bring a shape in front of all shapes.
	 */
	static bringForward() {
		const count = viewport.shapes.length;
		const currentIndex = Viewport.getSelectedIndex();
		const newIndex = count - 1;

		if (currentIndex === newIndex) {
			throw new Error("Can't move the shape front!");
		}

		moveItem(viewport.shapes, currentIndex, newIndex);
		HistoryTools.record(viewport.shapes);
		viewport.drawShapes();
	}
}
