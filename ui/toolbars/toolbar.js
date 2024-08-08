class Toolbar {

    static counter = 0;

    constructor (settings = {}) {
        this.elements = []

        this.id = this.generateUniqueId()

        this.settings = settings

        this.position = this.loadPosition() || this.settings.position || { top: 50, left: 50 }

        this.element = this.createToolElement()

        this.toolsHeader = this.element.querySelector('.toolbars-head')
        this.toolsBody = this.element.querySelector('.toolbars-body')

        this.setPosition(this.position.top, this.position.left)
        this.makeDraggable()

        document.body.appendChild(this.element)
    }

    generateUniqueId() {
        return `toolbars-${Toolbar.counter++}`
    }

    createToolElement() {
        const element = document.createElement('div')

        element.setAttribute('id', this.id)
        element.classList.add('toolbars', 'toolbars-container')

        const toolsHead = document.createElement('div')
        toolsHead.classList.add('toolbars-head')
        element.appendChild(toolsHead)

        const _body = document.createElement('div')
        _body.classList.add('toolbars-body')
        element.appendChild(_body)

        return element
    }

    setPosition(top, left) {
        this.element.style.top = `${top}px`
        this.element.style.left = `${left}px`
        this.savePosition(top, left)
    }

    savePosition(top, left) {
        localStorage.setItem(this.id, JSON.stringify({ top, left }))
    }

    loadPosition() {
        const savedPosition = localStorage.getItem(this.id)
        return savedPosition ? JSON.parse(savedPosition) : null
    }

    makeDraggable() {
        let isDragging = false
        let offsetX, offsetY

        this.toolsHeader.addEventListener('mousedown', (e) => {
            isDragging = true
            offsetX = e.clientX - this.element.getBoundingClientRect().left
            offsetY = e.clientY - this.element.getBoundingClientRect().top
            document.body.style.userSelect = 'none'
        })

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return

            const top = e.clientY - offsetY
            const left = e.clientX - offsetX
            this.setPosition(top, left)
        })

        document.addEventListener('mouseup', () => {
            if (!isDragging) return

            isDragging = false
            document.body.style.userSelect = ''
        })

        this.toolsHeader.ondragstart = () => false
    }

    add(element) {
        this.elements.push(element)
    }

    render() {
        this.elements.forEach(element => {

            this.toolsBody.appendChild(element.getElement())
        })
    }
}
