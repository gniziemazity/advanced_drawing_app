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
		for (let tool of DocumentTools.tools) {
			if (!tool.showButton) continue;

			const shortcut = tool.shortcut;
			holderDiv.appendChild(
				createButtonWithIcon({
					id: tool.name + "Btn",
					title: shortcut
						? `${tool.name} (${shortcut.toString()})`
						: tool.name,
					class: "tool-button",
					onclick: tool.func,
					iconName: tool.icon ?? tool.name.toLowerCase(),
				})
			);
		}

		DocumentTools.registerShortcuts();
	}

	#addEditingTools(holderDiv) {
		for (let tool of EditingTools.tools) {
			if (!tool.showButton) continue;

			const shortcut = tool.shortcut;
			holderDiv.appendChild(
				createButtonWithIcon({
					id: tool.name + "Btn",
					title: shortcut
						? `${tool.name} (${shortcut.toString()})`
						: tool.name,
					class: "tool-button",
					onclick: tool.func,
					iconName: tool.icon ?? tool.name.toLowerCase(),
				})
			);
		}

		EditingTools.registerShortcuts();
	}

	#addHistoryTools(holderDiv) {
		for (let tool of HistoryTools.tools) {
			if (!tool.showButton) continue;

			const shortcut = tool.shortcut;
			holderDiv.appendChild(
				createButtonWithIcon({
					id: tool.name + "Btn",
					title: shortcut
						? `${tool.name} (${shortcut.toString()})`
						: tool.name,
					class: "tool-button",
					onclick: tool.func,
					iconName: tool.icon ?? tool.name.toLowerCase(),
				})
			);
		}

		HistoryTools.registerShortcuts();
	}

	#addCanvasTools(holderDiv) {
		for (let tool of CanvasTools.tools) {
			if (!tool.showButton) continue;

			const shortcut = tool.class.getShortcut();
			holderDiv.appendChild(
				createRadioWithImage(
					tool.name,
					shortcut ? `${tool.name} (${shortcut.toString()})` : tool.name,
					{
						type: "radio",
						class: "radio",
						id: tool.name.toLowerCase() + "Radio",
						name: "CanvasTools",
						onchange: () => CanvasTools.selectTool(tool.name),
					}
				)
			);
		}

		const selectedTool = CanvasTools.selectTool("Path");
		this.#selectToolComponent(selectedTool);

		CanvasTools.registerShortcuts();
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
