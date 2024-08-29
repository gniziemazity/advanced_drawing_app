class ToolsPanel {
	constructor(holderDiv) {
		this.#addDocumentTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addEditingTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addHistoryTools(holderDiv);
		holderDiv.appendChild(createDOMElement("hr"));

		this.#addCanvasTools(holderDiv);

		viewport.addEventListener("toolSelected", (e) => {
			this.#selectToolComponent(e.detail);
		});
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
					id: "duplicateBtn",
					title: "Duplicate",
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

	#addHistoryTools(holderDiv) {
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

	#addCanvasTools(holderDiv) {
		for (let tool of CanvasTools.tools) {
			if (!tool.showButton) continue;

			holderDiv.appendChild(
				createInputWithLabel(tool.name, {
					type: "radio",
					id: tool.name.toLowerCase() + "Radio",
					name: "CanvasTools",
					onchange: `CanvasTools.selectTool("${tool.name}")`,
				})
			);
		}

		const selectedTool = CanvasTools.selectTool("Path");
		this.#selectToolComponent(selectedTool);
	}

	#selectToolComponent(tool) {
		document.getElementById(tool.name.toLowerCase() + "Radio").checked = true;
	}
}
