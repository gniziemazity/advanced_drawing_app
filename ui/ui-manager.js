class UIManager {
    constructor () {
        if (UIManager.instance) {
            return UIManager.instance
        }
        this.tools = null
        this.toolbars = []
        UIManager.instance = this
    }

    attachTools(tools) {
        if (this.tools) {
            throw new Error("Only one tool can be attached.")
        }
        this.tools = tools
    }

    add(toolbar) {
        this.toolbars.push(toolbar)
    }

    renderAll() {
        if (this.tools) {
            this.tools.render()
        }

        this.toolbars.forEach(toolbar => {
            toolbar.render()
        })
    }
}
