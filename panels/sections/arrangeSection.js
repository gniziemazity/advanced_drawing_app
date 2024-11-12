class ArrangeSection extends PanelSection {
	constructor() {
		super("Arrange", { sectionClass: "four_col_grid" });
	}

	addContent(holderDiv) {
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "sendBackBtn",
				onclick: TransformTools.sendToBack,
				title: "Send to Back",
				iconName: "back",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "sendBackwardBtn",
				onclick: TransformTools.sendBackward,
				title: "Send Backward",
				iconName: "bwd",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "bringForwardBtn",
				onclick: TransformTools.bringForward,
				title: "Bring Forward",
				iconName: "fwd",
			})
		);
		holderDiv.appendChild(
			createButtonWithIcon({
				id: "bringFrontBtn",
				onclick: TransformTools.bringToFront,
				title: "Bring to Front",
				iconName: "front",
			})
		);
	}
}
