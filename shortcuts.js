const shortcuts = []

const shortcutR = {control: false, key: "r", action: selectRectTool}
const shortcutP = {control: false, key: "p", action: selectPathTool}
const shortcutSpace = {control: false, key: " ", action: selectSelectTool}
const shortcutUndo = {control: true, key: "z", action: undo}

shortcuts.push(shortcutP, shortcutR, shortcutSpace, shortcutUndo)

function isShortcut(control, key) {
    console.log(control, key)
    return shortcuts.find((s) => s.key === key && s.control === control)
}

function executeShortcut(control, key) {
    const shortcut = isShortcut(control, key)
    if(shortcut) {
        shortcut.action();
    }
}
