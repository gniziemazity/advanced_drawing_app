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
    createDOMElement("label", { for: labelText.toLowerCase() }, `${labelText}: `),
  );
  element.appendChild(
    createDOMElement("input", {
      id: labelText.toLowerCase(),
      title: labelText,
      ...attributes,
    }),
  );
  return element;
}