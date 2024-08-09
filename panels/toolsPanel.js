class ToolsPanel {
	constructor(holderDiv) {
		this.#addDocumentTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addEditingTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.addHistoryTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addShapeTools(holderDiv);
	}

	#addDocumentTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "saveBtn",
					title: "Save",
					class: "tool-button",
					onclick: "DocumentTools.save()",
				},
				"💾"
			)
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "loadBtn",
					title: "Load",
					class: "tool-button",
					onclick: "DocumentTools.load()",
				},
				"📁"
			)
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "exportBtn",
					title: "Export",
					class: "tool-button",
					onclick: "DocumentTools.do_export()",
				},
				"🖼️"
			)
		);
	}

	#addEditingTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "copyBtn",
					title: "Copy",
					class: "tool-button",
					onclick: "EditingTools.duplicate()",
				},
				"🗐"
			)
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "selectAllBtn",
					title: "Select All",
					class: "tool-button",
					onclick: "EditingTools.selectAll()",
				},
				"▭"
			)
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "deleteBtn",
					title: "Delete",
					class: "tool-button",
					onclick: "EditingTools.delete()",
				},
				"🗑️"
			)
		);
	}

	addHistoryTools(holderDiv) {
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "undoBtn",
					title: "Undo",
					class: "tool-button",
					onclick: "HistoryTools.undo()",
				},
				"↩️"
			)
		);
		holderDiv.appendChild(
			createDOMElement(
				"button",
				{
					id: "redoBtn",
					title: "Redo",
					class: "tool-button",
					onclick: "HistoryTools.redo()",
				},
				"↪️"
			)
		);
	}

	#addShapeTools(holderDiv) {
		for (let key in ShapeTools.tools) {
			if (!ShapeTools.tools[key].showButton) continue;

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
