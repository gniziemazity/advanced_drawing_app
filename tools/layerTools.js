class LayerTools {
	static addLayer() {
		viewport.addLayer();
		LayerTools.selectLayer(viewport.layers.length - 1);
	}

	static removeLayer(index) {
		viewport.removeLayerByIndex(index);
		LayerTools.selectLayer(Math.max(0, index - 1));
	}

	static selectLayer(index) {
		viewport.selectLayerByIndex(index);

		PropertiesPanel.layersSection
			.querySelectorAll(".radio-button-button")
			.forEach((label) => {
				label.style.backgroundColor = "transparent";
			});
		const radio = document.getElementById("layer_" + (index + 1) + "_radio");
		radio.checked = true;
		const label = PropertiesPanel.layersSection.querySelector(
			`label[for="${radio.id}"]`
		);
		label.style.backgroundColor = "var(--highlight-color)";
	}
}
