const { contextBridge, ipcRenderer } = require("electron");

// Expose terminal API to renderer process
contextBridge.exposeInMainWorld("terminal", {
  onOutput: (callback) => {
    ipcRenderer.on("terminal-output", (event, data) => callback(data));
  },
  sendInput: (data) => {
    ipcRenderer.send("terminal-input", data);
  },
  resize: (cols, rows) => {
    ipcRenderer.send("terminal-resize", { cols, rows });
  }
});

// Expose file system API to renderer process
contextBridge.exposeInMainWorld("fileSystem", {
  selectFolder: () => ipcRenderer.invoke("fs-select-folder"),
  readDirectory: (path) => ipcRenderer.invoke("fs-read-directory", path),
  readFile: (path) => ipcRenderer.invoke("fs-read-file", path),
  writeFile: (path, content) => ipcRenderer.invoke("fs-write-file", path, content),
  createDirectory: (path) => ipcRenderer.invoke("fs-create-directory", path),
  deleteItem: (path) => ipcRenderer.invoke("fs-delete-item", path),
  renameItem: (oldPath, newPath) => ipcRenderer.invoke("fs-rename-item", oldPath, newPath),
  getCurrentPath: () => ipcRenderer.invoke("fs-get-current-path"),
  watchFile: (path, callback) => {
    ipcRenderer.on(`fs-watch-${path}`, (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners(`fs-watch-${path}`);
  }
});