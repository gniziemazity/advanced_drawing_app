class LayerTools {
	static addLayer() {
		viewport.addLayer();
	}

	static removeLayer(index) {
		viewport.removeLayerByIndex(index);
	}

	static selectLayer(index) {
		viewport.selectLayerByIndex(index);
	}
}
