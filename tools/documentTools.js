class DocumentTools {
	static tools = [
		{
			name: "Save",
			func: DocumentTools.save,
			showButton: true,
			icon: "save",
			shortcut: new Shortcut({
				control: true,
				key: "s",
				action: DocumentTools.save,
			}),
		},
		{
			name: "Export",
			func: DocumentTools.do_export,
			showButton: true,
			icon: "export",
			shortcut: new Shortcut({
				control: true,
				key: "x",
				action: DocumentTools.do_export,
			}),
		},
		{
			name: "Load",
			func: DocumentTools.load,
			icon: "load",
			showButton: true,
			shortcut: new Shortcut({
				control: true,
				key: "l",
				action: DocumentTools.load,
			}),
		},
	];

	static registerShortcuts() {
		DocumentTools.tools.forEach((tool) => {
			const shortcut = tool.shortcut;
			if (shortcut) {
				shortcutManager.addShortcut(shortcut);
			}
		});
	}

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
		input.accept = ".json, .png, .jpg";
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
				} else {
					DocumentTools.loadImage(e);
				}
			};

			if (extension === "json") {
				reader.readAsText(file);
			} else if (extension === "png" || extension === "jpg") {
				reader.readAsDataURL(file);
			}
		};
		input.click();
	}

	static loadImage(e) {
		const img = new Image();
		img.onload = () => {
			const myImage = new MyImage(img, propertiesPanel.getValues());
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
			rotateCanvas(tmpCtx, item.center, item.rotation);
			item.draw(tmpCtx);
			rotateCanvas(tmpCtx, item.center, -item.rotation);
		}

		tmpCanvas.toBlob((blob) => {
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = "image.png";
			a.click();
		});
	}
}
