class DocumentTools {
	static save() {
		const data = JSON.stringify(viewport.layers.map((l) => l.serialize()));

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
					viewport.setLayers(data);
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
			const myImage = new MyImage(img, PropertiesPanel.getValues());
			myImage.setCenter(
				new Vector(
					STAGE_PROPERTIES.left + STAGE_PROPERTIES.width / 2,
					STAGE_PROPERTIES.top + STAGE_PROPERTIES.height / 2
				)
			);
			viewport.addShapes(myImage);
		};
		img.src = e.target.result;
	}

	static do_export() {
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = viewport.canvasWidth;
      tmpCanvas.height = viewport.canvasHeight;
      const tmpCtx = tmpCanvas.getContext("2d");
      for(const layer of viewport.layers) {
         tmpCtx.drawImage(layer.canvas, 0, 0);
      }
		tmpCanvas.toBlob((blob) => {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = "image.png";
			a.click();
		});
	}
}
