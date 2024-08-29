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

/**
 * Move an item in the list to a new position.
 * @param {Array} list - List of items to update
 * @param {number} fromIndex - Current index of the item in the list
 * @param {number} toIndex - Index of the item to move to in the list
 */
function moveItem(list, fromIndex, toIndex) {
	if (
		fromIndex < 0 ||
		fromIndex >= list.length ||
		toIndex < 0 ||
		toIndex >= list.length
	) {
		throw new Error("Index out of bounds!");
	}

	const [item] = list.splice(fromIndex, 1);

	list.splice(toIndex, 0, item);
}
