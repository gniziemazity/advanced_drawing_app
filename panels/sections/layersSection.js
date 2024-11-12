class LayersSection extends PanelSection {
	constructor() {
		super("Layers", { sectionClass: "two_col_grid layer" });
		viewport.addEventListener("layersChanged", (e) => {
			this.populateLayers(e.detail.count);
		});
		viewport.addEventListener("layerSelected", (e) => {
			this.selectLayer(e.detail.layerIndex);
		});
	}

	addContent(holderDiv) {
		this.populateLayers(1);
	}

	addTitleContent(holderDiv) {
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "addLayerBtn",
				onclick: (e) => {
					e.stopPropagation();
					LayerTools.addLayer();
				},
				title: "Add Layer",
				iconName: "plus",
			})
		);
	}

	populateLayers(count) {
		this.sectionContent.innerHTML = "";

		for (let i = 1; i <= count; i++) {
			const props = {
				type: "radio",
				id: "layer_" + i + "_radio",
				name: "layerRadio",
				class: "radio",
				onchange: () => LayerTools.selectLayer(i - 1),
			};
			if (viewport.selectedLayer == viewport.layers[i - 1]) {
				props.checked = true;
				props.labelClass = "highlight-bg";
			}
			this.sectionContent.appendChild(
				createInputWithLabel("layer " + i, props)
			);

			if (count > 1) {
				this.sectionContent.appendChild(
					createButtonWithIcon({
						id: "layer_" + i + "_removeBtn",
						onclick: () => LayerTools.removeLayer(i - 1),
						title: "Remove Layer",
						iconName: "trash",
					})
				);
			} else {
				this.sectionContent.appendChild(createDOMElement("div", {}, ""));
			}
		}
	}

	selectLayer(layerIndex) {
		this.sectionContent
			.querySelectorAll(".radio-button-button")
			.forEach((label) => {
				label.style.backgroundColor = "transparent";
			});
		const radio = document.getElementById(
			"layer_" + (layerIndex + 1) + "_radio"
		);
		radio.checked = true;
		const label = this.sectionContent.querySelector(
			`label[for="${radio.id}"]`
		);
		label.style.backgroundColor = "var(--highlight-color)";
	}
}
