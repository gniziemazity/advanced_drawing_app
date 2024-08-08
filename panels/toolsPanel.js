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

		for (let key in ShapeTools.tools) {
         if(!ShapeTools.tools[key].showButton) continue;
         
			holderDiv.appendChild(
				createInputWithLabel(key, {
					type: "radio",
					id: key.toLowerCase() + "Radio",
					name: "shapeTools",
					onchange: `ShapeTools.selectTool("${key}")`,
				})
			);
		}

      ShapeTools.selectTool("Path");
	}
}
