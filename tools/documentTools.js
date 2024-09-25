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
               // To-Do reorganize the save file (stageProperties only once)
					resizeStage(
						data[0].stageProperties.width,
						data[0].stageProperties.height
					);
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
      const stageProperties = viewport.layers[0].stageProperties;
		tmpCanvas.width = stageProperties.width;
		tmpCanvas.height = stageProperties.height;
		const tmpCtx = tmpCanvas.getContext("2d");

      tmpCtx.translate(-stageProperties.left, -stageProperties.top);

      const allShapes = [];
      for (const layer of viewport.layers) {
         if (layer.type == Layer.TYPES.NORMAL) {
            allShapes.push(...layer.shapes);
         }
      }
         
      for (const item of allShapes) {
         rotateCanvas(item.center, item.rotation);
         item.draw(tmpCtx);
         rotateCanvas(item.center, -item.rotation);
      }
   
		
		tmpCanvas.toBlob((blob) => {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = "image.png";
			a.click();
		});

      // WARNING! DUPLICATE in LAYER
      function rotateCanvas(center, rotation) {
         if (rotation == 0) return;
         this.ctx.translate(center.x, center.y);
         this.ctx.rotate(rotation);
         this.ctx.translate(-center.x, -center.y);
      }
	}
}
