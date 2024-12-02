class ColorSelector {
	constructor({
		width = 280,
		height = 150,
		color = "#000000FF",
		showFill = true,
	} = {}) {
		this.visible = false;
		this.activeInput = null;

		//ColorSelector is added once to the DOM and reused on every color picker, since you will only have one active at the time
		this.holderDiv = createDOMElement("div", { id: "colorSelector" });
		document.body.appendChild(this.holderDiv);
		this.holderDiv.style.display = "none";

		this.width = width;
		this.height = height;

		// Canvas that displays gradient based on saturation and value, and allows to pick color
		this.svCanvas = createDOMElement("canvas", {
			width: this.width,
			height: this.height,
		});
		this.svCanvas.style.width = this.width + "px";
		this.svCanvas.style.height = this.height + "px";
		this.holderDiv.appendChild(this.svCanvas);
		this.svCtx = this.svCanvas.getContext("2d");

		// Seperate canvas for generating the gradient, only when hue changes
		this.svCanvasGenerate = createDOMElement("canvas", {
			width: this.width,
			height: this.height,
		});
		this.svCanvasGenerate.style.width = this.width + "px";
		this.svCanvasGenerate.style.height = this.height + "px";
		this.svCtxGenerate = this.svCanvasGenerate.getContext("2d");

		const previewAndSliders = createDOMElement("div");
		previewAndSliders.style.display = "flex";
		previewAndSliders.style.gap = "10px";
		this.holderDiv.appendChild(previewAndSliders);

		this.colorPreview = new ColorElement({ width: 32, height: 32, color });
		this.colorPreview.style.marginTop = "2px";
		previewAndSliders.appendChild(this.colorPreview);

		const sliders = createDOMElement("div");
		sliders.style.display = "flex";
		sliders.style.flexDirection = "column";
		sliders.style.flexGrow = "1";
		sliders.style.gap = "1px";

		previewAndSliders.appendChild(sliders);

		//Hue and alpha sliders could be separate components with nice gradient backgrounds, but for now they are simple range inputs
		this.hueControl = createDOMElement("input", {
			id: "hueControl",
			max: "359",
			min: "0",
			step: "1",
			onchange: (e) => this.#changeHue(e.currentTarget.value),
			oninput: (e) => this.#changeHue(e.currentTarget.value, false),
			title: "Hue",
			type: "range",
		});
		this.hueControl.style.width = "100%";
		this.hueControl.style.margin = "0";
		this.hueControl.style.padding = "0";
		sliders.appendChild(this.hueControl);

		this.alphaControl = createDOMElement("input", {
			id: "alphaControl",
			max: "1",
			min: "0",
			step: "0.01",
			onchange: (e) => this.#changeAlpha(e.currentTarget.value),
			oninput: (e) => this.#changeAlpha(e.currentTarget.value, false),
			title: "Alpha",
			type: "range",
		});
		this.alphaControl.style.width = "100%";
		this.alphaControl.style.margin = "0";
		this.alphaControl.style.padding = "0";
		sliders.appendChild(this.alphaControl);

		const colorControl = createDOMElement("div");
		colorControl.style.display = "flex";
		colorControl.style.justifyContent = "space-between";
		colorControl.style.gap = "2px";
		this.holderDiv.appendChild(colorControl);

		const hueWrapper = createDOMElement("div");
		hueWrapper.style.display = "flex";
		hueWrapper.style.flexDirection = "column";
		hueWrapper.innerHTML = "Hex";

		this.hexInput = createDOMElement("input", {
			id: "hexInput",
			onchange: this.#inputHexChange.bind(this),
			oninput: this.#inputHexChange.bind(this),
			title: "Hex",
		});
		hueWrapper.appendChild(this.hexInput);
		colorControl.appendChild(hueWrapper);

		this.rInput = createDOMElement("input", {
			id: "colorR",
			type: "number",
			min: "0",
			max: "255",
			step: "1",
			onchange: this.#inputRgbaChange.bind(this),
			oninput: this.#inputRgbaChange.bind(this),
			title: "R",
		});
		const rWrapper = hueWrapper.cloneNode(true);
		rWrapper.innerHTML = "R";
		rWrapper.appendChild(this.rInput);
		colorControl.appendChild(rWrapper);

		this.gInput = createDOMElement("input", {
			id: "colorG",
			type: "number",
			min: "0",
			max: "255",
			step: "1",
			onchange: this.#inputRgbaChange.bind(this),
			oninput: this.#inputRgbaChange.bind(this),
			title: "G",
		});
		const gWrapper = hueWrapper.cloneNode(true);
		gWrapper.innerHTML = "G";
		gWrapper.appendChild(this.gInput);
		colorControl.appendChild(gWrapper);

		this.bInput = createDOMElement("input", {
			id: "colorB",
			type: "number",
			min: "0",
			max: "255",
			step: "1",
			onchange: this.#inputRgbaChange.bind(this),
			oninput: this.#inputRgbaChange.bind(this),
			title: "B",
		});
		const bWrapper = hueWrapper.cloneNode(true);
		bWrapper.innerHTML = "B";
		bWrapper.appendChild(this.bInput);
		colorControl.appendChild(bWrapper);

		this.aInput = createDOMElement("input", {
			id: "colorA",
			type: "number",
			min: "0",
			max: "1",
			step: "0.01",
			onchange: this.#inputRgbaChange.bind(this),
			oninput: this.#inputRgbaChange.bind(this),
			title: "A",
		});
		const aWrapper = hueWrapper.cloneNode(true);
		aWrapper.innerHTML = "A";
		aWrapper.appendChild(this.aInput);
		colorControl.appendChild(aWrapper);

		this.showFill = showFill;
		this.color = { hex: color };

		this.#addEventListeners();
	}

	get color() {
		if (!this.showFill) {
			return null;
		}
		return this.hex;
	}

	//Color can be set either with hex, rgba or hsv
	set color({
		hex = null,
		r = null,
		g = null,
		b = null,
		a = null,
		h = null,
		s = null,
		v = null,
	}) {
		const oldHue = this.hue;
		if (hex !== null) {
			this.showFill = true;
			const [r, g, b, a] = this.#hex2Rgba(hex);
			const [h, s, v] = this.#rgb2hsv(r, g, b);
			this.hex = hex;
			this.r = r;
			this.g = g;
			this.b = b;
			this.alpha = a;
			this.hue = h;
			this.saturation = s;
			this.value = v;
		} else if (r !== null && g !== null && b !== null && a !== null) {
			this.showFill = true;
			const [h, s, v] = this.#rgb2hsv(r, g, b);
			this.hex = this.#rgba2hex(r, g, b, a);
			this.r = r;
			this.g = g;
			this.b = b;
			this.alpha = a;
			this.hue = h;
			this.saturation = s;
			this.value = v;
		} else if (h !== null && s !== null && v !== null && a !== null) {
			this.showFill = true;
			const [r, g, b] = this.#hsv2rgb(h, s, v);
			this.hex = this.#rgba2hex(r, g, b, a);
			this.r = r;
			this.g = g;
			this.b = b;
			this.alpha = a;
			this.hue = h;
			this.saturation = s;
			this.value = v;
		} else {
			this.showFill = false;
		}

		if (oldHue !== this.hue) {
			this.#generateSVGradient();
		}
		this.#redrawSvGradient();
		this.#showOutputColor();
	}

	//This is called by the colorInput element that has been clicked to show the color selector
	show(caller) {
		//If same input is clicked, we just close the color selector
		if (this.activeInput === caller) {
			this.activeInput = null;
			this.hide();
			return;
		}
		this.visible = true;
		this.activeInput = caller;
		this.holderDiv.style.display = "block";
		this.holderDiv.style.position = "absolute";
		const box = caller.getBoundingClientRect();
		const selfBox = this.holderDiv.getBoundingClientRect();
		this.holderDiv.style.top = `${box.top + box.height}px`;
		this.holderDiv.style.left = `${box.right - selfBox.width}px`;
		this.color = { hex: caller.getColor() };
	}

	hide() {
		this.visible = false;
		this.holderDiv.style.display = "none";
	}

	#updateColorFromHSV() {
		this.color = {
			h: this.hue,
			s: this.saturation,
			v: this.value,
			a: this.alpha,
		};
	}

	#addEventListeners() {
		this.colorPreview.addEventListener("click", (e) => {
			this.showFill = !this.showFill;
			this.#showOutputColor();
		});

		this.svCanvas.addEventListener("pointerdown", (e) => {
			const updateSV = (e) => this.#updateSV(e);

			updateSV(e, true);

			//Using document here, to be able to drag smoother outside the canvas
			document.addEventListener("pointermove", updateSV);
			document.addEventListener("pointerup", () => {
				document.removeEventListener("pointermove", updateSV);
			});
		});

		document.addEventListener("pointerdown", (e) => {
			if (!this.holderDiv.contains(e.target) && this.visible) {
				this.hide();
			}
		});
	}

	#updateSV(e) {
		const rect = this.svCanvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		if (x > rect.width) {
			x = rect.width;
		}
		if (x < 0) {
			x = 0;
		}
		if (y > rect.height) {
			y = rect.height;
		}
		if (y < 0) {
			y = 0;
		}
		this.saturation = x / this.svCanvas.width;
		this.value = 1 - y / this.svCanvas.height;

		this.#updateColorFromHSV();
		this.#redrawSvGradient();
		this.#showOutputColor();
	}

	#changeHue(value, save = true) {
		this.hue = value;
		this.#updateColorFromHSV();
		this.#generateSVGradient();
		this.#redrawSvGradient();
		this.#showOutputColor();
	}

	#changeAlpha(value, save = true) {
		this.alpha = value;
		this.color = { r: this.r, g: this.g, b: this.b, a: this.alpha };
		this.#showOutputColor();
	}

	#showOutputColor() {
		this.rInput.value = this.r;
		this.gInput.value = this.g;
		this.bInput.value = this.b;
		this.aInput.value = this.alpha;
		this.hexInput.value = this.hex.toLowerCase();
		this.hueControl.value = this.hue;
		this.alphaControl.value = this.alpha;
		this.colorPreview.updateColor(this.color);
		if (this.activeInput) {
			this.activeInput.setColor(this.color);
		}
	}

	#redrawSvGradient() {
		const ctx = this.svCtx;
		ctx.drawImage(
			this.svCanvasGenerate,
			0,
			0,
			this.svCanvas.width,
			this.svCanvas.height
		);
		// Warning, inverting the formula must be done again if we change it
		const dotX = this.saturation * this.svCanvas.width;
		const dotY = (1 - this.value) * this.svCanvas.height;

		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	#generateSVGradient() {
		const ctx = this.svCtxGenerate;
		const { width, height } = ctx.canvas;

		// To-Do speedup this
		const stepSize = 2;
		for (let x = 0; x < width; x += stepSize) {
			for (let y = 0; y < height; y += stepSize) {
				const saturation = x / width;
				const value = 1 - y / height;
				const color = this.#rgba2hex(
					...this.#hsv2rgb(this.hue, saturation, value),
					1
				);
				ctx.fillStyle = color;
				ctx.fillRect(x, y, stepSize, stepSize);
			}
		}

		this.#redrawSvGradient();
	}

	#inputHexChange(e) {
		const hex = e.currentTarget.value;
		if (hex.length !== 4 && hex.length !== 7 && hex.length !== 9) {
			return;
		}
		if (!/^#[0-9A-F]+$/i.test(hex)) {
			return;
		}

		let newColor = this.color;
		if (hex.length === 4) {
			newColor =
				"#" +
				hex.slice(1, 2) +
				hex.slice(1, 2) +
				hex.slice(2, 3) +
				hex.slice(2, 3) +
				hex.slice(3) +
				hex.slice(3) +
				"FF";
		}
		if (hex.length === 7) {
			newColor = hex + "FF";
		} else if (hex.length === 9) {
			newColor = hex;
		}
		this.color = { hex: newColor };
		this.hexInput.value = hex;
	}

	#inputRgbaChange(e) {
		const r = parseInt(this.rInput.value);
		const g = parseInt(this.gInput.value);
		const b = parseInt(this.bInput.value);
		const a = parseFloat(this.aInput.value);
		this.color = { r, g, b, a };
	}

	#hsv2rgb(h, s, v) {
		let f = (n, k = (n + h / 60) % 6) =>
			v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
		return [
			Math.round(f(5) * 255),
			Math.round(f(3) * 255),
			Math.round(f(1) * 255),
		];
	}

	#rgb2hsv(r, g, b) {
		r /= 255;
		g /= 255;
		b /= 255;
		let v = Math.max(r, g, b),
			c = v - Math.min(r, g, b);
		let h =
			c &&
			(v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
		return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
	}

	#rgba2hex(r, g, b, a) {
		return `#${((r << 16) + (g << 8) + b)
			.toString(16)
			.toLowerCase()
			.padStart(6, "0")}${Math.round(a * 255)
			.toString(16)
			.toLowerCase()
			.padStart(2, "0")}`;
	}

	#hex2Rgba(hex) {
		const hexValue = hex.slice(1);
		const r = parseInt(hexValue.slice(0, 2), 16);
		const g = parseInt(hexValue.slice(2, 4), 16);
		const b = parseInt(hexValue.slice(4, 6), 16);
		const a = Math.round(parseInt(hexValue.slice(6, 8), 16) / 2.55) / 100;
		return [r, g, b, a];
	}
}
