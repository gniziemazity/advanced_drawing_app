class ToolsPanel {
	constructor(holderDiv) {
		this.holderDiv = holderDiv;

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
			createButtonWithIcon({
				id: "saveBtn",
				title: "Save",
				class: "tool-button",
				onclick: "DocumentTools.save()",
				iconName: "save",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "exportBtn",
				title: "Export",
				class: "tool-button",
				onclick: "DocumentTools.do_export()",
				iconName: "export",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "loadBtn",
				title: "Load",
				class: "tool-button",
				onclick: "DocumentTools.load()",
				iconName: "load",
			})
		);
	}

	#addEditingTools(holderDiv) {
		holderDiv.appendChild(
         createButtonWithIcon({
				id: "duplicateBtn",
				title: "Duplicate",
				class: "tool-button",
				onclick: "DocumentTools.duplicate()",
				iconName: "copy",
			})
		);
		holderDiv.appendChild(
         createButtonWithIcon({
				id: "selectAllBtn",
				title: "Select All",
				class: "tool-button",
				onclick: "EditingTools.selectAll()",
				iconName: "select_all",
			})
		);
		holderDiv.appendChild(
         createButtonWithIcon({
				id: "deleteBtn",
				title: "Delete",
				class: "tool-button",
				onclick: "EditingTools.delete()",
				iconName: "trash",
			})
		);
	}

	#addHistoryTools(holderDiv) {
		holderDiv.appendChild(
         createButtonWithIcon({
				id: "undoBtn",
				title: "Undo",
				class: "tool-button",
				onclick: "HistoryTools.undo()",
				iconName: "undo",
			})
		);
		holderDiv.appendChild(
         createButtonWithIcon({
				id: "redoBtn",
				title: "Redo",
				class: "tool-button",
				onclick: "HistoryTools.redo()",
				iconName: "redo",
			})
		);
	}

	#addCanvasTools(holderDiv) {
		for (let tool of CanvasTools.tools) {
			if (!tool.showButton) continue;

			holderDiv.appendChild(
				createRadioWithImage(tool.name, {
					type: "radio",
					class: "radio",
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
		this.holderDiv
			.querySelectorAll(".radio-button-button")
			.forEach((label) => {
				label.style.backgroundColor = "transparent";
			});
		const radio = document.getElementById(tool.name.toLowerCase() + "Radio");
		radio.checked = true;
		const label = this.holderDiv.querySelector(`label[for="${radio.id}"]`);
		label.style.backgroundColor = "var(--highlight-color)";
	}
}
