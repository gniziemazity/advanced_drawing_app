class PanelSection {
    constructor(title, {collapsable, visible, sectionClass} = {}) {
        this.title = title;
        this.collapsable = collapsable ?? true;
        this.visible = visible ?? true;
        this.sectionClass = sectionClass ?? '';
        this.section = null;
        this.sectionHeader = null;
        this.sectionContent = null;
        this.#generateSection();
        this.#addEventListeners();
    }

    #generateSection() {
        this.section = createDOMElement("div", {
            style: this.visible ? "" : "display: none",
        });
        this.sectionHeader = createDOMElement("div", {
            class: "panel-head",
        });
        this.sectionHeader.innerText = "▼ " +this.title;
        this.addTitleContent(this.sectionHeader);
        this.sectionContent = createDOMElement("div", {
            class: "panel-section " + this.sectionClass,
        });
        this.addContent(this.sectionContent);
        this.section.appendChild(this.sectionHeader);
        this.section.appendChild(this.sectionContent);
    }

    #addEventListeners() {
        if (this.collapsable) {
            this.sectionHeader.addEventListener("click", this.toggleCollapse.bind(this));
        }
    }

    getSection() {
        return this.section;
    }

    show() {
        if (!this.visible) {
            this.visible = true;
            this.section.style.display = "";
        }
    }

    hide() {
        if (this.visible) {
            this.visible = false;
            this.section.style.display = "none";
        }
    }

    toggleCollapse() {
        if (this.sectionContent.style.display === "none") {
            this.sectionContent.style.display = "";
            this.sectionHeader.innerText = "▼ " +this.title;
        } else {
            this.sectionContent.style.display = "none";
            this.sectionHeader.innerText = "▶ " +this.title;
        }
        this.addTitleContent(this.sectionHeader);
    }

    addContent(holderDiv) {
        throw new Error("PanelSection.addContent() must be implemented by the subclass");
    }

    updateDisplay() {
        throw new Error("PanelSection.updateDisplay() must be implemented by the subclass");
    }

    addTitleContent(holderDiv) {
    }
}