class SizeField extends ObservableElement {
	constructor() {
		super();

		this.width = this.querySelector('[data-bind="width"]');
		this.height = this.querySelector('[data-bind="height"]');
		this.constrain = this.querySelector("#constrain");

		Events.shapeSelected.addEventListener("deselected", (e) => {
			const observableField = e.detail[this.fieldName];
			this.removeBindings(observableField);
			e.detail.unsubscribe(this.subscription);
		});

		Events.shapeSelected.addEventListener("selected", (e) => {
			const observableField = e.detail[this.fieldName];
			this.applyBindings(observableField);

			this.subscription = e.detail.subscribe((e) => {
				if (e.path === "size.width")
					this.width.value = Math.round(e.newValue);
				if (e.path === "size.height")
					this.height.value = Math.round(e.newValue);
			});
		});
	}

	onKeyUp(input, path, instance) {
		let newWidth = path === "width" ? input.value : instance.width;
		let newHeight = path === "height" ? input.value : instance.height;

		if (this.constrain.checked && path === "width") {
			const aspectRatio = instance.width / instance.height;
			const constrainedHeight = newWidth / aspectRatio;
			newHeight = constrainedHeight;
		}

		if (this.constrain.checked && path === "height") {
			const aspectRatio = instance.width / instance.height;
			const constrainedWidth = newHeight * aspectRatio;
			newWidth = constrainedWidth;
		}

		instance.width = Math.round(newWidth);
		instance.height = Math.round(newHeight);

		viewport.drawShapes(shapes);
	}
}
customElements.define("size-field", SizeField);

class CenterField extends ObservableElement {
	constructor() {
		super();

		this.x = this.querySelector('[data-bind="x"]');
		this.y = this.querySelector('[data-bind="y"]');

		Events.shapeSelected.addEventListener("deselected", (e) => {
			const observableField = e.detail[this.fieldName];
			this.removeBindings(observableField);
			e.detail.unsubscribe(this.subscription);
		});

		Events.shapeSelected.addEventListener("selected", (e) => {
			const observableField = e.detail[this.fieldName];
			this.applyBindings(observableField);

			this.x.value = Math.round(
				Number(observableField["x"]) - STAGE_PROPERTIES.left
			);
			this.y.value = Math.round(
				Number(observableField["y"]) - STAGE_PROPERTIES.top
			);

			this.subscription = e.detail.subscribe((e) => {
				if (e.path === "center") {
					this.x.value = Math.round(
						Number(e.newValue.x) - STAGE_PROPERTIES.left
					);
					this.y.value = Math.round(
						Number(e.newValue.y) - STAGE_PROPERTIES.top
					);
				}
			});
		});
	}
}
customElements.define("center-field", CenterField);

class RotationField extends ObservableElement {
	constructor() {
		super();

		this.fieldName = "";
		this.rotation = this.querySelector('[data-bind="rotation"]');

		Events.shapeSelected.addEventListener("deselected", (e) => {
			const observableField = e.detail;
			this.removeBindings(observableField);
			e.detail.unsubscribe(this.subscription);
		});

		Events.shapeSelected.addEventListener("selected", (e) => {
			const observableField = e.detail;
			this.applyBindings(observableField);

			this.rotation.value = Math.round(Number(observableField["rotation"]));

			this.subscription = e.detail.subscribe((e) => {
				if (e.path === "rotation") {
					this.rotation.value = Math.round(Number(e.newValue));
				}
			});
		});
	}
}
customElements.define("rotation-field", RotationField);
