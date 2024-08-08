class Tools {

    static counter = 0;

    constructor (settings = {}) {
        this.elements = []

        this.id = this.generateUniqueId()

        this.settings = settings

        this.position = this.loadPosition() || this.settings.position || { top: 50, left: 50 }

        this.element = this.createToolElement()

        this.toolsHeader = this.element.querySelector('.tools-head')
        this.toolsBody = this.element.querySelector('.tools-body')

        this.setPosition(this.position.top, this.position.left)
        this.makeDraggable()

        document.body.appendChild(this.element)
    }

    generateUniqueId() {
        return `tools-${Tools.counter++}`
    }

    createToolElement() {
        const element = document.createElement('div')

        element.setAttribute('id', this.id)
        element.classList.add('tools', 'tools-container')

        const toolsHead = document.createElement('div')
        toolsHead.classList.add('tools-head')
        toolsHead.innerHTML = `<div class="icon"><i class="bx bx-chevrons-right"></i></div><div class="icon"><i class="fa fa-times" aria-hidden="true"></i></div>`

        element.appendChild(toolsHead)
        this.addIconListeners(toolsHead)

        const _body = document.createElement('div')
        _body.classList.add('tools-body')
        element.appendChild(_body)

        return element
    }

    addIconListeners(toolsHead) {
        const icons = toolsHead.querySelectorAll('.icon')

        icons.forEach(icon => {

            icon.addEventListener('click', (event) => {

                const tools = icon.closest('.tools')

                if (event.target.classList.contains('fa-times')) {

                    this.element.remove()
                } else if (event.target.classList.contains('bx-chevrons-right')) {

                    event.target.classList.remove('bx-chevrons-right')
                    event.target.classList.add('bx-chevrons-left')

                    if (tools) {
                        const toolsBody = tools.querySelector('.tools-body')

                        toolsBody.classList.remove('tools-column-1')
                        toolsBody.classList.add('tools-column-2')
                    }
                } else if (event.target.classList.contains('bx-chevrons-left')) {

                    event.target.classList.remove('bx-chevrons-left')
                    event.target.classList.add('bx-chevrons-right')

                    if (tools) {
                        const toolsBody = tools.querySelector('.tools-body')

                        toolsBody.classList.remove('tools-column-2')
                        toolsBody.classList.add('tools-column-1')
                    }
                }
            })
        })
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
