class ColorSelector {
	constructor(
		holderDiv,
		width = 190,
		height = 100,
		hue = 0,
		saturation = 0.5,
		lightness = 0.5,
		showFill = true
	) {
		this.holderDiv = holderDiv;
		this.changeFillCallback = null;

		this.width = width;
		this.height = height;

		this.hue = hue;
		this.saturation = saturation;
		this.lightness = lightness;
		this.showFill = showFill;

		// controls saturation and lightness
		this.slCanvas = document.createElement("canvas");
		this.slCanvas.width = this.width;
		this.slCanvas.height = this.height;
		this.slCanvas.style.width=this.width+"px";
		this.slCanvas.style.height=this.height+"px";

		this.slCtx = this.slCanvas.getContext("2d");
		this.holderDiv.appendChild(this.slCanvas);

		this.outputAndHue = document.createElement("div");
		this.outputAndHue.style.display = "flex";
		this.outputAndHue.style.justifyContent = "space-between";
		this.holderDiv.appendChild(this.outputAndHue);

		this.outputCanvas = document.createElement("canvas");
		this.outputCanvas.width = 30;
		this.outputCanvas.height = 30;
		this.outputAndHue.appendChild(this.outputCanvas);

		this.hueControl = createDOMElement("input", {
			id: "hueControl",
			max: "360",
			min: "0",
			step: "1",
			onchange: (e) => this.#changeHue(e.currentTarget.value),
			oninput: (e) => this.#changeHue(e.currentTarget.value, false),
			title: "Hue",
			type: "range",
			value: this.hue,
		});
		this.outputAndHue.appendChild(this.hueControl);

		this.#generateSLGradient(this.hue, this.slCtx);
		this.#showOutputColor(
			this.hue,
			this.saturation,
			this.lightness,
			this.showFill,
			this.outputCanvas
		);

		this.#addEventListeners();
	}

	get value() {
		let fill = this.getHsl();
		if (fill) {
			fill = hslToHex(...fill);
		}
		return fill;
	}

	set value(value) {
		if (value) {
			this.showFill = true;
			const [h, s, l] = hexToHsl(value);
			this.hue = h;
			this.saturation = s;
			this.lightness = l;
		} else {
			this.showFill = false;
		}
		this.#generateSLGradient(this.hue, this.slCtx);

		this.#showOutputColor(
			this.hue,
			this.saturation,
			this.lightness,
			this.showFill,
			this.outputCanvas
		);
	}

	addEventListener(type, callback) {
		this.changeFillCallback = callback;
	}

	getHsl() {
		if (this.showFill) {
			return [this.hue, this.saturation, this.lightness];
		} else {
			return null;
		}
	}

	#addEventListeners() {
		this.outputCanvas.addEventListener("click", (e) => {
			this.showFill = !this.showFill;
			this.#showOutputColor(
				this.hue,
				this.saturation,
				this.lightness,
				this.showFill,
				this.outputCanvas
			);
			this.changeFillCallback(this.value);
		});

		this.slCanvas.addEventListener("pointerdown", (e) => {
			const updateSL = (e) => this.#updateSL(e);

			updateSL(e);

			this.slCanvas.addEventListener("pointermove", updateSL);
			this.slCanvas.addEventListener("pointerup", () => {
				this.slCanvas.removeEventListener("pointermove", updateSL);
			});
		});
	}

	#updateSL(e) {
		const x = e.offsetX;
		const y = e.offsetY;
		this.saturation = x / this.slCanvas.width;
		const lightnessDecreaseFactor = 1 - (0.5 * x) / this.slCanvas.width;
		this.lightness =
			1 -
			0.5 * (x / this.slCanvas.width) ** 1 -
			(y / this.slCanvas.height) * lightnessDecreaseFactor;

		this.#generateSLGradient(this.hue, this.slCtx);
		this.#showOutputColor(
			this.hue,
			this.saturation,
			this.lightness,
			this.showFill,
			this.outputCanvas
		);

		this.changeFillCallback(this.value);
	}

	#changeHue(value, save = true) {
		this.hue = value;
		this.#generateSLGradient(this.hue, this.slCtx);
		this.#showOutputColor(
			this.hue,
			this.saturation,
			this.lightness,
			this.showFill,
			this.outputCanvas
		);

		this.changeFillCallback(this.value);
	}

	#showOutputColor(hue, saturation, lightness, showFill, canvas) {
		const ctx = canvas.getContext("2d");
		if (showFill) {
			ctx.fillStyle = `hsl(${hue}, ${saturation * 100}%, ${
				lightness * 100
			}%)`;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			ctx.moveTo(0, 0);
			ctx.lineTo(canvas.width, canvas.height);
			ctx.stroke();
		}
	}

	#generateSLGradient(hue, ctx) {
		const { width, height } = ctx.canvas;

		// To-Do speedup this
		const stepSize = 2;
		for (let x = 0; x < width; x += stepSize) {
			for (let y = 0; y < height; y += stepSize) {
				const saturation = x / width;
				const lightnessDecreaseFactor = 1 - (0.5 * x) / width;
				const lightness =
					1 -
					0.5 * (x / width) ** 1 -
					(y / height) * lightnessDecreaseFactor;
				ctx.fillStyle = `hsl(${hue}, ${saturation * 100}%, ${
					lightness * 100
				}%)`;
				ctx.fillRect(x, y, stepSize, stepSize);
			}
		}

		// Warning, inverting the formula must be done again if we change it
		const dotX = this.saturation * width;
		const lightnessDecreaseFactor = 1 - (0.5 * dotX) / width;
		const dotY =
			(-(this.lightness - 1 + 0.5 * (dotX / width) ** 1) /
				lightnessDecreaseFactor) *
			height;

		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.arc(dotX, dotY, 5, 0, 2 * Math.PI);
		ctx.lineWidth = 3;
		ctx.stroke();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.stroke();
	}
}
