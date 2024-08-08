class PropertiesPanel {

	static counter = 0;

	constructor (settings = {}) {

		this.id = this.generateUniqueId()

		this.settings = settings

		this.position = this.loadPosition() || this.settings.position || { top: 100, left: 700 }

		this.element = this.createPanelElement()

		this.panelHeader = this.element.querySelector('.panel-head')
		this.panelBody = this.element.querySelector('.panel-body')

		this.createPanelProperties()

		this.setPosition(this.position.top, this.position.left)
		this.makeDraggable()

		document.body.appendChild(this.element)

		PropertiesPanel.resetColors()
	}

	generateUniqueId() {
		return `panel-${PropertiesPanel.counter++}`
	}

	createPanelElement() {
		const element = document.createElement('div')

		element.setAttribute('id', this.id)
		element.classList.add('panel', 'panel-container')

		const header = document.createElement('div')
		header.classList.add('panel-head')
		header.innerText = "Properties"
		element.appendChild(header)

		const body = document.createElement('div')
		body.classList.add('panel-body')
		element.appendChild(body)

		return element
	}

	createPanelProperties() {

		this.panelBody.appendChild(
			createInputWithLabel("X", {
				type: "number",
				onchange: "PropertiesPanel.changeX(this.value)",
				id: "xInput",
			})
		)
		this.panelBody.appendChild(
			createInputWithLabel("Y", {
				type: "number",
				onchange: "PropertiesPanel.changeY(this.value)",
				id: "yInput",
			})
		)
		this.panelBody.appendChild(
			createInputWithLabel("Width", {
				type: "number",
				onchange: "PropertiesPanel.changeWidth(this.value)",
				id: "widthInput",
			})
		)
		this.panelBody.appendChild(
			createInputWithLabel("Height", {
				type: "number",
				onchange: "PropertiesPanel.changeHeight(this.value)",
				id: "heightInput",
			})
		)
		this.panelBody.appendChild(
			createInputWithLabel("Constrain", {
				type: "checkbox",
				id: "constrainDimensions",
			})
		)

		let panelElement = document.createElement("div")
		panelElement.classList.add('panel-element')
		panelElement.appendChild(
			createDOMElement("label", { for: 'fillColor' }, `Fill Color `)
		)
		let panelContent = document.createElement("div")
		panelContent.classList.add('panel-content')
		panelContent.appendChild(createDOMElement("input", {
			id: "fillColor",
			onchange: "PropertiesPanel.changeFillColor(this.value)",
			oninput: "PropertiesPanel.previewFillColor(this.value)",
			title: "Fill Color",
			type: "color",
		}))
		panelContent.appendChild(createDOMElement("input", {
			id: "fill",
			checked: true,
			onchange: "PropertiesPanel.changeFill(this.checked)",
			title: "Fill",
			type: "checkbox",
		}))
		panelContent.appendChild(createDOMElement(
			"button",
			{ id: "resetBtn", onclick: "PropertiesPanel.resetColors()" },
			"Reset"
		))
		panelElement.appendChild(panelContent)
		this.panelBody.appendChild(panelElement)

		panelElement = document.createElement("div")
		panelElement.classList.add('panel-element')
		panelElement.appendChild(
			createDOMElement("label", { for: 'strokeColor' }, `Stroke Color `)
		)
		panelContent = document.createElement("div")
		panelContent.classList.add('panel-content')
		panelContent.appendChild(
			createDOMElement("input", {
				id: "strokeColor",
				onchange: "PropertiesPanel.changeStrokeColor(this.value)",
				oninput: "PropertiesPanel.previewStrokeColor(this.value)",
				title: "Stroke Color",
				type: "color",
			})
		)
		panelContent.appendChild(
			createDOMElement("input", {
				id: "stroke",
				checked: true,
				onchange: "PropertiesPanel.changeStroke(this.checked)",
				title: "Stroke",
				type: "checkbox",
			})
		)
		panelContent.appendChild(
			createDOMElement(
				"button",
				{ id: "swapBtn", onclick: "PropertiesPanel.swapColors()" },
				"Swap"
			)
		)
		panelElement.appendChild(panelContent)
		this.panelBody.appendChild(panelElement)

		panelElement = document.createElement("div")
		panelElement.classList.add('panel-element')
		panelElement.appendChild(
			createDOMElement("label", { for: 'strokeWidth' }, `Stroke Width `)
		)
		panelContent = document.createElement("div")
		panelContent.classList.add('panel-content')
		panelContent.appendChild(
			createDOMElement("input", {
				id: "strokeWidth",
				max: "100",
				min: "1",
				onchange: "PropertiesPanel.changeStrokeWidth(this.value)",
				oninput: "PropertiesPanel.previewStrokeWidth(this.value)",
				title: "Stroke Width",
				type: "range",
				value: "5",
			})
		)
		panelElement.appendChild(panelContent)
		this.panelBody.appendChild(panelElement)

		panelElement = document.createElement("div")
		panelElement.classList.add('panel-element')
		panelElement.appendChild(
			createDOMElement("label", { for: 'text' }, `Text `)
		)
		panelContent = document.createElement("div")
		panelContent.classList.add('panel-content')
		panelContent.appendChild(
			createDOMElement("input", {
				id: "text",
				oninput: "PropertiesPanel.changeText(this.value)",
				title: "Stroke Width",
				type: "text",
				value: "TEST",
			})
		)
		panelElement.appendChild(panelContent)
		this.panelBody.appendChild(panelElement)
	}

	setPosition(top, left) {
		this.element.style.top = `${top}px`
		this.element.style.left = `${left}px`
		this.savePosition(top, left)
	}

	savePosition(top, left) {
		localStorage.setItem(this.id, JSON.stringify({ top, left }))
	}

	loadPosition() {
		const savedPosition = localStorage.getItem(this.id)
		return savedPosition ? JSON.parse(savedPosition) : null
	}

	makeDraggable() {
		let isDragging = false
		let offsetX, offsetY

		this.panelHeader.addEventListener('mousedown', (e) => {
			isDragging = true
			offsetX = e.clientX - this.element.getBoundingClientRect().left
			offsetY = e.clientY - this.element.getBoundingClientRect().top
			document.body.style.userSelect = 'none'
		})

		document.addEventListener('mousemove', (e) => {
			if (!isDragging) return

			const top = e.clientY - offsetY
			const left = e.clientX - offsetX
			this.setPosition(top, left)
		})

		document.addEventListener('mouseup', () => {
			if (!isDragging) return

			isDragging = false
			document.body.style.userSelect = ''
		})

		this.panelHeader.ondragstart = () => false
	}

	static changeX(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.center.x = Number(value) + STAGE_PROPERTIES.left))

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static changeY(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.center.y = Number(value) + STAGE_PROPERTIES.top))

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static changeWidth(value) {
		const newWidth = Math.max(Number(value), 1)
		let newHeight = 0

		shapes
			.filter((s) => s.selected)
			.forEach((s) => {
				const currentWidth = s.size.width
				const currentHeight = s.size.height
				newHeight = currentHeight
				if (constrainDimensions.checked) {
					const aspectRatio = currentWidth / currentHeight
					const constrainedHeight = newWidth / aspectRatio
					newHeight = constrainedHeight
				}
				s.setSize(newWidth, newHeight)
			})

		setValue(widthInput, Math.round(newWidth))
		if (getValue(heightInput) != "") {
			setValue(heightInput, Math.round(newHeight))
		}

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static changeHeight(value) {
		const newHeight = Math.max(Number(value), 1)
		let newWidth = 0

		shapes
			.filter((s) => s.selected)
			.forEach((s) => {
				const currentWidth = s.size.width
				const currentHeight = s.size.height
				newWidth = currentWidth
				if (constrainDimensions.checked) {
					const aspectRatio = currentWidth / currentHeight
					const constrainedWidth = newHeight * aspectRatio
					newWidth = constrainedWidth
				}
				s.setSize(newWidth, newHeight)
			})

		setValue(heightInput, Math.round(newHeight))
		if (getValue(widthInput) != "") {
			setValue(widthInput, Math.round(newWidth))
		}

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static previewFillColor(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.fillColor = value))

		viewport.drawShapes(shapes)
	}

	static changeFillColor(value) {
		PropertiesPanel.previewFillColor(value)
		HistoryTools.record(shapes)
	}

	static changeFill(value) {
		shapes.filter((s) => s.selected).forEach((s) => (s.options.fill = value))

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static previewStrokeColor(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.strokeColor = value))

		viewport.drawShapes(shapes)
	}

	static changeStrokeColor(value) {
		PropertiesPanel.previewStrokeColor(value)
		HistoryTools.record(shapes)
	}

	static changeStroke(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.stroke = value))

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static previewStrokeWidth(value) {
		shapes
			.filter((s) => s.selected)
			.forEach((s) => (s.options.strokeWidth = Number(value)))

		viewport.drawShapes(shapes)
	}

	static changeStrokeWidth(value) {
		PropertiesPanel.previewStrokeWidth(value)
		HistoryTools.record(shapes)
	}

	static changeText(value) {
		shapes
			.filter((s) => s.selected && s.text !== undefined)
			.forEach((s) => s.setText(value))

		HistoryTools.record(shapes)
		viewport.drawShapes(shapes)
	}

	static resetColors() {
		fillColor.value = "#ffffff"
		strokeColor.value = "#000000"
		PropertiesPanel.changeFillColor(fillColor.value)
		PropertiesPanel.changeStrokeColor(strokeColor.value)
	}

	static swapColors() {
		const fillStyle = fillColor.value
		const strokeStyle = strokeColor.value

		fillColor.value = strokeStyle
		strokeColor.value = fillStyle

		PropertiesPanel.changeFillColor(fillColor.value)
		PropertiesPanel.changeStrokeColor(strokeColor.value)
	}

	static reset() {
		xInput.value = ""
		yInput.value = ""
		widthInput.value = ""
		heightInput.value = ""
		text.value = ""
		xInput.placeholder = ""
		yInput.placeholder = ""
		widthInput.placeholder = ""
		heightInput.placeholder = ""
	}

	static getValues() {
		return {
			fillColor: fillColor.value,
			strokeColor: strokeColor.value,
			fill: fill.checked,
			stroke: stroke.checked,
			strokeWidth: Number(strokeWidth.value),
			lineCap: "round",
			lineJoin: "round",
		}
	}

	static updateDisplay(selectedShapes) {
		if (selectedShapes.length === 0) {
			PropertiesPanel.reset()
			return
		}

		let newProperties = null
		for (const shape of selectedShapes) {
			if (newProperties === null) {
				newProperties = {
					x: shape.center.x - STAGE_PROPERTIES.left,
					y: shape.center.y - STAGE_PROPERTIES.top,
					width: shape.size.width,
					height: shape.size.height,
					fillColor: shape.options.fillColor,
					fill: shape.options.fill,
					strokeColor: shape.options.strokeColor,
					stroke: shape.options.stroke,
					strokeWidth: shape.options.strokeWidth,
					text: shape.text,
				}
			} else {
				if (newProperties.x !== shape.center.x - STAGE_PROPERTIES.left) {
					newProperties.x = null
				}
				if (newProperties.y !== shape.center.y - STAGE_PROPERTIES.top) {
					newProperties.y = null
				}
				if (newProperties.width !== shape.size.width) {
					newProperties.width = null
				}
				if (newProperties.height !== shape.size.height) {
					newProperties.height = null
				}
				if (newProperties.fillColor !== shape.options.fillColor) {
					newProperties.fillColor = null
				}
				if (newProperties.fill !== shape.options.fill) {
					newProperties.fill = null
				}
				if (newProperties.strokeColor !== shape.options.strokeColor) {
					newProperties.strokeColor = null
				}
				if (newProperties.stroke !== shape.options.stroke) {
					newProperties.stroke = null
				}
				if (newProperties.strokeWidth !== shape.options.strokeWidth) {
					newProperties.strokeWidth = null
				}
				if (newProperties.text !== shape.text) {
					newProperties.text = null
				}
			}
		}
		if (newProperties === null) {
			return
		} else {
			xInput.value = newProperties.x ? Math.round(newProperties.x) : ""
			yInput.value = newProperties.y ? Math.round(newProperties.y) : ""
			widthInput.value = newProperties.width
				? Math.round(newProperties.width)
				: ""
			heightInput.value = newProperties.height
				? Math.round(newProperties.height)
				: ""
			fillColor.value = newProperties.fillColor
				? newProperties.fillColor
				: ""
			fill.checked = newProperties.fill ? newProperties.fill : false
			strokeColor.value = newProperties.strokeColor
				? newProperties.strokeColor
				: ""
			stroke.checked = newProperties.stroke ? newProperties.stroke : false
			strokeWidth.value = newProperties.strokeWidth
				? newProperties.strokeWidth
				: ""
			text.value = newProperties.text ? newProperties.text : ""

			const placeholderText = "Multiple Values"
			xInput.placeholder = newProperties.x ? "" : placeholderText
			yInput.placeholder = newProperties.y ? "" : placeholderText
			widthInput.placeholder = newProperties.width ? "" : placeholderText
			heightInput.placeholder = newProperties.height ? "" : placeholderText
			fillColor.placeholder = newProperties.fillColor ? "" : placeholderText
			fill.placeholder = newProperties.fill ? "" : placeholderText
			strokeColor.placeholder = newProperties.strokeColor
				? ""
				: placeholderText
			stroke.placeholder = newProperties.stroke ? "" : placeholderText
			strokeWidth.placeholder = newProperties.strokeWidth
				? ""
				: placeholderText
			text.placeholder = newProperties.text ? "" : placeholderText
		}
	}
}
