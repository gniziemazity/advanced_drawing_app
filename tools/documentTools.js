class DocumentTools {
	static save() {
		const data = JSON.stringify(
			shapes.map((s) => s.serialize(stageProperties))
		);

		const a = document.createElement("a");
		const file = new Blob([data], { type: "application/json" });
		a.href = URL.createObjectURL(file);
		a.download = "drawing.json";
		a.click();
	}

	static load() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json, .png";
		input.onchange = (e) => {
			const file = e.target.files[0];
			const reader = new FileReader();
			const extension = file.name.split(".").pop();

			reader.onload = (e) => {
				if (extension === "json") {
					const data = JSON.parse(e.target.result);
					shapes = ShapeFactory.loadShapes(data);
					drawShapes(shapes);
					HistoryTools.record(shapes);
				} else if (extension === "png") {
					DocumentTools.loadImage(e);
				}
			};

			if (extension === "json") {
				reader.readAsText(file);
			} else if (extension === "png") {
				reader.readAsDataURL(file);
			}
		};
		input.click();
	}

	static loadImage(e) {
		const img = new Image();
		img.onload = () => {
			const myImage = new MyImage(img, getOptions());
			myImage.setCenter(
				new Vector(
					stageProperties.left + stageProperties.width / 2,
					stageProperties.top + stageProperties.height / 2
				)
			);
			shapes.push(myImage);
			drawShapes(shapes);
			HistoryTools.record(shapes);
		};
		img.src = e.target.result;
	}

	static do_export() {
		const tmpCanvas = document.createElement("canvas");
		tmpCanvas.width = stageProperties.width;
		tmpCanvas.height = stageProperties.height;
		const tmpCtx = tmpCanvas.getContext("2d");
		tmpCtx.translate(-stageProperties.left, -stageProperties.top);
		for (const shape of shapes) {
			const isSelected = shape.selected;
			shape.selected = false;
			shape.draw(tmpCtx);
			shape.selected = isSelected;
		}
		tmpCanvas.toBlob((blob) => {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = "screenshot.png";
			a.click();
		});
	}
}
