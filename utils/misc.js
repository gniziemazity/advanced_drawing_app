/** Create a DOM Element
 * @param {string} type - Type of DOM element, eg. 'div', 'input', etc...
 * @param {Array<{ key: string, value: string }>} attributes - Attributes of the element, eg. 'onchange', 'title', etc...
 * @param {string} text - Text for inside the element
 * @returns {HTMLElement} - The created DOM element.
 */
function createDOMElement(type, attributes, text) {
	const element = document.createElement(type);
	if (text) {
		element.innerText = text;
	}
	if (attributes) {
		Object.entries(attributes).forEach(([key, value]) => {
			if (key.indexOf("on") === 0) {
				element.addEventListener(key.substring(2), value);
			} else {
				element.setAttribute(key, value);
			}
		});
	}
	return element;
}

/** Create input with label
 * @param {string} labelText - Text displayed on the label
 * @param {Array<{ key: string, value: string }>} attributes - Attributes of the element, eg. 'onchange', 'title', etc...
 * @returns {HTMLElement} - A div with a label and input elements.
 */
function createInputWithLabel(labelText, attributes) {
	const element = document.createElement("div");
	element.appendChild(
		createDOMElement(
			"label",
			{
				for: attributes["id"] || labelText.toLowerCase(),
				class: attributes["labelClass"],
			},
			labelText
		)
	);
	element.appendChild(
		createDOMElement("input", {
			id: labelText.toLowerCase(),
			title: labelText,
			...attributes,
		})
	);
	return element;
}

function createButtonWithIcon(attributes) {
	const button = createDOMElement("button", attributes);
	const image = new Image();
	image.src = `drawings/icons/${attributes.iconName}.png`;
	image.classList.add("icon");
	button.appendChild(image);
	return button;
}

function createRadioWithImage(iconName, labelText, attributes) {
	const element = document.createElement("div");
	const label = createDOMElement("label", {
		for: attributes["id"] || iconName.toLowerCase(),
		class: "radio-button-button",
	});
	const image = new Image();
	image.src = `drawings/icons/${iconName.toLowerCase()}.png`;
	image.classList.add("icon");
	image.title = attributes.title || labelText;
	label.appendChild(image);

	element.appendChild(label);
	element.appendChild(
		createDOMElement("input", {
			id: labelText.toLowerCase(),
			...attributes,
		})
	);
	return element;
}

function getValue(element) {
	return element.value;
}

function setValue(element, value) {
	element.value = value;
}

function formatAngle(angle) {
	return (angle * 180) / Math.PI;
}

function resizeStage(newWidth, newHeight) {
	STAGE_PROPERTIES.width = newWidth;
	STAGE_PROPERTIES.height = newHeight;
	viewport.resizeStage(newWidth, newHeight);
	viewport.drawShapes();
}

function rotateCanvas(ctx, center, rotation) {
	if (rotation == 0) return;
	ctx.translate(center.x, center.y);
	ctx.rotate(rotation);
	ctx.translate(-center.x, -center.y);
}

class TimeSharer {
	static opRecords = {};

	static run(key, operation, opInterval = 500) {
		if (TimeSharer.opRecords[key]) {
			let opRecord = TimeSharer.opRecords[key];
			if (Date.now() - opRecord.opTime < opRecord.opInterval) {
				const latestOpTime = opRecord.opTime;
				opRecord.latestOp = operation;
				setTimeout(() => {
					if (opRecord.opTime === latestOpTime && opRecord.latestOp) {
						// no operations since so run the last skipped op
						opRecord.latestOp();
						opRecord.latestOp = null; // dedup executing last op
					}
				}, opRecord.opInterval);
				return opRecord.result;
			}
			opRecord.result = operation();
			opRecord.opTime = Date.now();

			return opRecord.result;
		}
		let opRecord = {};
		opRecord.result = operation();
		opRecord.opTime = Date.now();
		opRecord.opInterval = opInterval;
		TimeSharer.opRecords[key] = opRecord;
		return opRecord.result;
	}
}
