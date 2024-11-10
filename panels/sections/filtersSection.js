class FiltersSection extends PanelSection {

    constructor() {
        super("Filters", { visible: false, sectionClass: "three_col_grid" });
    }
    
    addContent(holderDiv) {
        //Handled in the populatelayers
    }

	addTitleContent(holderDiv) {
        holderDiv.appendChild(
			createButtonWithIcon({
				id: "addFilterBtn",
				onclick: this.addChromaFilter,
				title: "Add Chroma Filter",
				iconName: "plus",
			})
		);
    }
	
	populateFilters(filters) {
		this.sectionContent.innerHTML = "";

		for (let i = 0; i < filters.length; i++) {
			const filter = filters[i];
			this.sectionContent.appendChild(
				createDOMElement("input", {
					id: "colorKey_" + i,
					onchange:
						(e) => this.changeChromaKey(i, e.currentTarget.value),
					title: "Color Key",
					value: filter.getHexColor(),
					type: "color",
				})
			);
			this.sectionContent.appendChild(
				createDOMElement("input", {
					id: "threshold_" + i,
					max: "255",
					min: "0",
					onchange:
						(e) => this.changeChromaThreshold(i, e.currentTarget.value),
					title: "Threshold",
					type: "range",
					value: filter.threshold,
					style: "width: var(--input-medium-width);",
				})
			);
			this.sectionContent.appendChild(
				createButtonWithIcon({
					onclick: () => this.removeFilter(i),
					title: "Remove Filter",
					iconName: "minus",
				})
			);
		}
	}

	changeChromaKey(index, value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.filters[index].setKeyFromHex(value), save);
	}

	changeChromaThreshold(index, value, save = true) {
		viewport
			.getSelectedShapes()
			.forEach((s) => s.filters[index].setThreshold(value), save);
	}

	addChromaFilter() {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 1 && selectedShapes[0].filters) {
			selectedShapes[0].filters.push(new Chroma());
		}
		propertiesPanel.updateDisplay();
	}

	removeFilter(index) {
		const selectedShapes = viewport.getSelectedShapes();
		if (selectedShapes.length == 1 && selectedShapes[0].filters) {
			selectedShapes[0].filters.splice(index, 1);
		}
		propertiesPanel.updateDisplay();
	}
}