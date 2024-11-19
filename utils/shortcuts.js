class Shortcut {
	constructor({ control, key, action }) {
		this.control = control ?? false;
		this.key = key ?? "";
		this.action = action ?? (() => { });
	}

	toString() {
		return `${this.control ? "Ctrl+" : ""}${this.key.toUpperCase()}`;
	}
}

class ShortcutManager {
	constructor(config) {
		this.shortcuts = [];
		if (config) {
			config.forEach((shortcut) => this.addShortcut(new Shortcut(shortcut)));
		}
		document.addEventListener(
			"keydown",
			this.handleShortCutKeysPress.bind(this)
		);
	}

	addShortcut(shortcut) {
		this.shortcuts.push(shortcut);
	}

	removeShortcut(shortcut) {
		this.shortcuts = this.shortcuts.filter((s) => s !== shortcut);
	}

	getShortcut(control, key) {
		return this.shortcuts.find((s) => s.key === key && s.control === control);
	}

	executeShortcut(control, key) {
		const shortcut = this.getShortcut(control, key);
		if (shortcut) {
			shortcut.action();
		}
	}

	handleShortCutKeysPress(e) {
		if (
			Cursor.isEditing || Cursor.inPreEditMode ||
			e.target instanceof HTMLInputElement ||
			e.target instanceof HTMLTextAreaElement
		) {
			return;
		}

		const control = e.ctrlKey || e.metaKey;
		this.executeShortcut(control, e.key);
		e.preventDefault();
	}
}

const shortcutManager = new ShortcutManager([
	{
		control: true,
		key: "u",
		action: () =>
			window.open(
				window.location.pathname.replace("index.html", "") + "test.html",
				"_blank"
			),
	},
]);
