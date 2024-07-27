const shortcuts = [
   { control: false, key: "r", action: selectRectTool },
   { control: false, key: "p", action: selectPathTool },
   { control: false, key: "v", action: selectSelectTool },
   { control: true, key: "z", action: undo },
   { control: true, key: "y", action: redo },
   { control: true, key: "a", action: selectAll },
   { control: true, key: "c", action: copy },
   { control: true, key: "v", action: paste },
   { control: false, key: "Delete", action: deleteSelectedShapes },
];

function isShortcut(control, key) {
   return shortcuts.find((s) => s.key === key && s.control === control);
}

function executeShortcut(control, key) {
   const shortcut = isShortcut(control, key);
   if (shortcut) {
      shortcut.action();
   }
}
