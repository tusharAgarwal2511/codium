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