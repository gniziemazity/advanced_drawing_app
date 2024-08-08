class Button {
    constructor (label, settings = {}) {

        this.settings = settings
        this.selected = settings.selected || false

        this.label = label

        this.clickHandler = null
        this.element = this.createElement()
        this.element.addEventListener('click', this.handleClick.bind(this))

        if (this.selected) {
            setTimeout(() => this.element.click(), 0)
        }
    }

    createElement() {
        const element = document.createElement('div')

        element.classList.add('toolbar')
        element.innerHTML = this.label

        return element
    }

    handleClick(event) {
        if (this.action) {
            this.action(event)
        }
    }

    getElement() {
        return this.element
    }
}
