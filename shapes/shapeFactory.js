class ShapeFactory {
	static #available = {
		Path: { shape: Path },
		Rect: { shape: Rect },
		Oval: { shape: Oval },
		Text: { shape: Text },
		MyImage: { shape: MyImage },
	};

	static loadShape(shapeData, stageProperties) {
		const cls = this.#available[shapeData.type].shape;
		const shape = cls.load(shapeData, stageProperties);

		return shape;
	}

	static loadShapes(data) {
		const loadedShapes = [];
		for (const shapeData of data) {
			const shape = this.loadShape(shapeData, stageProperties);
			loadedShapes.push(shape);
		}

		return loadedShapes;
	}
}
