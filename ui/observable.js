const buildProxy = (poj, callback, tree = []) => {
	const getPath = (prop) => tree.concat(prop).join(".");

	return new Proxy(poj, {
		get(target, prop) {
			const value = Reflect.get(...arguments);

			if (
				value &&
				typeof value === "object" &&
				["Array", "Object"].includes(value.constructor.name)
			)
				return buildProxy(value, callback, tree.concat(prop));

			return value;
		},

		set(target, prop, value) {
			if (callback) {
				callback({
					action: "set",
					path: getPath(prop),
					target,
					newValue: value,
					previousValue: Reflect.get(...arguments),
				});
			}
			return Reflect.set(...arguments);
		},

		deleteProperty(target, prop) {
			callback({ action: "delete", path: getPath(prop), target });
			return Reflect.deleteProperty(...arguments);
		},
	});
};

class Observable {
	constructor() {
		this._listeners = [];

		return buildProxy(this, (changed) => {
			this.notify(changed);
		});
	}

	notify(changed) {
		this._listeners.forEach((listener) => listener(changed));
	}

	subscribe(listener) {
		this._listeners.push(listener);
		return listener;
	}

	unsubscribe(listener) {
		this._listeners = this._listeners.filter((x) => x !== listener);
	}
}

class ObservableElement extends HTMLElement {
	constructor() {
		super();
		this.fieldName = this.getAttribute("data-bind");
	}

	applyBindings(instance) {
		this.querySelectorAll("[data-bind]").forEach((elem) => {
			const path = elem.getAttribute("data-bind");
			const obs = instance[path];
			this.bindValue(instance, elem, obs, path);
		});
	}

	removeBindings() {
		this.querySelectorAll("[data-bind]").forEach((elem) => {
			this.unbindValue(elem);
		});
	}

	bindValue(instance, input, observable, path) {
		if (!observable) {
			return;
		}

		input.value = instance[path];
		input.onkeyup = () => this.onKeyUp(input, path, instance);
	}

	unbindValue(input) {
		input.onkeyup = null;
	}

	onKeyUp(input, path, instance) {
		return (instance[path] = +input.value);
	}
}
