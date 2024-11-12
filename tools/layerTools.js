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

		viewport.dispatchEvent(
			new CustomEvent("layerSelected", {
				detail: { layerIndex: index },
			})
		);
	}
}
