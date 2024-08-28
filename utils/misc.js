function getSize(points) {
	const minX = Math.min(...points.map((p) => p.x));
	const minY = Math.min(...points.map((p) => p.y));
	const maxX = Math.max(...points.map((p) => p.x));
	const maxY = Math.max(...points.map((p) => p.y));
	return {
		width: maxX - minX,
		height: maxY - minY,
	};
}

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

/**
 * Get the property value of the input element.
 * @param {HTMLElement} element - The property input element
 * @param {string} key - The element attribute
 * @returns
 */
function getProperty(element, key) {
	return Number(element.getAttribute(key));
}

/**
 * Set the property value of the input element.
 * @param {HTMLElement} element - The property input element
 * @param {string} key - The element attribute
 * @param {number} value - The property value
 */
function setProperty(element, key, value) {
	element.setAttribute(key, value);
}

function getNumericValue(element) {
	return Number(element.value);
}

function getValue(element) {
	return element.value;
}

function setValue(element, value) {
	element.value = value;
}

function getAngleBetweenVectors(A, B) {
	return Math.acos(A.dot(B) / (A.magnitude() * B.magnitude()));
}

function getSignedAngleBetweenVectors(A, B) {
	return Math.atan2(A.y, A.x) - Math.atan2(B.y, B.x);
}

function formatAngle(angle) {
	return (angle * 180) / Math.PI;
}
