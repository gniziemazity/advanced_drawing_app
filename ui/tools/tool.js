class Tool {
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

        element.classList.add('tool')
        element.innerHTML = this.label

        return element
    }

    handleClick(event) {
        this.clearActiveState()
        this.element.classList.toggle('tool-active')

        if (this.action) {
            this.action(event)
        }
    }

    clearActiveState() {
        document.querySelectorAll('.tool').forEach(item => {
            item.classList.remove('tool-active')
        })
    }

    getElement() {
        return this.element
    }
}
