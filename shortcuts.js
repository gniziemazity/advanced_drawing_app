const shortcuts = [
   { control: false, key: "r", action: selectRectTool },
   { control: false, key: "p", action: selectPathTool },
   { control: false, key: "v", action: selectSelectTool },
   { control: true, key: "z", action: undo },
   { control: true, key: "a", action: selectAll },
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
