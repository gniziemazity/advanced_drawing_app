class ToolsPanel {
	constructor(holderDiv) {
		this.#addDocumentTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.addHistoryTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addShapeTools(holderDiv);
	}

	#addDocumentTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement("div", { id: "documentToolsHeader" }, "Document")
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{ id: "saveBtn", onclick: "DocumentTools.save()" },
				"Save"
			)
		);
		holderDiv.appendChild(createDOMElement("br"));
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{ id: "loadBtn", onclick: "DocumentTools.load()" },
				"Load"
			)
		);
		holderDiv.appendChild(createDOMElement("br"));
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{ id: "exportBtn", onclick: "DocumentTools.do_export()" },
				"Export"
			)
		);
	}

	addHistoryTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement("div", { id: "historyToolsHeader" }, "History")
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{ id: "undoBtn", onclick: "HistoryTools.undo()" },
				"Undo"
			)
		);
		holderDiv.appendChild(createDOMElement("br"));
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{ id: "redoBtn", onclick: "HistoryTools.redo()" },
				"Redo"
			)
		);
	}

	#addShapeTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement("div", { id: "shapeToolsHeader" }, "Shapes")
		);

		for (let tool of ShapeTools.tools) {
			if (!tool.showButton) continue;

			holderDiv.appendChild(
				createInputWithLabel(tool.name, {
					type: "radio",
					id: tool.name.toLowerCase() + "Radio",
					name: "shapeTools",
					onchange: `ShapeTools.selectTool("${tool.name}")`,
				})
			);
		}

		const selectedTool = ShapeTools.selectTool("Path");

		// Check the radio button for the selected tool
		if (selectedTool) {
			document.getElementById(
				selectedTool.name.toLocaleLowerCase() + "Radio"
			).checked = true;
		}
	}
}
