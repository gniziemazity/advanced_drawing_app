class Chroma {
	constructor(colorKey = [0, 255, 0], threshold = 140) {
		this.colorKey = colorKey;
		this.threshold = threshold;
		this.cache = null;
	}

	static load(data) {
		return new Chroma(data.colorKey, data.threshold);
	}

	serialize() {
		return {
			type: "Chroma",
			colorKey: this.colorKey,
			threshold: this.threshold,
		};
	}

	apply(img) {
		if (this.cache) {
			if (
				this.cache.prevColorKey == this.colorKey &&
				this.cache.prevThreshold == this.threshold
			) {
				return this.cache.canvas;
			}
		}

		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const imgData = ctx.getImageData(0, 0, img.width, img.height);
		const data = imgData.data;
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];

			if (
				Math.abs(r - this.colorKey[0]) < this.threshold &&
				Math.abs(g - this.colorKey[1]) < this.threshold &&
				Math.abs(b - this.colorKey[2]) < this.threshold
			) {
				imgData.data[i + 3] = 0;
			}
		}
		ctx.putImageData(imgData, 0, 0);
		this.cache = {
			canvas,
			prevColorKey: this.colorKey,
			prevThreshold: this.threshold,
		};
		return canvas;
	}

	getHexColor() {
		return `#${this.colorKey[0]
			.toString(16)
			.padStart(2, "0")}${this.colorKey[1]
			.toString(16)
			.padStart(2, "0")}${this.colorKey[2].toString(16).padStart(2, "0")}`;
	}

	setKeyFromHex(hex, save = true) {
		this.colorKey = [
			parseInt(hex.slice(1, 3), 16),
			parseInt(hex.slice(3, 5), 16),
			parseInt(hex.slice(5, 7), 16),
		];

		viewport.dispatchEvent(
			new CustomEvent("filterChanged", { detail: { save } })
		);
	}

	setThreshold(value, save = true) {
		this.threshold = value;

		viewport.dispatchEvent(
			new CustomEvent("filterChanged", { detail: { save } })
		);
	}
}
