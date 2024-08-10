class ShapeFactory {
	static #available = {};

	static registerShape(classType, typeName) {
		this.#available[typeName] = { shape: classType };
	}

	static loadShape(shapeData, stageProperties) {
		const cls = this.#available[shapeData.type].shape;
		const shape = cls.load(shapeData, stageProperties);

		return shape;
	}

	static loadShapes(data, stageProperties) {
		const loadedShapes = [];
		for (const shapeData of data) {
			const shape = this.loadShape(shapeData, stageProperties);
			loadedShapes.push(shape);
		}

		return loadedShapes;
	}
}
