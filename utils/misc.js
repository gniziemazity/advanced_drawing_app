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
			element.setAttribute(key, value);
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
			{ for: attributes["id"] || labelText.toLowerCase() },
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

function getValue(element) {
	return element.value;
}

function setValue(element, value) {
	element.value = value;
}

function formatAngle(angle) {
	return (angle * 180) / Math.PI;
}

function makeSpace(length) {
	let str = ""
	for (let i = 0; i < length; i++) {
		str += String.fromCharCode(8202) // append thin space
	}
	return str
}

function resizeStage(newWidth, newHeight) {
   STAGE_PROPERTIES.width = newWidth;
   STAGE_PROPERTIES.height = newHeight;
   viewport.resizeStage(newWidth, newHeight);
   viewport.drawShapes();
}